import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Article } from "@/lib/articles";
import { generateInsights } from "@/lib/insightGeneration";
import { exportToPDF, exportToCSV, exportInsightsToJSON } from "@/lib/exportService";
import * as Icons from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Export articles in specified format
 */
export const exportArticles = (articles: Article[], format: 'json' | 'csv') => {
    if (format === 'json') {
        const dataStr = JSON.stringify(articles, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nuvision-articles-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Exported", description: `${articles.length} articles exported as JSON` });
    } else {
        exportToCSV(articles);
        toast({ title: "Exported", description: `${articles.length} articles exported as CSV` });
    }
};

interface ExportMenuProps {
    articles: Article[];
}

export const ExportMenu = ({ articles }: ExportMenuProps) => {
    const [isExporting, setIsExporting] = useState(false);
    const insights = useMemo(() => generateInsights(articles), [articles]);

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            exportToPDF(articles, insights);
            toast({
                title: "PDF exported",
                description: `Successfully exported ${articles.length} articles to PDF`,
            });
        } catch (error) {
            toast({
                title: "Export failed",
                description: "Failed to generate PDF",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportCSV = () => {
        setIsExporting(true);
        try {
            exportToCSV(articles);
            toast({
                title: "CSV exported",
                description: `Successfully exported ${articles.length} articles to CSV`,
            });
        } catch (error) {
            toast({
                title: "Export failed",
                description: "Failed to generate CSV",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportInsights = () => {
        setIsExporting(true);
        try {
            exportInsightsToJSON(insights);
            toast({
                title: "Insights exported",
                description: `Successfully exported ${insights.length} insights to JSON`,
            });
        } catch (error) {
            toast({
                title: "Export failed",
                description: "Failed to generate JSON",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

    if (articles.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isExporting}>
                    {isExporting ? (
                        <Icons.Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Icons.Download className="h-4 w-4 mr-2" />
                    )}
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportPDF}>
                    <Icons.FileText className="h-4 w-4 mr-2" />
                    PDF Report
                    <span className="ml-auto text-xs text-muted-foreground">
                        {articles.length} articles
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>
                    <Icons.Table className="h-4 w-4 mr-2" />
                    CSV Data
                    <span className="ml-auto text-xs text-muted-foreground">
                        {articles.length} rows
                    </span>
                </DropdownMenuItem>
                {insights.length > 0 && (
                    <DropdownMenuItem onClick={handleExportInsights}>
                        <Icons.Lightbulb className="h-4 w-4 mr-2" />
                        Insights JSON
                        <span className="ml-auto text-xs text-muted-foreground">
                            {insights.length} insights
                        </span>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
