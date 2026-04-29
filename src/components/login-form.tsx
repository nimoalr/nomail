"use client"

import { useContext, useState } from "react";
import { ArrowRight, HelpCircle, Lock } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { UserContext } from "@/context/UserContext";

function HelpDialog({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger
                render={
                    <button
                        type="button"
                        aria-label={`Help: ${title}`}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    />
                }
            >
                <HelpCircle className="size-4" />
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-muted-foreground space-y-3">{children}</div>
            </DialogContent>
        </Dialog>
    );
}

export function LoginForm({
    className,
    onConnected,
    ...props
}: React.ComponentProps<"form"> & { onConnected?: () => void }) {
    const { addConnection, isLoading } = useContext(UserContext);
    const [isQuickAuth, setIsQuickAuth] = useState(false);

    const [accountId, setAccountId] = useState(process.env.NEXT_PUBLIC_ACCOUNT_ID ?? "");
    const [zoneId, setZoneId] = useState(process.env.NEXT_PUBLIC_ZONE_ID ?? "");
    const [accessToken, setAccessToken] = useState(process.env.NEXT_PUBLIC_ACCESS_TOKEN ?? "");
    const [quickAuth, setQuickAuth] = useState(process.env.NEXT_PUBLIC_QUICK_AUTH ?? "");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let aId = accountId;
        let zId = zoneId;
        let aToken = accessToken;

        if (isQuickAuth && quickAuth) {
            const parts = quickAuth.split(",").map((s) => s.trim());
            [aId, zId, aToken] = parts;
        }

        if (!aId || !zId || !aToken) {
            toast.error("Please fill in all fields");
            return;
        }

        const ok = await addConnection(aId, zId, aToken);
        if (!ok) {
            toast.error("Failed to connect. Check your credentials.");
            return;
        }
        onConnected?.();
    };

    return (
        <form
            onSubmit={onSubmit}
            className={cn("flex flex-col gap-6", className)}
            {...props}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Connect to Cloudflare</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Enter your Cloudflare credentials to manage your email aliases.
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Cloudflare info</Label>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="quick-auth" className="text-sm">
                            Quick auth
                        </Label>
                        <Switch
                            id="quick-auth"
                            checked={isQuickAuth}
                            onCheckedChange={setIsQuickAuth}
                        />
                    </div>
                </div>

                {isQuickAuth ? (
                    <Field>
                        <FieldLabel htmlFor="quickAuth">Quick auth token</FieldLabel>
                        <div className="relative">
                            <Input
                                id="quickAuth"
                                type="password"
                                placeholder="Account ID, Zone ID, Access token"
                                tabIndex={1}
                                value={quickAuth}
                                onChange={(e) => setQuickAuth(e.target.value)}
                            />
                            <HelpDialog title="Quick Auth">
                                <p>
                                    "Quick Auth" is useful if you use a password manager and want to
                                    log in faster.
                                </p>
                                <p>
                                    It's a comma-separated string containing Account ID, Zone ID and
                                    Access token.
                                </p>
                                <p>
                                    <b>Format:</b>{" "}
                                    <code className="rounded bg-muted px-1.5 py-0.5">
                                        Account ID, Zone ID, Access token
                                    </code>
                                </p>
                                <p>
                                    <b>Example:</b>{" "}
                                    <code className="rounded bg-muted px-1.5 py-0.5">
                                        123,456,abc
                                    </code>
                                </p>
                            </HelpDialog>
                        </div>
                    </Field>
                ) : (
                    <>
                        <Field>
                            <FieldLabel htmlFor="accountId">Account ID</FieldLabel>
                            <div className="relative">
                                <Input
                                    id="accountId"
                                    tabIndex={1}
                                    value={accountId}
                                    onChange={(e) => setAccountId(e.target.value)}
                                />
                                <HelpDialog title="Account ID and Zone ID">
                                    <p>
                                        Log in to your Cloudflare dashboard, choose a zone/domain, and
                                        copy <code className="rounded bg-muted px-1.5 py-0.5">Account ID</code> and{" "}
                                        <code className="rounded bg-muted px-1.5 py-0.5">Zone ID</code>{" "}
                                        from your domain's overview page.
                                    </p>
                                    <a
                                        href="https://dash.cloudflare.com"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
                                    >
                                        Open Cloudflare dashboard <ArrowRight className="size-3.5" />
                                    </a>
                                    <img
                                        src="/img/cloudflare-zone-account-ids.png"
                                        alt="Where to find Account ID and Zone ID"
                                        className="mt-3 rounded-md border"
                                    />
                                </HelpDialog>
                            </div>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="zoneId">Zone ID</FieldLabel>
                            <div className="relative">
                                <Input
                                    id="zoneId"
                                    tabIndex={2}
                                    value={zoneId}
                                    onChange={(e) => setZoneId(e.target.value)}
                                />
                                <HelpDialog title="Account ID and Zone ID">
                                    <p>
                                        Log in to your Cloudflare dashboard, choose a zone/domain, and
                                        copy your <code className="rounded bg-muted px-1.5 py-0.5">Zone ID</code>{" "}
                                        from your domain's overview page.
                                    </p>
                                </HelpDialog>
                            </div>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="accessToken">Access token</FieldLabel>
                            <div className="relative">
                                <Input
                                    id="accessToken"
                                    type="password"
                                    tabIndex={3}
                                    value={accessToken}
                                    onChange={(e) => setAccessToken(e.target.value)}
                                />
                                <HelpDialog title="Access token">
                                    <ol className="list-decimal pl-5 space-y-1">
                                        <li>Log in to your Cloudflare dashboard</li>
                                        <li>Create a new token (choose Custom token)</li>
                                        <li>
                                            <b>Permissions:</b>
                                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                                <li>Account → Email Routing Addresses → Read</li>
                                                <li>Zone → Email Routing Rules → Edit</li>
                                                <li>Zone → Zone Settings → Read</li>
                                            </ul>
                                        </li>
                                    </ol>
                                    <a
                                        href="https://dash.cloudflare.com/profile/api-tokens"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
                                    >
                                        Open token manager <ArrowRight className="size-3.5" />
                                    </a>
                                </HelpDialog>
                            </div>
                        </Field>
                    </>
                )}

                <Field>
                    <Button type="submit" tabIndex={4} disabled={isLoading}>
                        {isLoading ? "Connecting…" : "Connect to Cloudflare"}
                        {!isLoading && <ArrowRight className="size-4" />}
                    </Button>
                </Field>

                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3" />
                    <span>
                        The information will be encrypted and stored locally on your browser.
                    </span>
                </div>
            </FieldGroup>
        </form>
    );
}
