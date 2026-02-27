'use client'

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [done, setDone] = useState(false);

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto">
                    <Lock size={28} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Link inválido</h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                    Este link de recuperação não é válido. Solicite um novo.
                </p>
                <Link href="/login">
                    <Button className="mt-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-white font-black">
                        Ir para Login
                    </Button>
                </Link>
            </div>
        );
    }

    if (done) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center mx-auto">
                    <CheckCircle size={28} className="text-green-500" />
                </div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Senha redefinida!</h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                    Sua senha foi atualizada com sucesso. Você já pode fazer login.
                </p>
                <Button
                    onClick={() => router.push("/login")}
                    className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-black"
                >
                    Ir para Login
                </Button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirm) {
            toast.error("As senhas não coincidem.");
            return;
        }
        if (password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Erro ao redefinir senha.");
            } else {
                setDone(true);
            }
        } catch {
            toast.error("Erro de conexão. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    Nova Senha
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Digite e confirme sua nova senha abaixo.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-400">
                        Nova Senha
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-11 border-2 focus-visible:ring-0 rounded-lg font-medium"
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-400">
                        Confirmar Senha
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="pl-10 h-11 border-2 focus-visible:ring-0 rounded-lg font-medium"
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest rounded-lg shadow-xl"
                >
                    {isLoading ? "Salvando..." : "Redefinir Senha"}
                </Button>
            </form>

            <div className="text-center pt-2">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors uppercase tracking-widest"
                >
                    <ArrowLeft size={12} />
                    Voltar ao Login
                </Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-500">
                <Suspense fallback={
                    <div className="flex items-center justify-center h-40">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                }>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}
