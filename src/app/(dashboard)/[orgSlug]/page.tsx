import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FileText,
    ArrowRight,
    Upload,
    Brain
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

interface OrgDashboardPageProps {
    params: Promise<{ orgSlug: string }>;
};

const OrgDashboardPage = async ({ params }: OrgDashboardPageProps) => {

    const { orgSlug } = await params;

    const { userId } = await auth();

    if (!userId) {

        redirect("/sign-in");

    }

    const organization = await prisma.organization.findUnique({
        where: {
            slug: orgSlug
        },
        include: {
            _count: {
                select: {
                    documents: true,
                    members: true
                }
            },
            documents: {
                take: 5,
                orderBy: {
                    createdAt: "desc"
                }
            }
        }
    });

    if (!organization) {

        redirect("/select-org");

    }

    const membership = await prisma.organizationMember.findFirst({
        where: {
            organizationId: organization.id,
            user: {
                clerkUserId: userId
            }
        }
    });

    if (!membership) {

        redirect("/select-org");

    }

    const analyzedDocs = await prisma.document.count({
        where: {
            organizationId: organization.id,
            aiSummary: {
                not: null
            }
        }
    });

    const totalDocuments = organization._count.documents;

    const analyzedPercentage = totalDocuments > 0 ? ((analyzedDocs / totalDocuments) * 100).toFixed(0) : "0";

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {organization.name} Dashboard
                </h1>

                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                    Welcome to your organization workspace
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">
                            Total Documents
                        </CardTitle>

                        <CardDescription>
                            In this organization
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="text-3xl font-bold">
                            {totalDocuments}
                        </div>

                        <Link href={`/${orgSlug}/documents`}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 px-0 hover:bg-transparent"
                            >
                                View Documents
                                <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            Team Members
                        </CardTitle>

                        <CardDescription>
                            Organization Members
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="text-3xl font-bold">
                            {organization._count.members}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 px-0 hover:bg-transparent"
                        >
                            View Team
                            <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card sm:col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">
                            Analyzed
                        </CardTitle>

                        <CardDescription>
                            Documents with AI insights
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="text-3xl font-bold">
                            {analyzedDocs}
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {analyzedPercentage}% Analyzed
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                        Recent Documents
                    </CardTitle>

                    <CardDescription>
                        Latest uploads in your organization
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {organization.documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center sm:py-12">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
                                <FileText className="h-7 w-7 text-blue-500" />
                            </div>

                            <p className="font-medium">
                                No documents uploaded yet
                            </p>

                            <p className="mt-1 mb-5 text-sm text-muted-foreground">
                                Upload your first document to start analyzing it.
                            </p>

                            <Link href={`/${orgSlug}/documents`}>
                                <Button>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload First Document
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {organization.documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50 sm:p-4"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium sm:text-base">
                                            {doc.name}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                            Uploaded{" "}
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="shrink-0">
                                        {doc.aiSummary ? (
                                            <div
                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10"
                                                title="Analyzed"
                                            >
                                                <Brain className="h-4 w-4 text-green-500" />
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="hidden sm:flex"
                                            >
                                                Analyze
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
};

export default OrgDashboardPage;