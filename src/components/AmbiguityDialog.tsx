import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, HelpCircle } from 'lucide-react';

export interface AmbiguityOption {
    label: string;
    value: string;
    description?: string;
}

export interface AmbiguityDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    message: string;
    options: AmbiguityOption[];
    onSelect: (value: string) => void;
}

/**
 * Ambiguity Resolution Dialog
 * Helps users clarify their intent when queries are ambiguous
 */
export const AmbiguityDialog = ({
    open,
    onClose,
    title,
    message,
    options,
    onSelect
}: AmbiguityDialogProps) => {
    const [selectedValue, setSelectedValue] = useState<string | null>(null);

    const handleSelect = (value: string) => {
        setSelectedValue(value);
    };

    const handleConfirm = () => {
        if (selectedValue) {
            onSelect(selectedValue);
            onClose();
            setSelectedValue(null);
        }
    };

    const handleCancel = () => {
        onClose();
        setSelectedValue(null);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${selectedValue === option.value
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                                }
              `}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <div className="font-semibold mb-1">{option.label}</div>
                                    {option.description && (
                                        <div className="text-sm text-muted-foreground">
                                            {option.description}
                                        </div>
                                    )}
                                </div>
                                {selectedValue === option.value && (
                                    <Badge variant="default" className="shrink-0">
                                        Selected
                                    </Badge>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={!selectedValue}>
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

/**
 * Hook for managing ambiguity resolution
 */
export const useAmbiguityResolution = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<{
        title: string;
        message: string;
        options: AmbiguityOption[];
        onSelect: (value: string) => void;
    } | null>(null);

    const showAmbiguityDialog = (
        title: string,
        message: string,
        options: AmbiguityOption[],
        onSelect: (value: string) => void
    ) => {
        setConfig({ title, message, options, onSelect });
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
    };

    return {
        showAmbiguityDialog,
        AmbiguityDialogComponent: config ? (
            <AmbiguityDialog
                open={isOpen}
                onClose={closeDialog}
                title={config.title}
                message={config.message}
                options={config.options}
                onSelect={config.onSelect}
            />
        ) : null
    };
};
