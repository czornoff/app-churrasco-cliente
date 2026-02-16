import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Suspense } from "react";

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full flex flex-col bg-neutral-50 dark:bg-zinc-950 transition-colors duration-300">
            {/* Theme Toggle - Fixed top-right */}
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                    <Suspense fallback={
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    }>
                        <LoginForm />
                    </Suspense>
                </div>
            </main>

            {/* Footer - Part of the flex flow, but pushed to bottom */}
            <footer className="py-8 text-center bg-transparent">
                <p className="text-[10px] text-neutral-400 dark:text-zinc-600 font-bold uppercase tracking-widest">
                    MandeBem Sistemas © 2026
                </p>
            </footer>
        </div>
    );
}
