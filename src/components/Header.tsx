"use client"
import React, { useContext, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Check,
    ChevronDown,
    Globe,
    LogOut,
    Plus,
    Settings as SettingsIcon,
    Trash2,
} from "lucide-react";

import { UserContext } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/login-form";

export default function Header() {
    const {
        isAuthenticated,
        connections,
        activeId,
        activeConnection,
        isAllMode,
        setActive,
        removeConnection,
        clearAllValues,
    } = useContext(UserContext);

    const [addOpen, setAddOpen] = useState(false);

    const triggerLabel = isAllMode
        ? "All accounts"
        : activeConnection?.domain ?? "Select domain";

    return (
        <header className="border-b">
            <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
                <Link
                    href={isAuthenticated ? "/app" : "/"}
                    className="text-2xl font-bold tracking-tight md:text-3xl"
                >
                    nomail
                </Link>

                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button variant="outline" size="sm">
                                            <Globe className="size-4" />
                                            <span className="max-w-[16ch] truncate">{triggerLabel}</span>
                                            <ChevronDown className="size-3.5 opacity-60" />
                                        </Button>
                                    }
                                />
                                <DropdownMenuContent align="end" className="w-64">
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>Domains</DropdownMenuLabel>

                                        {connections.length > 1 && (
                                            <DropdownMenuItem onClick={() => setActive("all")}>
                                                <span className="flex flex-1 items-center gap-2">
                                                    <Globe className="size-4" />
                                                    All accounts
                                                </span>
                                                {isAllMode && <Check className="size-4" />}
                                            </DropdownMenuItem>
                                        )}

                                        {connections.map((c) => (
                                            <DropdownMenuItem
                                                key={c.id}
                                                onClick={() => setActive(c.id)}
                                                className="group"
                                            >
                                                <span className="flex flex-1 items-center gap-2 truncate">
                                                    {c.domain}
                                                </span>
                                                {activeId === c.id && <Check className="size-4" />}
                                                <button
                                                    type="button"
                                                    aria-label={`Remove ${c.domain}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (
                                                            confirm(
                                                                `Remove ${c.domain}? Aliases on Cloudflare are not affected.`
                                                            )
                                                        ) {
                                                            removeConnection(c.id);
                                                        }
                                                    }}
                                                    className="ml-2 rounded p-1 opacity-0 hover:bg-muted group-hover:opacity-100"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setAddOpen(true)}>
                                        <Plus className="size-4" />
                                        Add domain
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Link href="/settings">
                                <Button variant="ghost" size="icon" aria-label="Settings">
                                    <SettingsIcon className="size-4" />
                                </Button>
                            </Link>

                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Log out"
                                onClick={() => {
                                    if (confirm("Log out of all connected domains?")) {
                                        clearAllValues();
                                        window.location.href = "/";
                                    }
                                }}
                            >
                                <LogOut className="size-4" />
                            </Button>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button variant="outline">
                                Launch <ArrowRight className="size-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add a Cloudflare domain</DialogTitle>
                    </DialogHeader>
                    <LoginForm onConnected={() => setAddOpen(false)} />
                </DialogContent>
            </Dialog>
        </header>
    );
}
