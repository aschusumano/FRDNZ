type TextareaProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

export default function Textarea({
  value,
  onChange,
  placeholder = "",
  rows = 4,
  className = "",
}: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`
        w-full p-3 rounded-lg border
        focus:outline-none focus:ring-2 focus:ring-frndz-secondary
        bg-white text-frndz-text
        transition
        ${className}
      `}
    />
  );
}
