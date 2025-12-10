import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Article } from './articles';
import { Insight } from './insightGeneration';

/**
 * Export articles to PDF with insights
 */
export const exportToPDF = (
    articles: Article[],
    insights: Insight[] = [],
    title: string = 'NuVision News Report'
) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 20);

    // Metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    doc.text(`Total Articles: ${articles.length}`, 20, 36);

    let yPosition = 45;

    // Key Insights Section
    if (insights.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Key Insights', 20, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        insights.slice(0, 5).forEach((insight, i) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.text(`${i + 1}. ${insight.title}`, 25, yPosition);
            yPosition += 6;

            doc.setFont('helvetica', 'normal');
            const descLines = doc.splitTextToSize(insight.description, 160);
            doc.text(descLines, 30, yPosition);
            yPosition += descLines.length * 5 + 3;

            doc.setFontSize(8);
            doc.text(`Confidence: ${Math.round(insight.confidence * 100)}%`, 30, yPosition);
            yPosition += 8;
            doc.setFontSize(10);
        });

        yPosition += 5;
    }

    // Articles Table
    if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Articles', 20, yPosition);
    yPosition += 5;

    const tableData = articles.map(article => {
        const headline = article.content.split('.')[0].substring(0, 80);
        const sentiment = article.sentiment.compound > 0.05 ? 'Positive'
            : article.sentiment.compound < -0.05 ? 'Negative'
                : 'Neutral';
        const date = article.date ? new Date(article.date).toLocaleDateString() : 'N/A';

        return [
            headline,
            article.category,
            sentiment,
            article.publisher || 'Unknown',
            date
        ];
    });

    autoTable(doc, {
        startY: yPosition,
        head: [['Headline', 'Category', 'Sentiment', 'Publisher', 'Date']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
        columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 30 },
            2: { cellWidth: 25 },
            3: { cellWidth: 35 },
            4: { cellWidth: 25 }
        },
        margin: { left: 20, right: 20 }
    });

    // Save
    doc.save(`nuvision-report-${Date.now()}.pdf`);
};

/**
 * Export articles to CSV
 */
export const exportToCSV = (articles: Article[]) => {
    const headers = [
        'ID',
        'Headline',
        'Category',
        'Sentiment',
        'Sentiment Score',
        'Publisher',
        'Author',
        'Date',
        'URL'
    ];

    const rows = articles.map(article => {
        const headline = article.content.split('.')[0].replace(/,/g, ';');
        const sentiment = article.sentiment.compound > 0.05 ? 'Positive'
            : article.sentiment.compound < -0.05 ? 'Negative'
                : 'Neutral';

        return [
            article.id,
            `"${headline}"`,
            article.category,
            sentiment,
            article.sentiment.compound.toFixed(3),
            article.publisher || 'Unknown',
            article.author || 'Unknown',
            article.date || 'N/A',
            article.url || 'N/A'
        ];
    });

    const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nuvision-articles-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

/**
 * Export insights to JSON
 */
export const exportInsightsToJSON = (insights: Insight[]) => {
    const data = {
        generated: new Date().toISOString(),
        totalInsights: insights.length,
        insights: insights.map(insight => ({
            type: insight.type,
            title: insight.title,
            description: insight.description,
            confidence: insight.confidence,
            relatedArticleCount: insight.relatedArticles.length
        }))
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nuvision-insights-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
};
