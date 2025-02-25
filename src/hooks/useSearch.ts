import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { SearchResult, validateSearchResult } from "@/types/dictionary";
import { AuthError } from "@/lib/auth/auth";

interface CacheItem {
  data: SearchResult[];
  timestamp: number;
}

interface SearchHistoryItem {
  term: string;
  timestamp: number;
  count: number;
}

class SearchCache {
  private cache: Map<string, CacheItem>;
  private readonly maxSize: number;
  private readonly expirationTime: number;

  constructor(maxSize: number = 100, expirationTimeMinutes: number = 30) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.expirationTime = expirationTimeMinutes * 60 * 1000;
  }

  get(key: string): SearchResult[] | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > this.expirationTime) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: SearchResult[]): void {
    if (this.cache.size >= this.maxSize) {
      const oldestEntry = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
      if (oldestEntry) {
        this.cache.delete(oldestEntry[0]);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

class SearchHistory {
  private readonly maxSize: number;
  private readonly storageKey: string = "search_history";

  constructor(maxSize: number = 20) {
    this.maxSize = maxSize;
  }

  getHistory(): SearchHistoryItem[] {
    try {
      const history = localStorage.getItem(this.storageKey);
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  addSearch(term: string): void {
    try {
      const history = this.getHistory();
      const existingItem = history.find(item => item.term === term);
      
      let newHistory: SearchHistoryItem[];
      
      if (existingItem) {
        newHistory = history.map(item => 
          item.term === term 
            ? { ...item, count: item.count + 1, timestamp: Date.now() }
            : item
        );
      } else {
        newHistory = [
          { term, timestamp: Date.now(), count: 1 },
          ...history,
        ].slice(0, this.maxSize);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(newHistory));
    } catch {
    }
  }

  removeSearch(term: string): void {
    try {
      const history = this.getHistory();
      const newHistory = history.filter(item => item.term !== term);
      localStorage.setItem(this.storageKey, JSON.stringify(newHistory));
    } catch {
    }
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
    }
  }

  exportHistory(): string {
    const history = this.getHistory();
    return JSON.stringify(history);
  }

  importHistory(jsonString: string): void {
    try {
      const importedHistory = JSON.parse(jsonString);
      if (Array.isArray(importedHistory) && 
          importedHistory.every(item => 
            typeof item.term === "string" && 
            typeof item.timestamp === "number" &&
            typeof item.count === "number"
          )) {
        localStorage.setItem(this.storageKey, jsonString);
      } else {
        throw new Error("잘못된 형식의 검색 기록입니다.");
      }
    } catch {
    }
  }

  getSuggestions(query: string): string[] {
    if (!query.trim()) return [];
    
    const history = this.getHistory();
    return history
      .filter(item => item.term.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.count - a.count)
      .map(item => item.term)
      .slice(0, 5);
  }
}

const searchCache = new SearchCache(100, 30);
const searchHistory = new SearchHistory(20);

export const useSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const [searchQuery, setSearchQuery] = useState("");
  const [displayedQuery, setDisplayedQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistoryItems, setSearchHistoryItems] = useState<SearchHistoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);

  useEffect(() => {
    if (query?.trim()) {
      setSearchQuery(query);
      setDisplayedQuery(query);
      
      const cachedResults = searchCache.get(query);
      if (cachedResults) {
        setSearchResult(cachedResults);
      } else {
        handleSearch(query);
      }
    } else {
      setSearchResult([]);
      setError(null);
      setIsSearching(false);
    }
  }, [query]);

  useEffect(() => {
    setSearchHistoryItems(searchHistory.getHistory());
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const newSuggestions = searchHistory.getSuggestions(searchQuery);
      setSuggestions(newSuggestions);
      setSelectedSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }
  }, [searchQuery]);

  const handleSearch = useCallback(
    async (searchTerm: string = searchQuery) => {
      if (!searchTerm.trim() || isSearching) return;

      setIsSearching(true);
      setError(null);

      try {
        searchHistory.addSearch(searchTerm);
        setSearchHistoryItems(searchHistory.getHistory());
        setSuggestions([]);

        if (searchTerm !== query) {
          await router.push(`/?q=${encodeURIComponent(searchTerm)}`, { scroll: false });
        }

        const cachedResults = searchCache.get(searchTerm);
        if (cachedResults) {
          setSearchResult(cachedResults);
          return;
        }

        const response = await api.get(
          `/dictionary/search/?q=${encodeURIComponent(searchTerm)}&refresh=true&required=true`
        );

        if (!response.data || !response.data.learners_entries) {
          throw new Error("잘못된 응답 데이터 형식");
        }

        if (!Array.isArray(response.data.learners_entries)) {
          throw new Error("잘못된 응답 데이터 형식");
        }

        const validEntries = response.data.learners_entries.filter(validateSearchResult);
        
        setSearchResult(validEntries.length > 0 ? validEntries : []);
        if (validEntries.length > 0) {
          searchCache.set(searchTerm, validEntries);
        }
      } catch (error) {
        if (error instanceof AuthError) {
          setError(error.message);
        } else {
          setError("검색 중 오류가 발생했습니다.");
        }
        setSearchResult([]);
      } finally {
        setIsSearching(false);
      }
    },
    [router, searchQuery, query, isSearching]
  );

  const removeSearchItem = useCallback((term: string) => {
    searchHistory.removeSearch(term);
    setSearchHistoryItems(searchHistory.getHistory());
  }, []);

  const clearSearchHistory = useCallback(() => {
    searchHistory.clearHistory();
    setSearchHistoryItems([]);
  }, []);

  const exportSearchHistory = useCallback(() => {
    const jsonString = searchHistory.exportHistory();
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "search-history.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const importSearchHistory = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        searchHistory.importHistory(content);
        setSearchHistoryItems(searchHistory.getHistory());
      }
    };
    reader.readAsText(file);
  }, []);

  const resetSearch = useCallback(() => {
    setSearchQuery("");
    setDisplayedQuery("");
    setSearchResult([]);
    setError(null);
    setIsSearching(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (suggestions.length > 0) {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setSelectedSuggestionIndex(prev => 
              prev < suggestions.length - 1 ? prev + 1 : 0
            );
            break;
          case "ArrowUp":
            e.preventDefault();
            setSelectedSuggestionIndex(prev => 
              prev > 0 ? prev - 1 : suggestions.length - 1
            );
            break;
          case "Enter":
            if (selectedSuggestionIndex >= 0) {
              handleSearch(suggestions[selectedSuggestionIndex]);
            } else {
              handleSearch();
            }
            break;
          case "Escape":
            setSuggestions([]);
            setSelectedSuggestionIndex(-1);
            break;
        }
      } else if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch, suggestions, selectedSuggestionIndex]
  );

  useEffect(() => {
    return () => {
      searchCache.clear();
    };
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    displayedQuery,
    searchResult,
    isSearching,
    error,
    handleSearch,
    resetSearch,
    handleKeyPress,
    searchHistory: searchHistoryItems,
    clearSearchHistory,
    removeSearchItem,
    exportSearchHistory,
    importSearchHistory,
    suggestions,
    selectedSuggestionIndex,
  };
}; 