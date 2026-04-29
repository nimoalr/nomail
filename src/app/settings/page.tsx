"use client"
import { useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    SettingsContext,
    SUFFIX_MAX,
    SUFFIX_MIN,
    generateSuffix,
} from "@/context/SettingsContext";

const THEMES = [
    { value: "light", label: "Light", Icon: Sun },
    { value: "dark", label: "Dark", Icon: Moon },
    { value: "system", label: "System", Icon: Monitor },
] as const;

export default function Page() {
    const { settings, updateSettings } = useContext(SettingsContext);
    const { enabled, length } = settings.randomSuffix;
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const setEnabled = (v: boolean) =>
        updateSettings({ randomSuffix: { ...settings.randomSuffix, enabled: v } });

    const setLength = (v: number) =>
        updateSettings({ randomSuffix: { ...settings.randomSuffix, length: v } });

    const previewSuffix = generateSuffix(length);
    const preview = enabled
        ? `service-${previewSuffix}@yourdomain.com`
        : `service@yourdomain.com`;

    return (
        <div className="flex min-h-svh flex-col">
            <Header />
            <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 md:px-6">
                <h1 className="text-3xl font-black sm:text-4xl">Settings</h1>

                <section className="mt-8 space-y-4 rounded-lg border bg-card p-6">
                    <div>
                        <Label className="text-base font-semibold">Theme</Label>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Choose how nomail looks. System matches your OS preference.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {THEMES.map(({ value, label, Icon }) => {
                            const active = mounted && theme === value;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setTheme(value)}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors",
                                        active
                                            ? "border-foreground bg-muted"
                                            : "border-input hover:bg-muted/50"
                                    )}
                                    aria-pressed={active}
                                >
                                    <Icon className="size-4" />
                                    <span>{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-6 space-y-6 rounded-lg border bg-card p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Label htmlFor="suffix-enabled" className="text-base font-semibold">
                                Random suffix
                            </Label>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Append random characters to each alias so a burned address can be
                                replaced without losing the service name.
                            </p>
                        </div>
                        <Switch
                            id="suffix-enabled"
                            checked={enabled}
                            onCheckedChange={setEnabled}
                        />
                    </div>

                    <div className={enabled ? "" : "opacity-50 pointer-events-none"}>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="suffix-length" className="text-sm font-medium">
                                Length
                            </Label>
                            <span className="text-sm tabular-nums text-muted-foreground">
                                {length} characters
                            </span>
                        </div>
                        <Slider
                            id="suffix-length"
                            className="mt-3"
                            min={SUFFIX_MIN}
                            max={SUFFIX_MAX}
                            step={1}
                            value={[length]}
                            onValueChange={(v) =>
                                setLength(Array.isArray(v) ? v[0] : v)
                            }
                        />
                        <div className="mt-1 flex justify-between text-xs text-muted-foreground tabular-nums">
                            <span>{SUFFIX_MIN}</span>
                            <span>{SUFFIX_MAX}</span>
                        </div>
                    </div>

                    <div className="rounded-md bg-muted p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Preview
                        </p>
                        <p className="mt-1 font-mono text-sm">{preview}</p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
