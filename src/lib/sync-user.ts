import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function syncUserToDatabase() {

    try {

        const clerkUser = await currentUser();

        if (!clerkUser) {

            return null;

        }

        const email = clerkUser.emailAddresses[0]?.emailAddress || "";

        const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

        let dbUser = await prisma.user.findUnique({ where: { clerkUserId: clerkUser.id } });

        if (dbUser) {

            dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                    email,
                    name: name || dbUser.name
                }
            });

        } else {

            dbUser = await prisma.user.create({
                data: {
                    clerkUserId: clerkUser.id,
                    email,
                    name: name || "User"
                }
            });

            console.log(`New User Created: ${email}`);

        }

        return dbUser;

    } catch (error) {

        console.error("Error Syncing User From Clerk:", error);

        throw error;

    }

};