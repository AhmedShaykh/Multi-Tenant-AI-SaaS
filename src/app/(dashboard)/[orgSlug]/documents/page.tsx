"use client";
import { useEffect, useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { analysisTypes, formatFileSize } from "@/lib/static";
import { AnalysisType, Document as AppDocument } from "@/lib/types";
import { DocumentUploadDialog } from "@/components/DocumentUploadDialog";
import { DocumentCard } from "@/components/DocumentCard";

const DocumentsPage = () => {
    const { organization } = useOrganization();

    const [documents, setDocuments] = useState<AppDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);

    const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(
        new Set(),
    );

    const [selectedAnalysisType, setSelectedAnalysisType] =
        useState<AnalysisType>("summary");

    // Fetch documents
    const fetchDocuments = async () => {
        if (!organization) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `/api/documents?organizationId=${organization.id}`,
            );

            if (!response.ok) {
                throw new Error("Failed to fetch documents");
            }

            const data = await response.json();

            setDocuments(data.documents || []);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
            toast.error("Failed to load documents");
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchDocuments();
    }, [organization]);

    // Toggle summary
    const toggleSummary = (documentId: string) => {
        setExpandedSummaries((prev) => {
            const next = new Set(prev);

            if (next.has(documentId)) {
                next.delete(documentId);
            } else {
                next.add(documentId);
            }

            return next;
        });
    };

    // Analyze document
    const handleAnalyze = async (documentId: string) => {
        if (!organization) return;

        setIsAnalyzing(documentId);

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    documentId,
                    organizationId: organization.id,
                    analysisType: selectedAnalysisType,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Analysis failed");
            }

            await response.json();

            const analysisTypeLabel = analysisTypes.find(
                (type) => type.value === selectedAnalysisType,
            )?.label;

            toast.success(
                `${analysisTypeLabel || "Document"} analysis completed successfully!`,
            );

            await fetchDocuments();

            // Expand analyzed document
            setExpandedSummaries((prev) => {
                const next = new Set(prev);
                next.add(documentId);
                return next;
            });
        } catch (error) {
            console.error("Analysis error:", error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Analysis failed",
            );
        } finally {
            setIsAnalyzing(null);
        }
    };

    // Delete document
    const handleDelete = async (documentId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this document?",
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `/api/documents/${documentId}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) {
                throw new Error("Failed to delete document");
            }

            toast.success("Document deleted successfully");

            await fetchDocuments();

            // Remove from expanded summaries
            setExpandedSummaries((prev) => {
                const next = new Set(prev);
                next.delete(documentId);
                return next;
            });
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete document");
        }
    };

    const analyzedCount = documents.filter(
        (document) => document.aiSummary,
    ).length;

    const pendingCount = documents.filter(
        (document) => !document.aiSummary,
    ).length;

    const totalSize = documents.reduce(
        (total, document) => total + (document.fileSize || 0),
        0,
    );

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Documents
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                        Upload and analyze documents in{" "}
                        <span className="font-medium text-foreground">
                            {organization?.name || "your organization"}
                        </span>
                    </p>
                </div>

                {/* Upload */}
                <div className="w-full shrink-0 sm:w-auto">
                    <DocumentUploadDialog onUploadSuccess={fetchDocuments} />
                </div>
            </div>

            {/* Stats */}
            {documents.length > 0 && !isLoading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Total */}
                    <Card className="border-border bg-card">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold">
                                    {documents.length}
                                </div>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Total Documents
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Analyzed */}
                    <Card className="border-border bg-card">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-500">
                                    {analyzedCount}
                                </div>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Analyzed
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Size */}
                    <Card className="border-border bg-card sm:col-span-2 lg:col-span-1">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold">
                                    {formatFileSize(totalSize)}
                                </div>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Total Size
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Documents */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                        Documents ({documents.length})

                        {isLoading && (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </CardTitle>

                    <CardDescription>
                        {analyzedCount} analyzed{" "}
                        <span className="mx-1">•</span>
                        {pendingCount} pending
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Loading */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />

                            <p className="text-sm text-muted-foreground">
                                Loading documents...
                            </p>
                        </div>
                    ) : documents.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
                                <FileText className="h-7 w-7 text-blue-500" />
                            </div>

                            <p className="font-medium">
                                No documents uploaded yet
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Upload your first document to get started.
                            </p>

                            <div className="mt-5">
                                <DocumentUploadDialog
                                    onUploadSuccess={fetchDocuments}
                                />
                            </div>
                        </div>
                    ) : (
                        /* Document List */
                        <div className="space-y-4 sm:space-y-6">
                            {documents.map((doc) => (
                                <DocumentCard
                                    key={doc.id}
                                    document={doc}
                                    isAnalyzing={isAnalyzing === doc.id}
                                    selectedAnalysisType={selectedAnalysisType}
                                    onAnalysisTypeChange={setSelectedAnalysisType}
                                    onAnalyze={handleAnalyze}
                                    onDelete={handleDelete}
                                    onToggleSummary={toggleSummary}
                                    expandedSummaries={expandedSummaries}
                                    formatFileSize={formatFileSize}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DocumentsPage;