import React, { useContext, useMemo } from "react";
import { CloudflareApiClient } from "@/services/cloudflare";
import { UserContext } from "./UserContext";

type CloudflareContextType = {
    cloudflareApi: CloudflareApiClient | null;
    getApi: (connectionId: string) => CloudflareApiClient | null;
};

export const CloudflareContext = React.createContext<CloudflareContextType>({
    cloudflareApi: null,
    getApi: () => null,
});

const CloudflareProvider = ({ children }: any) => {
    const { connections, activeConnection } = useContext(UserContext);

    const apis = useMemo(() => {
        const map = new Map<string, CloudflareApiClient>();
        for (const c of connections) {
            map.set(c.id, new CloudflareApiClient(c.accessToken));
        }
        return map;
    }, [connections]);

    const cloudflareApi = activeConnection ? apis.get(activeConnection.id) ?? null : null;
    const getApi = (connectionId: string) => apis.get(connectionId) ?? null;

    return (
        <CloudflareContext.Provider value={{ cloudflareApi, getApi }}>
            {children}
        </CloudflareContext.Provider>
    );
};

export default CloudflareProvider;
