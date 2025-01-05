import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export function Button({ 
  className, 
  variant = 'default', 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded",
        variant === 'default' && "bg-blue-500 text-white hover:bg-blue-600",
        variant === 'outline' && "border border-gray-300 hover:bg-gray-50",
        className
      )}
      {...props}
    />
  );
}
