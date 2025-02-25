import { Button } from "@/components/ui/button";

interface RecommendedWordsProps {
  words: string[];
  onWordClick: (word: string) => void;
}

export const RecommendedWords: React.FC<RecommendedWordsProps> = ({
  words,
  onWordClick,
}) => {
  return (
    <div className="md:mt-16 mt-8">
      <div className="lg:w-[720px] md:w-[600px] sm:w-[480px] w-full md:px-[0px] px-[30px] flex flex-wrap justify-center gap-4">
        {words.map((word) => (
          <Button
            key={word}
            variant="secondary"
            onClick={() => onWordClick(word)}
            className="rounded-full px-6 py-2 h-auto text-sm bg-foreground hover:bg-foreground/15 dark:bg-transparent dark:border dark:border-border dark:text-foreground dark:hover:bg-border/30 text-[#fffafa]"
          >
            {word}
          </Button>
        ))}
      </div>
    </div>
  );
};
