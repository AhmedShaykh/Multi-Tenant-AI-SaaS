import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {

    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Product: [
            { label: "Features", href: "#" },
            { label: "Pricing", href: "#" },
            { label: "API", href: "#" }
        ],
        Company: [
            { label: "About", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Careers", href: "#" }
        ],
        Legal: [
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
            { label: "Security", href: "#" }
        ],
        Support: [
            { label: "Help Center", href: "#" },
            { label: "Contact Us", href: "#" },
            { label: "Status", href: "#" }
        ]
    };

    const socialLinks = [
        {
            href: "https://github.com/XYFORA",
            label: "GitHub",
            icon: (
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.604-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.466-1.11-1.466-.908-.621.069-.608.069-.608 1.004.07 1.532 1.031 1.532 1.031.892 1.529 2.341 1.087 2.91.831.092-.646.349-1.087.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.56 9.56 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.338 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .269.18.58.688.482A10.002 10.002 0 0 0 22 12c0-5.523-4.477-10-10-10Z" />
                </svg>
            )
        },
        {
            href: "mailto:info@xyfora.se",
            label: "Email",
            icon: <Mail className="h-5 w-5" />
        }
    ];

    return (
        <footer className="border-t border-border bg-muted/30">
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:py-16">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">
                    <div className="sm:col-span-2 lg:col-span-2">
                        <Link
                            className="mb-6"
                            href="/"
                        >
                            <Image
                                src="/Full Logo.svg"
                                alt="Logo"
                                width={150}
                                height={80}
                                className="h-18 w-68 cursor-pointer"
                                priority
                            />
                        </Link>

                        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                            AI-powered document analysis for teams. Upload,
                            analyze, and collaborate on documents with your
                            organization.
                        </p>

                        <div className="mt-6 flex gap-3">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={link.label}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-500"
                                >
                                    {link.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="mb-4 text-sm font-semibold">
                                {category}
                            </h3>

                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-center text-sm text-muted-foreground sm:text-left">
                        © {currentYear} XYFORA AI. All rights reserved.
                    </p>

                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm sm:justify-end">
                        <Link
                            href="#"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Privacy Policy
                        </Link>

                        <Link
                            href="#"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Terms of Service
                        </Link>

                        <Link
                            href="#"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;