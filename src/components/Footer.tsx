import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Footer({ className }: { className?: string }) {
    return (
        <footer
            className={cn(
                "border-t bg-background/60 backdrop-blur-sm",
                className
            )}
        >
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6 py-4 text-xs lowercase text-muted-foreground">
                <p>
                    fork of{" "}
                    <Link
                        href="https://github.com/jessetinell/x2.email"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-foreground underline underline-offset-4 hover:text-purple-400"
                    >
                        x2.email
                    </Link>{" "}
                    made by{" "}
                    <Link
                        href="https://nimoa.fr"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-foreground underline underline-offset-4 hover:text-purple-400"
                    >
                        nimoa
                    </Link>
                </p>
                <span aria-hidden="true">·</span>
                <Link
                    href="/faq"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-purple-400"
                >
                    faq
                </Link>
                <span aria-hidden="true">·</span>
                <Link
                    href="https://github.com/nimoalr/nomail"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-purple-400"
                >
                    github
                </Link>
            </div>
        </footer>
    );
}
