import { processSpecialTags } from "@/utils/text-formatter";

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  className,
}) => {
  const formattedText = processSpecialTags(text);
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: formattedText }}
    />
  );
};
