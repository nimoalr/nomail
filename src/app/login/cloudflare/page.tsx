import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Page() {
    return (
        <div className="flex min-h-svh flex-col">
            <Header />
            <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 md:px-6">
                <h1 className="text-3xl font-black sm:text-4xl">Getting started</h1>
                <div className="mt-4 space-y-4 text-muted-foreground">
                    <p>
                        To use nomail you will need a Cloudflare® account and a web domain
                        connected to it.
                    </p>
                    <p>
                        <b className="text-foreground">Why this complexity?</b>
                        <br />
                        This app is currently targeted at tech-savvy users with Cloudflare
                        accounts, who own one or more domains.
                    </p>
                    <p>
                        The goal is to provide a clean UI to manage disposable emails and let
                        Cloudflare do the heavy lifting.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
