import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { History, Trash2, Download, Upload, X } from "lucide-react";
import { useRef } from "react";

interface SearchHistoryItem {
  term: string;
  timestamp: number;
  count: number;
}

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onHistoryItemClick: (term: string) => void;
  onClearHistory: () => void;
  onRemoveItem: (term: string) => void;
  onExportHistory: () => void;
  onImportHistory: (file: File) => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onHistoryItemClick,
  onClearHistory,
  onRemoveItem,
  onExportHistory,
  onImportHistory,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (history.length === 0) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportHistory(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="md:mt-8 mt-16 lg:w-[600px] md:w-[600px] sm:w-[480px] w-[360px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-foreground">
          <History className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">최근 검색어</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-blue-500"
            title="검색 기록 가져오기"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportHistory}
            className="text-gray-500 hover:text-blue-500"
            title="검색 기록 내보내기"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="text-gray-500 hover:text-red-500"
            title="전체 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((item) => (
          <div key={item.timestamp} className="relative group">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onHistoryItemClick(item.term)}
              className="flex items-center gap-2 text-sm pr-8"
            >
              <span>{item.term}</span>
              <span className="text-xs text-gray-500">
                ({item.count}회) •{" "}
                {formatDistanceToNow(item.timestamp, {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveItem(item.term);
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
