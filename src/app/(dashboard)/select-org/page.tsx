"use client";

import { useOrganizationList, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Building,
    Plus,
    Users,
    ArrowRight,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const SelectOrgPage = () => {
    const { user } = useUser();

    const {
        isLoaded,
        userMemberships,
        setActive,
        createOrganization,
    } = useOrganizationList({
        userMemberships: {
            infinite: true,
        },
    });

    const router = useRouter();

    const [orgName, setOrgName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshOrganizations = async () => {
        setIsRefreshing(true);

        try {
            if (userMemberships?.revalidate) {
                await userMemberships.revalidate();
            }

            toast.success("Organization list refreshed");
        } catch (error) {
            console.error("Failed to refresh organizations:", error);
            toast.error("Failed to refresh organizations");
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleCreateOrg = async () => {
        if (!orgName.trim()) {
            toast.error("Please enter an organization name");
            return;
        }

        setIsCreating(true);

        try {
            if (!createOrganization) {
                throw new Error(
                    "Organization creation is not available at this time.",
                );
            }

            // 1. Create organization in Clerk
            const newOrg = await createOrganization({
                name: orgName.trim(),
            });

            if (!newOrg) {
                throw new Error("Failed to create organization");
            }

            const createdOrgName = orgName.trim();

            toast.success(
                `Organization "${createdOrgName}" created successfully`,
            );

            setOrgName("");

            // 2. Save organization to your database
            try {
                const response = await fetch("/api/organizations", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        clerkOrgId: newOrg.id,
                        name: createdOrgName,
                        slug:
                            newOrg.slug ||
                            createdOrgName.toLowerCase().replace(/\s+/g, "-"),
                    }),
                });

                if (!response.ok) {
                    console.warn(
                        "Database sync had issues, but organization was created in Clerk",
                    );
                }
            } catch (dbError) {
                console.warn("Database sync failed:", dbError);
            }

            // 3. Set as active organization
            if (setActive) {
                await setActive({
                    organization: newOrg.id,
                });
            }

            // 4. Refresh Clerk organization list
            await new Promise((resolve) => setTimeout(resolve, 500));

            await refreshOrganizations();

            // 5. Refresh server components
            router.refresh();

            // 6. Go to organization dashboard
            router.push(`/${newOrg.slug}`);
        } catch (error: any) {
            console.error("Failed to create organization:", error);

            toast.error(
                error?.message || "Failed to create organization",
            );
        } finally {
            setIsCreating(false);
        }
    };

    const handleSelectOrg = async (organization: any) => {
        try {
            if (setActive) {
                await setActive({
                    organization: organization.id,
                });
            }

            router.push(`/${organization.slug}`);
        } catch (error) {
            console.error("Failed to switch organization:", error);
            toast.error("Failed to switch organization");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                {/* Header */}
                <div className="mb-8 text-center sm:mb-10">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                        Welcome, {user?.firstName || "there"}!
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                        Select or create an organization
                    </p>
                </div>

                {/* Create Organization */}
                <Card className="mb-6 border-border bg-card shadow-sm sm:mb-8">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Plus className="h-5 w-5 text-blue-500" />
                            Create New Organization
                        </CardTitle>

                        <CardDescription>
                            Start a new workspace for your team
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Input
                                placeholder="Enter organization name"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                disabled={isCreating}
                                className="h-11 flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleCreateOrg();
                                    }
                                }}
                            />

                            <Button
                                onClick={handleCreateOrg}
                                disabled={isCreating || !orgName.trim()}
                                className="h-11 w-full sm:w-auto sm:min-w-[110px]"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Organizations */}
                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                    <Building className="h-5 w-5 text-blue-500" />
                                    Your Organizations
                                </CardTitle>

                                <CardDescription className="mt-1">
                                    {userMemberships?.count === 0
                                        ? "Create your first organization above"
                                        : "Click on an organization to enter"}
                                </CardDescription>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={refreshOrganizations}
                                disabled={!isLoaded || isRefreshing}
                                className="shrink-0"
                                title="Refresh organizations"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""
                                        }`}
                                />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Loading */}
                        {!isLoaded ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-500" />
                                <p className="text-sm text-muted-foreground">
                                    Loading organizations...
                                </p>
                            </div>
                        ) : userMemberships?.count === 0 ? (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center py-10 text-center sm:py-12">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                                    <Building className="h-8 w-8 text-blue-500" />
                                </div>

                                <p className="font-medium">
                                    No organizations yet
                                </p>

                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                    Create your first organization to get started.
                                </p>
                            </div>
                        ) : (
                            /* Organization List */
                            <div className="space-y-3">
                                {userMemberships?.data?.map((membership) => (
                                    <button
                                        key={membership.organization.id}
                                        type="button"
                                        onClick={() =>
                                            handleSelectOrg(membership.organization)
                                        }
                                        className="group w-full rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-blue-500/40 hover:bg-muted/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 sm:p-5"
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            {/* Icon */}
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 sm:h-12 sm:w-12">
                                                <Building className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-sm font-semibold sm:text-base">
                                                    {membership.organization.name}
                                                </h3>

                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                                                    <span className="rounded-md bg-muted px-2 py-1 capitalize">
                                                        {membership.role}
                                                    </span>

                                                    <span className="hidden sm:inline">•</span>

                                                    <span className="truncate">
                                                        ID:{" "}
                                                        {membership.organization.id.substring(
                                                            0,
                                                            8,
                                                        )}
                                                        ...
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SelectOrgPage;