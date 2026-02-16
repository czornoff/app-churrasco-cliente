'use client'

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { registerUserAction } from "@/lib/actions/auth";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const [view, setView] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);

    const errorMessage = error === "InactiveAccount"
        ? "Sua conta está inativa. Aguarde a aprovação de um administrador."
        : error === "CredentialsSignin"
            ? "E-mail ou senha incorretos."
            : error === "OAuthSignin"
                ? "Erro ao entrar com Google."
                : null;

    async function handleRegister(formData: FormData) {
        setLoading(true);
        const result = await registerUserAction(formData);
        setLoading(false);

        if (result.success) {
            toast.success("Conta criada! Agora faça login.");
            setView('login');
        } else {
            toast.error(result.error || "Erro ao criar conta.");
        }
    }

    async function handleCredentialsLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            if (result.error === "InactiveAccount") {
                toast.error("Conta aguardando aprovação.");
                router.push("/login?error=InactiveAccount");
            } else {
                toast.error("E-mail ou senha inválidos.");
                router.push("/login?error=CredentialsSignin");
            }
        } else {
            toast.success("Bem-vindo!");
            router.push("/admin");
            router.refresh();
        }
    }

    return (
        <div className="w-full dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 md:p-10 border border-neutral-200/50 dark:border-zinc-800/50 transition-all duration-300 rounded-sm">
            <h2 className="text-3xl font-black text-center text-neutral-900 dark:text-white mb-10 tracking-tight">
                {view === 'register' ? 'Criar Conta' : 'Acesso Administrador'}
            </h2>

            {errorMessage && (
                <div className="flex items-center gap-3 w-full bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/20 text-amber-800 dark:text-amber-400 p-4 rounded-2xl text-sm mb-8 animate-in fade-in zoom-in-95">
                    <span className="text-xl">⚠️</span>
                    <span className="font-medium">{errorMessage}</span>
                </div>
            )}

            <div className="space-y-6">
                <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/admin" })}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 hover:bg-neutral-50 dark:hover:bg-zinc-700 text-neutral-700 dark:text-zinc-200 font-bold py-4 px-4 rounded-2xl transition-all shadow-sm active:scale-[0.98] border-b-4 active:border-b-0 active:translate-y-[2px] p-3 rounded-sm"
                >
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                        alt="Google" className="w-5 h-5"
                    />
                    {view === 'register' ? 'Cadastrar com Google' : 'Entrar com Google'}
                </button>

                <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-neutral-200 dark:bg-zinc-800"></div>
                    <span className="text-[10px] text-neutral-400 dark:text-zinc-600 uppercase tracking-[0.2em] font-black whitespace-nowrap">
                        ou use seu e-mail
                    </span>
                    <div className="flex-1 h-px bg-neutral-200 dark:bg-zinc-800"></div>
                </div>

                {view === 'login' ? (
                    <form onSubmit={handleCredentialsLogin} className="flex flex-col gap-4">
                        <Input
                            name="email"
                            type="email"
                            placeholder="E-mail"
                            required
                            disabled={loading}
                            className="w-full h-14 rounded-2xl border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-950/50 dark:text-white outline-none focus-visible:ring-4 focus-visible:ring-orange-500/10 focus-visible:border-orange-500 transition-all placeholder:text-neutral-400 dark:placeholder:text-zinc-600 px-5 text-base font-medium p-3 rounded-sm"
                        />
                        <Input
                            name="password"
                            type="password"
                            placeholder="Senha"
                            required
                            disabled={loading}
                            className="w-full h-14 rounded-2xl border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-950/50 dark:text-white outline-none focus-visible:ring-4 focus-visible:ring-orange-500/10 focus-visible:border-orange-500 transition-all placeholder:text-neutral-400 dark:placeholder:text-zinc-600 px-5 text-base font-medium p-3 rounded-sm"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 rounded-2xl transition-all shadow-xl shadow-orange-600/10 mt-2 bg-orange-600 hover:bg-orange-500 text-white text-lg font-black active:scale-95 text-center no-underline disabled:opacity-50 p-3 rounded-sm"
                        >
                            {loading ? 'Processando...' : 'Entrar na Plataforma'}
                        </button>
                    </form>
                ) : (
                    <form action={handleRegister} className="flex flex-col gap-4">
                        <Input
                            name="nome"
                            type="text"
                            placeholder="Nome completo"
                            required
                            disabled={loading}
                            className="w-full h-14 rounded-2xl border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-950/50 dark:text-white outline-none focus-visible:ring-4 focus-visible:ring-orange-500/10 focus-visible:border-orange-500 transition-all placeholder:text-neutral-400 dark:placeholder:text-zinc-600 px-5 text-base font-medium"
                        />
                        <Input
                            name="email"
                            type="email"
                            placeholder="E-mail corporativo"
                            required
                            disabled={loading}
                            className="w-full h-14 rounded-2xl border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-950/50 dark:text-white outline-none focus-visible:ring-4 focus-visible:ring-orange-500/10 focus-visible:border-orange-500 transition-all placeholder:text-neutral-400 dark:placeholder:text-zinc-600 px-5 text-base font-medium"
                        />
                        <Input
                            name="password"
                            type="password"
                            placeholder="Criar senha"
                            required
                            disabled={loading}
                            className="w-full h-14 rounded-2xl border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-950/50 dark:text-white outline-none focus-visible:ring-4 focus-visible:ring-orange-500/10 focus-visible:border-orange-500 transition-all placeholder:text-neutral-400 dark:placeholder:text-zinc-600 px-5 text-base font-medium"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 rounded-2xl transition-all shadow-xl shadow-orange-600/10 mt-2 bg-orange-600 hover:bg-orange-500 text-white text-lg font-black active:scale-95 text-center no-underline disabled:opacity-50"
                        >
                            {loading ? 'Criando...' : 'Finalizar Cadastro'}
                        </button>
                    </form>
                )}

                <div className="pt-6 text-center space-y-8">
                    <p className="text-sm text-neutral-500 dark:text-zinc-500 font-bold uppercase tracking-widest">
                        {view === 'register' ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
                    </p>

                    <button
                        type="button"
                        onClick={() => setView(view === 'login' ? 'register' : 'login')}
                        className="m-2 text-orange-600 dark:text-orange-400 font-black hover:underline underline-offset-4"
                    >
                        {view === 'register' ? ' Faça Login' : ' Cadastre-se'}
                    </button>

                    <div className="pt-2">
                        <a
                            href="/"
                            className="inline-flex items-center text-[10px] uppercase tracking-[0.3em] text-neutral-400 dark:text-zinc-700 hover:text-orange-600 dark:hover:text-orange-500 transition-colors font-black"
                        >
                            ← Voltar para o Início
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
