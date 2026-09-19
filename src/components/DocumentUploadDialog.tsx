"use client";
import { useRef, useState } from "react";
import { allowedTypes } from "@/lib/static";
import { useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Upload,
    Loader2,
    X,
    FileText
} from "lucide-react";
import { toast } from "sonner";

interface DocumentUploadDialogProps {
    onUploadSuccess?: () => void;
    trigger?: React.ReactNode;
};

const DocumentUploadDialog = ({ onUploadSuccess, trigger }: DocumentUploadDialogProps) => {

    const { organization } = useOrganization();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isOpen, setIsOpen] = useState(false);

    const [isUploading, setIsUploading] = useState(false);

    const [documentName, setDocumentName] = useState("");

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const resetForm = () => {

        setDocumentName("");

        setSelectedFile(null);

        if (fileInputRef.current) {

            fileInputRef.current.value = "";

        }

    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {

        const file = e.target.files?.[0];

        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {

            toast.error("File size must be less than 10MB");

            if (fileInputRef.current) {

                fileInputRef.current.value = "";

            }

            return;

        }

        if (!allowedTypes.includes(file.type)) {

            toast.error("File type not supported");

            if (fileInputRef.current) {

                fileInputRef.current.value = "";

            }

            return;

        }

        setSelectedFile(file);

        setDocumentName(file.name.replace(/\.[^/.]+$/, ""));

    };

    const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {

        e.preventDefault();

        e.stopPropagation();

        setSelectedFile(null);

        if (fileInputRef.current) {

            fileInputRef.current.value = "";

        }

    };

    const handleUpload = async () => {

        if (!organization) {

            toast.error("No Organization Selected");

            return;

        }

        if (!selectedFile) {

            toast.error("Please Select A File");

            return;

        }

        if (!documentName.trim()) {

            toast.error("Please Enter A Document Name");

            return;

        }

        setIsUploading(true);

        try {

            const formData = new FormData();

            formData.append("name", documentName.trim());

            formData.append("organizationId", organization.id);

            formData.append("file", selectedFile);

            const response = await fetch("/api/documents", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {

                let errorMessage = "Upload Failed";

                try {

                    const error = await response.json();

                    errorMessage = error.error || errorMessage;

                } catch {

                    errorMessage = "Upload Failed. Please Try Again.";

                }

                throw new Error(errorMessage);

            }

            toast.success("Document Uploaded Successfully!");

            resetForm();

            setIsOpen(false);

            onUploadSuccess?.();

        } catch (error) {

            console.error("Upload Error:", error);

            toast.error(error instanceof Error ? error.message : "Upload Failed");

        } finally {

            setIsUploading(false);

        }

    };

    const handleDialogOpenChange = (open: boolean) => {

        setIsOpen(open);

        if (!open && !isUploading) {

            resetForm();

        }

    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={handleDialogOpenChange}
        >
            <DialogTrigger>
                {trigger || (
                    <Button className="w-full sm:w-auto">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Document
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="w-[calc(100%-2rem)] max-w-[500px] rounded-xl sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">
                        Upload Document
                    </DialogTitle>

                    <DialogDescription>
                        Upload a document for AI-powered analysis.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    <div className="space-y-2">
                        <label
                            htmlFor="document-name"
                            className="text-sm font-medium"
                        >
                            Document Name{" "}
                            <span className="text-red-500">*</span>
                        </label>

                        <Input
                            id="document-name"
                            placeholder="Enter document name"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            disabled={isUploading}
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="file-upload"
                            className="text-sm font-medium"
                        >
                            Upload File
                        </label>

                        <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-5 transition-colors hover:bg-muted/40 sm:p-6">
                            <input
                                ref={fileInputRef}
                                id="file-upload"
                                type="file"
                                onChange={handleFileSelect}
                                accept=".txt,.pdf,.doc,.docx,.md"
                                className="hidden"
                                disabled={isUploading}
                            />

                            <label
                                htmlFor="file-upload"
                                className="flex cursor-pointer flex-col items-center text-center"
                            >
                                {selectedFile ? (
                                    <>
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                                            <FileText className="h-6 w-6 text-blue-500" />
                                        </div>

                                        <p className="max-w-full truncate px-2 text-sm font-medium">
                                            {selectedFile.name}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {(selectedFile.size / (1024 * 1024)).toFixed(2)}{" "}MB
                                        </p>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveFile}
                                            disabled={isUploading}
                                            className="mt-2 text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="mr-1 h-3.5 w-3.5" />
                                            Remove
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                                            <Upload className="h-6 w-6 text-blue-500" />
                                        </div>

                                        <p className="text-sm font-medium">
                                            Click to select a file
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            .txt, .pdf, .doc, .docx, .md
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Maximum file size: 10MB
                                        </p>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isUploading}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={
                            isUploading ||
                            !documentName.trim() ||
                            !selectedFile
                        }
                        className="w-full sm:w-auto"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Document
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DocumentUploadDialog;