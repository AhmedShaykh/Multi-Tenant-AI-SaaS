import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { uploadToBlob } from "@/lib/blob";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {

    try {

        const { userId } = await auth();

        if (!userId) {

            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        }

        const formData = await request.formData();

        const name = formData.get("name") as string;

        const content = formData.get("content") as string;

        const clerkOrgId = formData.get("organizationId") as string;

        const file = formData.get("file") as File;

        console.log("🔍 API Input:", {
            name,
            clerkOrgId,
            file: file?.name,
            fileSize: file?.size
        });

        if (!name || !clerkOrgId) {

            return NextResponse.json(
                { error: "Name & Organization ID Are Required" },
                { status: 400 }
            );

        }

        const organization = await prisma.organization.findUnique({
            where: { clerkOrgId: clerkOrgId }
        });

        console.log("🔍 Found Organization:", {
            found: !!organization,
            clerkId: clerkOrgId,
            dbId: organization?.id,
            name: organization?.name
        });

        if (!organization) {

            return NextResponse.json(
                { error: `Organization Not Found For Clerk ID: ${clerkOrgId}` },
                { status: 404 }
            );

        }

        const user = await prisma.user.findUnique({
            where: { clerkUserId: userId },
            include: {
                memberships: {
                    where: { organizationId: organization.id },
                    include: {
                        organization: true
                    }
                }
            }
        });

        console.log("🔍 User & Memberships:", {
            userFound: !!user,
            userId: user?.id,
            email: user?.email,
            membershipsCount: user?.memberships?.length,
            membershipOrgIds: user?.memberships?.map((m) => m.organizationId)
        });

        if (!user || user.memberships.length === 0) {

            return NextResponse.json(
                {
                    error: "You do not have access to this organization",
                    details: `User ${userId} is not a member of ${organization.name}`
                },
                { status: 403 }
            );

        }

        let fileUrl = null;

        let fileSize = null;

        let fileType = null;

        let extractedContent = content;

        if (file && file.size > 0) {

            const blob = await uploadToBlob(file, clerkOrgId, userId);

            fileUrl = blob.url;

            fileSize = file.size;

            fileType = file.type;

            if (!extractedContent && file.type.includes("text")) {

                extractedContent = await file.text();

            }

            console.log("✅ File Uploaded:", { fileUrl, fileSize, fileType });

        }

        console.log("📝 Creating Document With:", {
            name,
            organizationId: organization.id,
            userId: user.id
        });

        const document = await prisma.document.create({
            data: {
                name,
                content: extractedContent || null,
                fileUrl,
                fileSize: fileSize || 0,
                fileType: fileType || "unknown",
                organizationId: organization.id,
                userId: user.id,
                aiKeywords: []
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                organization: {
                    select: {
                        name: true,
                        clerkOrgId: true
                    }
                }
            }
        });

        console.log("✅ Document Created Successfully:", document.id);

        return NextResponse.json({
            success: true,
            message: "Document Uploaded Successfully",
            document: {
                id: document.id,
                name: document.name,
                fileUrl: document.fileUrl,
                organization: document.organization.name,
                clerkOrgId: document.organization.clerkOrgId,
                uploadedBy: document.user.name
            }
        });

    } catch (error: any) {

        console.error("Document Upload Error:", error);

        return NextResponse.json(
            {
                error: error.message || "Failed to upload document",
                details: process.env.NODE_ENV === "development" ? error.stack : undefined
            },
            { status: 500 }
        );

    }

};

export async function GET(request: Request) {

    try {

        const { userId } = await auth();

        if (!userId) {

            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        }

        const { searchParams } = new URL(request.url);

        const clerkOrgId = searchParams.get("organizationId");

        if (!clerkOrgId) {

            return NextResponse.json(
                { error: "Organization ID Is Required" },
                { status: 400 }
            );

        }

        const organization = await prisma.organization.findUnique({
            where: { clerkOrgId: clerkOrgId }
        });

        if (!organization) {

            return NextResponse.json(
                { error: "Organization Not Found" },
                { status: 404 }
            );

        }

        const user = await prisma.user.findUnique({
            where: { clerkUserId: userId },
            include: {
                memberships: {
                    where: { organizationId: organization.id },
                    include: {
                        organization: true
                    }
                }
            }
        });

        console.log("User", user);

        if (!user || user.memberships.length === 0) {

            return NextResponse.json(
                { error: "You do not have access to this organization" },
                { status: 403 }
            );

        }

        const documents = await prisma.document.findMany({
            where: { organizationId: organization.id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                organization: {
                    select: {
                        name: true,
                        clerkOrgId: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({
            documents,
            metadata: {
                organization: organization.name,
                clerkOrgId: organization.clerkOrgId,
                documentCount: documents.length
            }
        });

    } catch (error: any) {

        console.error("Get Documents Error:", error);

        return NextResponse.json(
            { error: error.message || "Failed To Get Documents" },
            { status: 500 }
        );

    }

};