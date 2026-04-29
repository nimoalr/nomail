"use client"
import React, { useEffect, useMemo, useState } from "react";
import encryption from "@/utils/encryption";
import { CloudflareApiClient } from "@/services/cloudflare";
import { CloudflareListEmailDestinationsResponse } from "@/services/cloudflare/cloudflare.types";

const STORAGE_CONNECTIONS = "nomail.connections";
const STORAGE_ACTIVE = "nomail.activeConnectionId";

export interface Connection {
    id: string;
    accountId: string;
    zoneId: string;
    accessToken: string;
    domain: string;
    destinationAddresses: string[];
}

export type ActiveSelection = string | "all" | null;

interface UserContextValue {
    isAuthenticated: boolean;
    isLoading: boolean;
    connections: Connection[];
    activeId: ActiveSelection;
    activeConnection: Connection | null;
    isAllMode: boolean;

    accountId: string;
    zoneId: string;
    accessToken: string;
    domain: string;
    destinationAddresses: string[];

    addConnection: (accountId: string, zoneId: string, accessToken: string) => Promise<boolean>;
    removeConnection: (id: string) => void;
    setActive: (id: ActiveSelection) => void;
    clearAllValues: () => void;
}

export const UserContext = React.createContext<UserContextValue>({
    isAuthenticated: false,
    isLoading: false,
    connections: [],
    activeId: null,
    activeConnection: null,
    isAllMode: false,
    accountId: "",
    zoneId: "",
    accessToken: "",
    domain: "",
    destinationAddresses: [],
    addConnection: async () => false,
    removeConnection: () => { },
    setActive: () => { },
    clearAllValues: () => { },
});

function uuid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function fetchConnectionInfo(
    accountId: string,
    zoneId: string,
    accessToken: string
): Promise<{ domain: string; destinationAddresses: string[] } | null> {
    const apiClient = new CloudflareApiClient(accessToken);
    const routingResponse = await apiClient.getEmailRouting(zoneId);
    if (!routingResponse.success) return null;

    const destResponse: CloudflareListEmailDestinationsResponse =
        await apiClient.getDestinations(accountId);

    return {
        domain: routingResponse.result.name,
        destinationAddresses: destResponse.result?.map((r: any) => r.email) || [],
    };
}

export function UserProvider({ children }: any) {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [activeId, setActiveIdState] = useState<ActiveSelection>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const stored: Connection[] = encryption.getItem(STORAGE_CONNECTIONS) || [];
        if (Array.isArray(stored) && stored.length > 0) {
            setConnections(stored);
            const savedActive = localStorage.getItem(STORAGE_ACTIVE);
            if (savedActive === "all" || stored.some((c) => c.id === savedActive)) {
                setActiveIdState(savedActive as ActiveSelection);
            } else {
                setActiveIdState(stored[0].id);
            }
        }
    }, []);

    const persist = (next: Connection[]) => {
        encryption.setItem(STORAGE_CONNECTIONS, next);
    };

    const setActive = (id: ActiveSelection) => {
        setActiveIdState(id);
        if (id) localStorage.setItem(STORAGE_ACTIVE, id);
        else localStorage.removeItem(STORAGE_ACTIVE);
    };

    const addConnection = async (accountId: string, zoneId: string, accessToken: string) => {
        setIsLoading(true);
        try {
            const existing = connections.find((c) => c.zoneId === zoneId);
            if (existing) {
                setActive(existing.id);
                return true;
            }

            const info = await fetchConnectionInfo(accountId, zoneId, accessToken);
            if (!info) return false;

            const conn: Connection = {
                id: uuid(),
                accountId,
                zoneId,
                accessToken,
                domain: info.domain,
                destinationAddresses: info.destinationAddresses,
            };
            const next = [...connections, conn];
            setConnections(next);
            persist(next);
            setActive(conn.id);
            return true;
        } finally {
            setIsLoading(false);
        }
    };

    const removeConnection = (id: string) => {
        const next = connections.filter((c) => c.id !== id);
        setConnections(next);
        persist(next);
        if (activeId === id) {
            setActive(next.length > 0 ? next[0].id : null);
        }
    };

    const clearAllValues = () => {
        setConnections([]);
        setActive(null);
        localStorage.removeItem(STORAGE_CONNECTIONS);
    };

    const activeConnection = useMemo(
        () =>
            activeId && activeId !== "all"
                ? connections.find((c) => c.id === activeId) ?? null
                : null,
        [activeId, connections]
    );
    const isAllMode = activeId === "all";

    const value: UserContextValue = {
        isAuthenticated: connections.length > 0,
        isLoading,
        connections,
        activeId,
        activeConnection,
        isAllMode,
        accountId: activeConnection?.accountId ?? "",
        zoneId: activeConnection?.zoneId ?? "",
        accessToken: activeConnection?.accessToken ?? "",
        domain: activeConnection?.domain ?? "",
        destinationAddresses: activeConnection?.destinationAddresses ?? [],
        addConnection,
        removeConnection,
        setActive,
        clearAllValues,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
