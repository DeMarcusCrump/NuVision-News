import { Card, CardContent } from "@/components/ui/card";

export const ArticleCardSkeleton = () => {
    return (
        <Card className="overflow-hidden">
            <div className="animate-pulse">
                {/* Image skeleton */}
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />

                <CardContent className="p-6 space-y-4">
                    {/* Category badge skeleton */}
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />

                    {/* Title skeleton */}
                    <div className="space-y-2">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    </div>

                    {/* Description skeleton */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
                    </div>

                    {/* Metadata skeleton */}
                    <div className="flex items-center gap-4 pt-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                    </div>
                </CardContent>
            </div>
        </Card>
    );
};

export const ArticleGridSkeleton = ({ count = 6 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
            ))}
        </div>
    );
};
