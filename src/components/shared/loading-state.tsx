import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = "Loading...", className, fullScreen }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12",
        fullScreen && "min-h-[50vh]",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
