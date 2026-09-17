import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const DashboardLayout = async ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="py-6 sm:py-8 lg:py-10">
                <div className="container mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;