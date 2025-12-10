import { Badge } from "@/components/ui/badge";
import { getSentimentColor, getSentimentLabel } from "@/lib/articles";
import { cn } from "@/lib/utils";

interface SentimentBadgeProps {
  compound: number;
}

export const SentimentBadge = ({ compound }: SentimentBadgeProps) => {
  const color = getSentimentColor(compound);
  const label = getSentimentLabel(compound);

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold border-2",
        color === "success" && "border-success text-success",
        color === "danger" && "border-danger text-danger",
        color === "warning" && "border-warning text-warning"
      )}
    >
      {label}
    </Badge>
  );
};
