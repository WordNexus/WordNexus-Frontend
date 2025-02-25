import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
  onKeyPress,
}) => {
  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyPress={onKeyPress}
        className="w-full px-8 py-7 rounded-full border-[#4a6572] dark:border-border bg-transparent text-lg shadow-custom"
        placeholder="단어를 입력하세요"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onSearch}
        className="absolute right-6 top-1/2 -translate-y-1/2 dark:text-foreground"
      >
        <Search className="h-5 w-5" />
      </Button>
    </div>
  );
};
