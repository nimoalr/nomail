"use client"
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ArrowRight, Pencil, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { UserContext, Connection } from "@/context/UserContext";
import { CloudflareContext } from "@/context/CloudflareContext";
import { CloudflareUtils } from "@/utils";
import { CustomAddress } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AliasDialog from "./AliasDialog";

export default function CloudflareEmailRouterSettings() {
    const { connections, activeConnection, isAllMode, isAuthenticated } =
        useContext(UserContext);
    const { getApi } = useContext(CloudflareContext);

    const [isLoading, setIsLoading] = useState(true);
    const [aliases, setAliases] = useState<CustomAddress[]>([]);

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<CustomAddress | null>(null);
    const [search, setSearch] = useState("");

    const sourcedConnections = useMemo<Connection[]>(() => {
        if (isAllMode) return connections;
        return activeConnection ? [activeConnection] : [];
    }, [isAllMode, connections, activeConnection]);

    useEffect(() => {
        if (!isAuthenticated) return;
        let cancelled = false;
        setIsLoading(true);
        (async () => {
            const results = await Promise.all(
                sourcedConnections.map(async (c) => {
                    const api = getApi(c.id);
                    if (!api) return [] as CustomAddress[];
                    const rules = await api.getEmailRules(c.zoneId);
                    return CloudflareUtils.mapEmailRulesResponseToCustomAddressList(rules).map(
                        (a) => ({ ...a, connectionId: c.id, domain: c.domain })
                    );
                })
            );
            if (cancelled) return;
            setAliases(results.flat());
            setIsLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, sourcedConnections, getApi]);

    const handleChange = (
        updated: CustomAddress,
        action: "insert" | "update" | "delete"
    ) => {
        if (action === "insert") setAliases((prev) => [updated, ...prev]);
        else if (action === "update")
            setAliases((prev) =>
                prev.map((a) => (a.tag === updated.tag ? updated : a))
            );
        else setAliases((prev) => prev.filter((a) => a.tag !== updated.tag));
    };

    const editConnection =
        editTarget?.connectionId
            ? connections.find((c) => c.id === editTarget.connectionId) ?? null
            : null;

    const filteredAliases = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return aliases;
        return aliases.filter(
            (a) =>
                a.from?.toLowerCase().includes(q) ||
                a.to?.toLowerCase().includes(q) ||
                a.domain?.toLowerCase().includes(q)
        );
    }, [aliases, search]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {isAllMode
                        ? `Showing aliases across ${connections.length} ${connections.length === 1 ? "domain" : "domains"
                        }.`
                        : activeConnection?.domain
                            ? `Domain: ${activeConnection.domain}`
                            : null}
                </p>
                <Button
                    onClick={() => setCreateOpen(true)}
                    disabled={connections.length === 0}
                >
                    <Plus className="size-4" /> Create alias
                </Button>
            </div>

            {!isLoading && aliases.length > 0 && (
                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search aliases…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            )}

            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : aliases.length === 0 ? (
                <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
                    No aliases yet.
                </div>
            ) : filteredAliases.length === 0 ? (
                <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
                    No aliases match "{search}".
                </div>
            ) : (
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10" />
                                <TableHead className="w-10" />
                                <TableHead>Alias</TableHead>
                                <TableHead className="w-8" />
                                <TableHead>Destination</TableHead>
                                {isAllMode && <TableHead>Domain</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAliases.map((alias) => (
                                <TableRow
                                    key={alias.tag}
                                    className={cn(!alias.enabled && "opacity-60")}
                                >
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditTarget(alias)}
                                            aria-label="Edit alias"
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={cn(
                                                "block size-2.5 rounded-full",
                                                alias.enabled ? "bg-emerald-500" : "bg-rose-400"
                                            )}
                                            aria-label={alias.enabled ? "Enabled" : "Disabled"}
                                        />
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <Tooltip>
                                            <TooltipTrigger
                                                render={
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(alias.from);
                                                            toast.success("Copied to clipboard");
                                                        }}
                                                        className={cn(
                                                            "text-left",
                                                            !alias.enabled && "line-through"
                                                        )}
                                                    />
                                                }
                                            >
                                                {alias.from && (
                                                    <>
                                                        <b>{alias.from.split("@")[0]}</b>@
                                                        {alias.from.split("@")[1]}
                                                    </>
                                                )}
                                            </TooltipTrigger>
                                            <TooltipContent>Copy</TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        <ArrowRight className="size-4" />
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {alias.to}
                                    </TableCell>
                                    {isAllMode && (
                                        <TableCell>
                                            <Badge variant="secondary">{alias.domain}</Badge>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {connections.length > 0 && (
                <AliasDialog
                    open={createOpen}
                    onOpenChange={setCreateOpen}
                    connections={
                        isAllMode
                            ? connections
                            : activeConnection
                                ? [activeConnection]
                                : connections
                    }
                    onChange={handleChange}
                />
            )}
            {editTarget && editConnection && (
                <AliasDialog
                    open={!!editTarget}
                    onOpenChange={(open) => !open && setEditTarget(null)}
                    connections={[editConnection]}
                    customAddress={editTarget}
                    onChange={(updated, action) => {
                        handleChange(updated, action);
                        if (action !== "update") setEditTarget(null);
                    }}
                />
            )}
        </div>
    );
}
