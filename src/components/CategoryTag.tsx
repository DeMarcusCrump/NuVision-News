import { Badge } from "@/components/ui/badge";

interface CategoryTagProps {
  category: string;
}

export const CategoryTag = ({ category }: CategoryTagProps) => {
  return (
    <Badge variant="secondary" className="font-medium uppercase text-xs tracking-wide">
      {category}
    </Badge>
  );
};
