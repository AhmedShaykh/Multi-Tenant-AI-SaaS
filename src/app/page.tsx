import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { features, steps } from "@/lib/static";

const App = () => {
    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* Hero */}
            <section className="border-b bg-background py-16 sm:py-20 lg:py-28">
                <div className="container mx-auto max-w-5xl px-4 text-center sm:px-6">
                    <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                        AI-Powered Document Analysis for{" "}
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            Teams
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg lg:text-xl">
                        Upload, analyze, and collaborate on documents with your
                        organization. Get instant AI insights and summaries.
                    </p>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                        <Link href="/sign-up" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full px-8 sm:w-auto">
                                Start Free Trial
                            </Button>
                        </Link>

                        <Link href="/sign-in" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full px-8 sm:w-auto"
                            >
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section
                id="features"
                className="bg-muted/30 py-16 sm:py-20"
            >
                <div className="container mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="mb-10 text-center sm:mb-12">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Everything You Need
                        </h2>

                        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                            Powerful tools to help your team understand and manage
                            documents faster.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;

                            return (
                                <Card
                                    key={index}
                                    className="border-border/60 bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <CardHeader>
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                                            <Icon className="h-7 w-7 text-blue-500" />
                                        </div>

                                        <CardTitle className="text-lg">
                                            {feature.title}
                                        </CardTitle>

                                        <CardDescription className="leading-6">
                                            {feature.description}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="border-b bg-background py-16 sm:py-20">
                <div className="container mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="mb-10 text-center sm:mb-12">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            How It Works
                        </h2>

                        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                            Get started with your documents in just a few simple steps.
                        </p>
                    </div>

                    <div className="mx-auto max-w-2xl space-y-4">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50 sm:p-5"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                                    <CheckCircle className="h-5 w-5 text-blue-500" />
                                </div>

                                <span className="text-sm font-medium sm:text-base">
                                    {step}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-br from-blue-500/10 via-background to-purple-500/10 py-16 sm:py-20 lg:py-24">
                <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Ready to analyze your documents?
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-lg">
                        Join teams using DocuAI to work smarter with their documents.
                    </p>

                    <div className="mt-8">
                        <Link href="/sign-up">
                            <Button size="lg" className="w-full px-8 sm:w-auto">
                                Get Started Free
                            </Button>
                        </Link>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground sm:text-sm">
                        No credit card required • 14-day free trial
                    </p>
                </div>
            </section>
        </main>
    );
};

export default App;