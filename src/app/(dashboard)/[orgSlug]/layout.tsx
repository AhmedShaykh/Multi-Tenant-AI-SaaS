import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface OrgLayoutProps {
    children: React.ReactNode;
    params: Promise<{ orgSlug: string }>;
}

const OrgLayout = async ({
    children,
    params,
}: OrgLayoutProps) => {
    const { orgSlug } = await params;
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    if (!orgSlug) {
        console.error("orgSlug is undefined");
        redirect("/dashboard");
    }

    // Get organization
    const organization = await prisma.organization.findUnique({
        where: {
            slug: orgSlug,
        },
    });

    if (!organization) {
        redirect("/select-org");
    }

    // Check if user is a member
    const membership = await prisma.organizationMember.findFirst({
        where: {
            organizationId: organization.id,
            user: {
                clerkUserId: userId,
            },
        },
    });

    if (!membership) {
        redirect("/select-org");
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Organization Banner */}
            <Card className="w-full rounded-none border-x-0 border-t-0 border-border bg-card shadow-sm sm:rounded-xl sm:border">
                <CardContent className="px-4 py-5 sm:px-6 sm:py-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Organization Info */}
                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                                {organization.name}
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Organization workspace
                            </p>
                        </div>

                        {/* Role */}
                        <Badge
                            variant="outline"
                            className="w-fit px-3 py-1.5 text-xs font-medium capitalize sm:px-4 sm:text-sm"
                        >
                            {membership.role}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <main className="py-6 sm:py-8 lg:py-10">
                <div className="container mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default OrgLayout;