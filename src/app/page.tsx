"use client";
import { motion, AnimatePresence } from "framer-motion";
import { NavigationBar } from "@/components/navigation-bar";
import { SearchBar } from "@/components/search-bar";
import { RecommendedWords } from "@/components/recommended-words";
import { SearchResults } from "@/components/search-results";
import { SearchHistory } from "@/components/search-history";
import { useSearch } from "@/hooks/useSearch";
import { useState, useEffect, Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const {
    searchQuery,
    setSearchQuery,
    displayedQuery,
    searchResult,
    isSearching,
    error,
    handleSearch,
    resetSearch,
    handleKeyPress,
    searchHistory,
    clearSearchHistory,
    removeSearchItem,
    exportSearchHistory,
    importSearchHistory,
    suggestions,
    selectedSuggestionIndex,
  } = useSearch();

  const [recommendedWords, setRecommendedWords] = useState<string[]>([
    "curious",
    "casual",
    "approval",
    "impeachment",
    "environmental",
  ]);

  useEffect(() => {
    setRecommendedWords((prev) =>
      [...prev].sort(() => Math.random() - 0.5).slice(0, 5)
    );
  }, []);

  const handleSearchClick = () => {
    handleSearch(searchQuery);
  };

  const handleRecommendedWordClick = (word: string) => {
    setSearchQuery(word);
    handleSearch(word);
  };

  const showSearchResults =
    searchResult.length > 0 || (error !== null && error !== "") || isSearching;

  return (
    <div className="w-full bg-background dark:bg-background">
      <NavigationBar
        isSearching={showSearchResults}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        onKeyPress={handleKeyPress}
        onReset={resetSearch}
      />

      <main className="flex flex-col items-center justify-center w-full md:pt-[120px] pt-[200px]">
        <AnimatePresence mode="wait" initial={false}>
          {!showSearchResults ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center"
            >
              <h2 className="text-foreground dark:text-foreground text-2xl font-semibold mb-12">
                어떤 영단어를 찾고 있나요?
              </h2>
              <div className="relative lg:w-[720px] md:w-[600px] sm:w-[480px] w-[360px]">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSearch={handleSearchClick}
                  onKeyPress={handleKeyPress}
                />
                {suggestions.length > 0 && (
                  <div className="absolute lg:w-[720px] md:w-[600px] sm:w-[480px] w-[360px] bg-background border border-border rounded-lg mt-1 shadow-lg z-10 overflow-hidden">
                    {suggestions.map((suggestion, index) => {
                      const isSelected = index === selectedSuggestionIndex;
                      const searchCount =
                        searchHistory.find((item) => item.term === suggestion)
                          ?.count || 0;

                      return (
                        <button
                          key={suggestion}
                          className={`lg:w-[720px] md:w-[600px] sm:w-[480px] w-[360px] px-4 py-2 text-left hover:bg-accent/50 text-foreground flex items-center justify-between ${
                            isSelected ? "bg-accent/50" : ""
                          }`}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            handleSearch(suggestion);
                          }}
                        >
                          <span>{suggestion}</span>
                          <span className="text-xs text-gray-500">
                            {searchCount}회 검색됨
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <RecommendedWords
                words={recommendedWords}
                onWordClick={handleRecommendedWordClick}
              />
              <SearchHistory
                history={searchHistory}
                onHistoryItemClick={handleRecommendedWordClick}
                onClearHistory={clearSearchHistory}
                onRemoveItem={removeSearchItem}
                onExportHistory={exportSearchHistory}
                onImportHistory={importSearchHistory}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:w-[720px] md:w-[600px] sm:w-[480px] w-[360px]"
            >
              <SearchResults
                results={searchResult}
                displayedQuery={displayedQuery}
                error={error}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
