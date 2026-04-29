'use client'

import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from './UserContext';
import CloudflareProvider from './CloudflareContext';
import { SettingsProvider } from './SettingsContext';

export function Providers({ children }: any) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TooltipProvider>
                <SettingsProvider>
                    <UserProvider>
                        <CloudflareProvider>
                            {children}
                            <Toaster />
                        </CloudflareProvider>
                    </UserProvider>
                </SettingsProvider>
            </TooltipProvider>
        </ThemeProvider>
    )
}
