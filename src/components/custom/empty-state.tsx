import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "card-fallback p-8 rounded-xl flex flex-col items-center text-center gap-3",
        className
      )}
    >
      {icon && (
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/15 text-primary grid place-items-center">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-sm opacity-80 max-w-prose">{description}</p>
      )}
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
