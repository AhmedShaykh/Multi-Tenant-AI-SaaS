"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    SignedIn,
    SignedOut,
    UserButton,
    useUser,
    useOrganization
} from "@clerk/nextjs";
import {
    Sheet,
    SheetContent,
    SheetTrigger
} from "@/components/ui/sheet";
import {
    Menu,
    Home,
    FileText,
    Users,
    Brain,
    LogIn,
    UserPlus,
    Building
} from "lucide-react";

const Navbar = () => {

    const pathname = usePathname();

    const { user } = useUser();

    const { organization } = useOrganization();

    const [isOpen, setIsOpen] = useState(false);

    const getNavItems = () => {

        const baseItems = [
            {
                href: "/",
                label: "Home",
                icon: <Home className="h-4 w-4" />
            }
        ];

        if (organization) {

            return [
                ...baseItems,
                {
                    href: `/${organization.slug}`,
                    label: "Dashboard",
                    icon: <Building className="h-4 w-4" />
                },
                {
                    href: `/${organization.slug}/documents`,
                    label: "Documents",
                    icon: <FileText className="h-4 w-4" />
                },
                {
                    href: "/select-org",
                    label: "Switch Organization",
                    icon: <Users className="h-4 w-4" />
                }
            ];

        }

        return [
            ...baseItems,
            {
                href: "/select-org",
                label: "Switch Organization",
                icon: <Users className="h-4 w-4" />
            }
        ];

    };

    const navItems = getNavItems();

    const isActiveRoute = (href: string) => {
        return (
            pathname === href ||
            (href !== "/" && pathname?.startsWith(href))
        );
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
                <Link
                    className="flex shrink-0"
                    href="/"
                >
                    <Image
                        src="/Logo.svg"
                        alt="Logo"
                        width={80}
                        height={55}
                        className="h-10 w-22 cursor-pointer"
                        priority
                    />
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {navItems.map((item) => {
                        const active = isActiveRoute(item.href);
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={active ? "secondary" : "ghost"}
                                    size="sm"
                                    className="gap-2"
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    <SignedIn>
                        <div className="flex items-center gap-3">
                            <span className="max-w-[180px] truncate text-sm text-muted-foreground">
                                {organization
                                    ? `In: ${organization.name}`
                                    : user?.firstName || user?.username}
                            </span>

                            <UserButton />
                        </div>
                    </SignedIn>

                    <SignedOut>
                        <div className="flex items-center gap-2">
                            <Link href="/sign-in">
                                <Button variant="ghost" size="sm">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign In
                                </Button>
                            </Link>

                            <Link href="/sign-up">
                                <Button size="sm">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    </SignedOut>
                </div>

                <div className="md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>

                        <SheetContent
                            side="right"
                            className="w-[85%] max-w-sm bg-background px-5"
                        >
                            <div className="mt-8 flex flex-col gap-2">
                                {navItems.map((item) => {
                                    const active = isActiveRoute(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Button
                                                variant={active ? "secondary" : "ghost"}
                                                className="h-11 w-full justify-start gap-3"
                                            >
                                                {item.icon}
                                                {item.label}
                                            </Button>
                                        </Link>
                                    );
                                })}

                                <div className="mt-4 border-t border-border pt-5">
                                    <SignedIn>
                                        <div className="space-y-4">
                                            <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                                                {organization
                                                    ? `In: ${organization.name}`
                                                    : `Signed in as ${user?.firstName || user?.username
                                                    }`}
                                            </div>

                                            <div className="flex justify-center">
                                                <UserButton />
                                            </div>
                                        </div>
                                    </SignedIn>

                                    <SignedOut>
                                        <div className="space-y-2">
                                            <Link
                                                href="/sign-in"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                >
                                                    <LogIn className="mr-2 h-4 w-4" />
                                                    Sign In
                                                </Button>
                                            </Link>

                                            <Link
                                                href="/sign-up"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Button className="w-full mt-2">
                                                    <UserPlus className="mr-2 h-4 w-4" />
                                                    Sign Up
                                                </Button>
                                            </Link>
                                        </div>
                                    </SignedOut>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};

export default Navbar;