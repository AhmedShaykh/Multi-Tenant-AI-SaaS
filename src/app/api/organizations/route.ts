import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {

    try {

        const { userId } = await auth();

        if (!userId) {

            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        }

        const body = await request.json();

        const { clerkOrgId, name, slug } = body;

        if (!clerkOrgId || !name) {

            return NextResponse.json(
                { error: "Missing Required Fields" },
                { status: 400 }
            );

        }

        const existingOrg = await prisma.organization.findUnique({ where: { clerkOrgId } });

        if (existingOrg) {

            return NextResponse.json({
                success: true,
                organization: existingOrg,
                message: "Organization Already Exists"
            });

        }

        let user = await prisma.user.findUnique({ where: { clerkUserId: userId } });

        if (!user) {

            user = await prisma.user.create({
                data: {
                    clerkUserId: userId,
                    email: `${userId}@temp.com`,
                    name: "User"
                }
            });

        }

        const organization = await prisma.organization.create({
            data: {
                clerkOrgId,
                name,
                slug: slug || name.toLowerCase().replace(/\s+/g, "-")
            }
        });

        await prisma.organizationMember.create({
            data: {
                userId: user.id,
                organizationId: organization.id,
                role: "owner"
            }
        });

        return NextResponse.json({
            success: true,
            organization,
            message: "Organization Created Successfully"
        });

    } catch (error: any) {

        console.error("[ORGANIZATIONS_POST]", error);

        return NextResponse.json(
            { error: error.message || "Failed To Create Organization" },
            { status: 500 }
        );

    }

};