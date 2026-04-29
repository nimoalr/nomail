"use client"
import CloudflareEmailRouterSettings from "@/components/CloudflareEmailRouterSettings";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Page() {
    return (
        <div className="flex min-h-svh flex-col">
            <Header />
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-8 pb-16 md:px-6">
                <CloudflareEmailRouterSettings />
            </main>
            <Footer />
        </div>
    );
}
