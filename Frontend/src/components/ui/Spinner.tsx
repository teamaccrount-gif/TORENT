import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  return (
    <Loader2 
      className={cn("animate-spin text-current", sizeClasses[size], className)} 
    />
  );
};
