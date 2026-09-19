import { AnalysisType, Document as AppDocument } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analysisTypes } from "@/lib/static";
import {
    FileText,
    Brain,
    Trash2,
    Download,
    Loader2,
    Calendar,
    User,
    Tag,
    File,
    Sparkles
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

interface DocumentCardProps {
    document: AppDocument;
    isAnalyzing: boolean;
    selectedAnalysisType: AnalysisType;
    onAnalysisTypeChange: (type: AnalysisType) => void;
    onAnalyze: (documentId: string) => void;
    onDelete: (documentId: string) => void;
    onToggleSummary: (documentId: string) => void;
    expandedSummaries: Set<string>;
    formatFileSize: (bytes?: number) => string;
};

const DocumentCard = ({
    document: doc,
    isAnalyzing,
    selectedAnalysisType,
    onAnalysisTypeChange,
    onAnalyze,
    onDelete,
    onToggleSummary,
    expandedSummaries,
    formatFileSize,
}: DocumentCardProps) => {

    const isExpanded = expandedSummaries.has(doc.id);

    const getAnalysisIcon = (type: AnalysisType) => {

        const analysisType = analysisTypes.find((item) => item.value === type);

        const Icon = analysisType?.icon || Sparkles;

        return <Icon className="h-4 w-4" />;

    };

    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 sm:h-12 sm:w-12">
                        <FileText className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <h3 className="truncate text-base font-semibold sm:text-lg">
                                    {doc.name}
                                </h3>

                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground sm:text-sm">
                                    <span className="flex min-w-0 items-center gap-1">
                                        <User className="h-3 w-3 shrink-0" />

                                        <span className="max-w- truncate">
                                            {doc.user.name || doc.user.email}
                                        </span>
                                    </span>

                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 shrink-0" />
                                        {new Date(doc.createdAt).toLocaleDateString()}
                                    </span>

                                    {doc.fileSize && (
                                        <span className="flex items-center gap-1">
                                            <File className="h-3 w-3 shrink-0" />
                                            {formatFileSize(doc.fileSize)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {doc.sentiment && (
                                <Badge
                                    variant="secondary"
                                    className="w-fit shrink-0 capitalize"
                                >
                                    {doc.sentiment}
                                </Badge>
                            )}
                        </div>

                        {doc.aiSummary && (
                            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
                                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Brain className="h-5 w-5 text-green-500" />

                                        <span className="font-medium">
                                            AI Analysis
                                        </span>

                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            Gemini AI
                                        </Badge>
                                    </div>

                                    {doc.aiSummary.length > 200 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onToggleSummary(doc.id)}
                                            className="w-fit"
                                        >
                                            {isExpanded ? "Show less" : "Read more"}
                                        </Button>
                                    )}
                                </div>

                                <div className="text-sm text-foreground/90">
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <ReactMarkdown>
                                            {isExpanded
                                                ? doc.aiSummary
                                                : doc.aiSummary.length > 200
                                                    ? `${doc.aiSummary.substring(
                                                        0,
                                                        200,
                                                    )}...`
                                                    : doc.aiSummary}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                {doc.aiKeywords.length > 0 && (
                                    <div className="mt-4 border-t border-border pt-3">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                Key Topics
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {doc.aiKeywords
                                                .slice(0, 8)
                                                .map((keyword, index) => (
                                                    <Badge
                                                        key={`${keyword}-${index}`}
                                                        variant="secondary"
                                                        className="px-3 py-1"
                                                    >
                                                        {keyword}
                                                    </Badge>
                                                ))}

                                            {doc.aiKeywords.length > 8 && (
                                                <Badge
                                                    variant="outline"
                                                    className="px-3 py-1"
                                                >
                                                    +{doc.aiKeywords.length - 8} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full shrink-0 space-y-3 lg:ml-4 lg:w-52">
                    {doc.fileUrl && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                window.open(
                                    doc.fileUrl,
                                    "_blank",
                                    "noopener,noreferrer",
                                )
                            }
                            title="Download"
                            className="w-full justify-center sm:justify-start"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    )}

                    <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                            {doc.aiSummary ? "Re-analyze with:" : "Analyze with:"}
                        </div>

                        <Select
                            value={selectedAnalysisType}
                            onValueChange={(value) =>
                                onAnalysisTypeChange(
                                    value as AnalysisType,
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue>
                                    <div className="flex min-w-0 items-center gap-2">
                                        {getAnalysisIcon(
                                            selectedAnalysisType,
                                        )}

                                        <span className="truncate">
                                            {analysisTypes.find((type) => type.value === selectedAnalysisType)?.label}
                                        </span>
                                    </div>
                                </SelectValue>
                            </SelectTrigger>

                            <SelectContent>
                                {analysisTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                {type.label}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>

                        <Button
                            type="button"
                            variant={doc.aiSummary ? "outline" : "default"}
                            size="sm"
                            onClick={() => onAnalyze(doc.id)}
                            disabled={isAnalyzing}
                            className="w-full justify-center sm:justify-start"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {doc.aiSummary ? "Re-analyzing..." : "Analyzing..."}
                                </>
                            ) : (
                                <>
                                    <Brain className="mr-2 h-4 w-4" />
                                    {doc.aiSummary ? "Re-analyze" : "Analyze"}
                                </>
                            )}
                        </Button>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(doc.id)}
                        className="w-full justify-center text-destructive hover:bg-destructive/10 hover:text-destructive sm:justify-start"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DocumentCard;