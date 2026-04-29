"use client"
import React, { createContext, useEffect, useState } from "react";

export interface Settings {
    randomSuffix: {
        enabled: boolean;
        length: number;
    };
}

const SETTINGS_KEY = "nomail.settings";

const DEFAULT_SETTINGS: Settings = {
    randomSuffix: {
        enabled: true,
        length: 6,
    },
};

export const SUFFIX_MIN = 3;
export const SUFFIX_MAX = 10;
export const SUFFIX_CHARSET = "abcdefghijklmnopqrstuvwxyz0123456789";

export const SettingsContext = createContext<{
    settings: Settings;
    updateSettings: (s: Partial<Settings>) => void;
}>({
    settings: DEFAULT_SETTINGS,
    updateSettings: () => { },
});

export function generateSuffix(length: number): string {
    let out = "";
    for (let i = 0; i < length; i++) {
        out += SUFFIX_CHARSET[Math.floor(Math.random() * SUFFIX_CHARSET.length)];
    }
    return out;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            }
        } catch { }
    }, []);

    const updateSettings = (patch: Partial<Settings>) => {
        setSettings((prev) => {
            const next = { ...prev, ...patch };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
            return next;
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}
