import { analyzeWithGemini } from "@/lib/gemini";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {

    try {

        const { userId } = await auth();

        if (!userId) {

            return NextResponse.json({ error: "Please Sign In" }, { status: 401 });

        }

        const { documentId, organizationId, analysisType } = await request.json();

        if (!documentId || !organizationId) {

            return NextResponse.json(
                { error: "Missing Document Or Organization ID" },
                { status: 400 }
            );

        }

        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                organization: {
                    clerkOrgId: organizationId,
                    members: {
                        some: {
                            user: { clerkUserId: userId }
                        }
                    }
                }
            }
        });

        if (!document) {

            return NextResponse.json(
                { error: "Document Not Found Or No Access" },
                { status: 404 }
            );

        }

        const content = document.content || document.name;

        if (!content || content.trim().length < 5) {

            return NextResponse.json(
                { error: "Document Has No Content To Analyze" },
                { status: 400 }
            );

        }

        const summary = await analyzeWithGemini(content, analysisType);

        const updatedDocument = await prisma.document.update({
            where: { id: documentId },
            data: {
                aiSummary: summary,
                aiKeywords: ["analyzed"],
                sentiment: "analyzed"
            }
        });

        return NextResponse.json({
            success: true,
            summary,
            document: {
                id: updatedDocument.id,
                name: updatedDocument.name,
                aiSummary: updatedDocument.aiSummary
            }
        });

    } catch (error: any) {

        console.error("Analysis Error:", error);

        return NextResponse.json(
            { error: "Analysis Failed: " + error.message },
            { status: 500 }
        );

    }

};