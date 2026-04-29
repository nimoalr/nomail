"use client"

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, ShieldCheck, Sparkles } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import Footer from "@/components/Footer";
import { UserContext } from "@/context/UserContext";

export default function Page() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useContext(UserContext);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/app");
        }
    }, [isAuthenticated, isLoading, router]);

    return (
        <div className="flex min-h-svh flex-col">
            <div className="grid flex-1 lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex justify-center md:justify-start">
                        <a href="/" className="text-2xl font-bold tracking-tight">
                            nomail
                        </a>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-sm">
                            <LoginForm />
                        </div>
                    </div>
                </div>
            <div className="relative hidden bg-background lg:block overflow-hidden">
                <DottedGlowBackground
                    className="pointer-events-none mask-radial-to-90% mask-radial-at-center"
                    opacity={1}
                    gap={12}
                    radius={2.2}
                    colorLightVar="--color-neutral-500"
                    glowColorLightVar="--color-purple-500"
                    colorDarkVar="--color-neutral-500"
                    glowColorDarkVar="--color-purple-400"
                    backgroundOpacity={0}
                    speedMin={0.3}
                    speedMax={1.6}
                    speedScale={1}
                />
                <div className="relative z-10 flex h-full items-center justify-center px-12">
                    <div className="max-w-md rounded-2xl border border-foreground/20 p-8 shadow-2xl backdrop-blur-[3px]">
                        <h2 className="text-3xl font-bold leading-tight text-foreground/90">
                            A unique email for every account.
                        </h2>
                        <p className="mt-3 text-sm text-foreground/60">
                            No more spam. 100% inbox control.
                        </p>

                        <ul className="mt-8 space-y-5">
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background/60 backdrop-blur-sm">
                                    <Sparkles className="size-4 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground/90">
                                        Unguessable suffixes
                                    </p>
                                    <p className="text-xs text-foreground/60">
                                        Random characters appended to every alias. Burn one, keep
                                        the rest.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background/60 backdrop-blur-sm">
                                    <Globe className="size-4 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground/90">
                                        Multiple domains
                                    </p>
                                    <p className="text-xs text-foreground/60">
                                        Connect every Cloudflare zone you own and switch between them
                                        in one click.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background/60 backdrop-blur-sm">
                                    <ShieldCheck className="size-4 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground/90">
                                        Stays on your device
                                    </p>
                                    <p className="text-xs text-foreground/60">
                                        Credentials are encrypted and stored locally. No backend, no
                                        accounts.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            </div>
            <Footer />
        </div>
    );
}
