import Footer from "@/components/Footer";
import Header from "@/components/Header";

const Code = ({ children }: { children: React.ReactNode }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{children}</code>
);

export default function Page() {
    return (
        <div className="flex min-h-svh flex-col">
            <Header />
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-6">
                <h1 className="text-3xl font-bold sm:text-4xl">FAQ</h1>

                <h2 className="mt-8 text-xl font-semibold">
                    What is nomail?
                </h2>
                <p className="mt-2 text-muted-foreground">
                    nomail is a fork of{" "}
                    <a
                        href="https://github.com/jessetinell/x2.email"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-foreground underline underline-offset-4 hover:text-purple-400"
                    >
                        x2.email
                    </a>
                    , a minimalistic UI on top of Cloudflare Email Routing. Huge thanks
                    to{" "}
                    <a
                        href="https://github.com/jessetinell"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-foreground underline underline-offset-4 hover:text-purple-400"
                    >
                        Jesse Tinell
                    </a>{" "}
                    for the original work. This fork adds multi-domain support, random
                    suffixes, dark mode and a refreshed design.
                </p>

                <h2 className="mt-8 text-xl font-semibold">
                    Will I be able to respond from the alias email?
                </h2>
                <p className="mt-2 text-muted-foreground">
                    No. This is a one-way email forwarder. You can only receive emails.
                </p>

                <h2 className="mt-8 text-xl font-semibold">
                    What are the limitations of Cloudflare Email Routing?
                </h2>
                <ol className="mt-3 list-decimal space-y-6 pl-6">
                    <li>
                        <b>Size</b>
                        <p>Email Routing does not support messages bigger than 25 MiB.</p>
                    </li>
                    <li>
                        <b>Email Address Internationalization (EAI):</b>
                        <ol className="mt-2 list-decimal space-y-3 pl-6">
                            <li>
                                Supported: Domains with internationalized characters.
                                <br />
                                <b>Example:</b> ✅ <Code>info@piñata.es</Code>
                            </li>
                            <li>
                                Not supported: Local-parts of email addresses with internationalized
                                characters.
                                <br />
                                <b>Example:</b> ❌ <Code>piñata@piñata.es</Code>
                            </li>
                        </ol>
                    </li>
                    <li>
                        <b>Non-delivery Reports (NDRs)</b>
                        <p>
                            Email Routing won't forward NDRs. The original sender won't get a
                            notification if the email fails to deliver.
                        </p>
                    </li>
                    <li>
                        <b>DMARC Policies & Email Forwarding</b>
                        <p>
                            Restrictive DMARC policies may lead to delivery issues for forwarded
                            emails. Consult dmarc.org for more.
                        </p>
                    </li>
                    <li>
                        <b>Replying using Cloudflare Domain</b>
                        <p>
                            If you receive a forwarded email and reply to it, the recipient will
                            see it coming from your actual email address (e.g.{" "}
                            <Code>my-name@gmail.com</Code>), not your custom Cloudflare domain
                            address (e.g. <Code>info@my-company.com</Code>).
                        </p>
                    </li>
                    <li>
                        <b>Special Characters in Custom Addresses</b>
                        <p>
                            "+" and "." are treated as standard characters. Any unique functionality
                            tied to these characters in providers like Gmail won't apply here.
                        </p>
                    </li>
                    <li>
                        <b>Subdomain Email Routing</b>
                        <p>Exclusive to Cloudflare Enterprise customers.</p>
                    </li>
                </ol>

                <h2 className="mt-8 text-xl font-semibold">Where are the emails stored?</h2>
                <p className="mt-2 text-muted-foreground">
                    Neither Cloudflare nor nomail store your emails anywhere. Cloudflare Email
                    Routing directs emails from your alias to your preferred inbox. You read them
                    in your normal email client (Gmail, Outlook, Apple Mail, etc.).
                </p>
            </main>
            <Footer />
        </div>
    );
}
