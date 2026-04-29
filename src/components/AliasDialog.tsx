"use client"
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { CloudflareContext } from "@/context/CloudflareContext";
import { SettingsContext, generateSuffix } from "@/context/SettingsContext";
import { Connection } from "@/context/UserContext";
import { CloudflareEmailRule } from "@/services/cloudflare/cloudflare.types";
import { CloudflareUtils } from "@/utils";
import { CustomAddress } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    connections: Connection[];
    customAddress?: CustomAddress;
    onChange: (
        updated: CustomAddress,
        action: "insert" | "update" | "delete"
    ) => void;
}

export default function AliasDialog({
    open,
    onOpenChange,
    connections,
    customAddress,
    onChange,
}: Props) {
    const { getApi } = useContext(CloudflareContext);
    const { settings } = useContext(SettingsContext);

    const isEdit = !!customAddress?.tag;

    const editConnection = useMemo(
        () =>
            customAddress?.connectionId
                ? connections.find((c) => c.id === customAddress.connectionId) ?? null
                : null,
        [customAddress, connections]
    );

    const [selectedConnectionId, setSelectedConnectionId] = useState<string>(
        editConnection?.id || connections[0]?.id || ""
    );

    const connection = useMemo<Connection | null>(
        () =>
            isEdit
                ? editConnection
                : connections.find((c) => c.id === selectedConnectionId) ?? connections[0] ?? null,
        [isEdit, editConnection, selectedConnectionId, connections]
    );

    const destinationAddresses = connection?.destinationAddresses ?? [];

    const [from, setFrom] = useState("");
    const [to, setTo] = useState(destinationAddresses[0] || "");
    const [enabled, setEnabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [previewSuffix, setPreviewSuffix] = useState("");

    useEffect(() => {
        if (open) {
            setFrom(customAddress?.from ? customAddress.from.split("@")[0] : "");
            setTo(customAddress?.to || destinationAddresses[0] || "");
            setEnabled(customAddress?.enabled ?? true);
            if (!isEdit) {
                setSelectedConnectionId(connections[0]?.id || "");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, customAddress]);

    // Regenerate the preview suffix whenever the dialog opens or the length changes
    useEffect(() => {
        if (open && !isEdit && settings.randomSuffix.enabled) {
            setPreviewSuffix(generateSuffix(settings.randomSuffix.length));
        }
    }, [open, isEdit, settings.randomSuffix.enabled, settings.randomSuffix.length]);

    // Reset destination when the selected connection changes (its destination list may differ)
    useEffect(() => {
        if (!isEdit && open) {
            setTo(destinationAddresses[0] || "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedConnectionId]);

    const onSubmit = async () => {
        if (isSaving || !connection) return;
        if (!from) {
            toast.error("Please enter an alias");
            return;
        }

        const api = getApi(connection.id);
        if (!api) return;

        const { domain, zoneId } = connection;

        setIsSaving(true);
        try {
            const { enabled: suffixEnabled } = settings.randomSuffix;
            const aliasLocal = isEdit
                ? from
                : suffixEnabled && previewSuffix
                    ? `${from}-${previewSuffix}`
                    : from;
            const alias = `${aliasLocal}@${domain}`;

            const rule: CloudflareEmailRule = {
                tag: customAddress?.tag || null,
                actions: [{ type: "forward", value: [to] }],
                enabled,
                matchers: [{ field: "to", type: "literal", value: alias }],
            };

            if (isEdit) {
                const response = await api.updateEmailRule(zoneId, rule);
                const updated = CloudflareUtils.mapCreateEmailRuleResponseToCustomAddress(response);
                if (updated) {
                    onChange(
                        { ...updated, connectionId: connection.id, domain },
                        "update"
                    );
                }
            } else {
                const response = await api.createEmailRule(zoneId, rule);
                const updated = CloudflareUtils.mapCreateEmailRuleResponseToCustomAddress(response);
                if (updated) {
                    onChange(
                        { ...updated, connectionId: connection.id, domain },
                        "insert"
                    );
                    navigator.clipboard.writeText(alias);
                    toast.success(`${alias} copied to clipboard`);
                }
            }
            onOpenChange(false);
        } catch (e: any) {
            toast.error(e.message || "Failed to save alias");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!customAddress?.tag || !connection) return;
        if (!confirm("Are you sure you want to delete this alias?")) return;

        const api = getApi(connection.id);
        if (!api) return;

        setIsDeleting(true);
        try {
            await api.deleteEmailRule(connection.zoneId, customAddress.tag);
            onChange(customAddress, "delete");
            toast.success(`Deleted ${customAddress.from}`);
            onOpenChange(false);
        } finally {
            setIsDeleting(false);
        }
    };

    const showDomainPicker = !isEdit && connections.length > 1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit alias" : "Create alias"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {showDomainPicker && (
                        <div className="space-y-1.5">
                            <Label htmlFor="alias-domain">Domain</Label>
                            <select
                                id="alias-domain"
                                value={selectedConnectionId}
                                onChange={(e) => setSelectedConnectionId(e.target.value)}
                                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            >
                                {connections.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.domain}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="alias-from">Alias</Label>
                        <div className="flex items-center rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                            <Input
                                id="alias-from"
                                autoFocus
                                placeholder="alias"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="border-0 focus-visible:ring-0 focus-visible:border-transparent"
                            />
                            <span className="px-3 text-sm text-muted-foreground whitespace-nowrap">
                                {!isEdit && settings.randomSuffix.enabled && previewSuffix && (
                                    <span className="text-foreground/60">-{previewSuffix}</span>
                                )}
                                @{connection?.domain || ""}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="alias-to">Destination</Label>
                        <select
                            id="alias-to"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            {destinationAddresses.map((address) => (
                                <option key={address} value={address}>
                                    {address}
                                </option>
                            ))}
                        </select>
                    </div>

                    {isEdit && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="alias-enabled"
                                    checked={enabled}
                                    onCheckedChange={setEnabled}
                                />
                                <Label htmlFor="alias-enabled">Enabled</Label>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-destructive hover:text-destructive"
                            >
                                {isDeleting ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Trash2 className="size-4" />
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter className="!justify-between">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        <X className="size-4" /> Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={isSaving || !connection}>
                        {isSaving && <Loader2 className="size-4 animate-spin" />}
                        {isEdit ? "Save" : "Create alias"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
