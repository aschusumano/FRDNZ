type InputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
};

export default function Input({
  value,
  onChange,
  placeholder = "",
  type = "text",
  className = "",
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
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
