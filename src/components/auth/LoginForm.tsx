'use client'

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { registerUserAction } from "@/lib/actions/auth";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";

type ViewType = 'login' | 'register' | 'forgot' | 'forgot-sent';

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const callbackUrl = searchParams.get("callbackUrl") || "/admin";

    const [view, setView] = useState<ViewType>('login');
    const [loading, setLoading] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');

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
            callbackUrl: callbackUrl,
        });

        setLoading(false);

        if (result?.error) {
            if (result.error === "InactiveAccount") {
                toast.error("Conta aguardando aprovação.");
            } else if (result.error === "CredentialsSignin") {
                toast.error("E-mail ou senha inválidos.");
            } else {
                toast.error("Erro ao fazer login.");
            }
        } else if (result?.ok) {
            toast.success("Bem-vindo!");
            router.push(result.url || callbackUrl);
        }
    }

    async function handleForgotPassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail }),
            });
            setView('forgot-sent');
        } catch {
            toast.error("Erro de conexão. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full dark:bg-zinc-900 shadow-2xl p-8 md:p-10 border border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-300 rounded-lg">

            {/* === FORGOT SENT === */}
            {view === 'forgot-sent' ? (
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto">
                        <Send size={28} className="text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">E-mail enviado!</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                            Se este e-mail estiver cadastrado, você receberá as instruções de recuperação em breve. Verifique sua caixa de entrada e spam.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => { setView('login'); setForgotEmail(''); }}
                        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Voltar ao Login
                    </button>
                </div>
            ) : view === 'forgot' ? (
                /* === FORGOT PASSWORD === */
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-black text-center text-zinc-900 dark:text-white mb-2 tracking-tight">
                            Recuperar Senha
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center font-medium">
                            Informe seu e-mail para receber o link de recuperação.
                        </p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-4 h-5 w-5 text-zinc-400" />
                            <Input
                                type="email"
                                placeholder="Seu e-mail cadastrado"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full h-14 pl-12 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 dark:text-white outline-none focus-visible:ring-4 focus-visible:ring-orange-500/10 focus-visible:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 px-5 text-base font-medium rounded-lg"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 rounded-lg transition-all shadow-xl shadow-orange-600/10 mt-2 bg-orange-600 hover:bg-orange-500 text-white text-lg font-black active:scale-95 text-center disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                        </button>
                    </form>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setView('login')}
                            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        >
                            <ArrowLeft size={14} />
                            Voltar ao Login
                        </button>
                    </div>
                </div>
            ) : (
                /* === LOGIN / REGISTER === */
                <>
                    <h2 className="text-3xl font-black text-center text-zinc-900 dark:text-white mb-10 tracking-tight">
                        {view === 'register' ? 'Criar Conta' : 'Acesso Administrador'}
                    </h2>

                    {errorMessage && (
                        <div className="flex items-center gap-3 w-full bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/20 text-amber-800 dark:text-amber-400 p-4 rounded-lg text-sm mb-8 animate-in fade-in zoom-in-95">
                            <span className="text-xl">⚠️</span>
                            <span className="font-medium">{errorMessage}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <button
                            type="button"
                            onClick={() => signIn("google", { callbackUrl: callbackUrl })}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold py-4 px-4 transition-all shadow-sm active:scale-[0.98] border-b-4 active:border-b-0 active:translate-y-0.5 p-3 rounded-lg"
                        >
                            <Image
                                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                                alt="Google" className="w-5 h-5"
                                width={24}
                                height={24}
                            />
                            {view === 'register' ? 'Cadastrar com Google' : 'Entrar com Google'}
                        </button>

                        <div className="flex items-center gap-4 py-2">
                            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"></div>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] font-black whitespace-nowrap">
                                ou use seu e-mail
                            </span>
                            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"></div>
                        </div>

                        {view === 'login' ? (
                            <form onSubmit={handleCredentialsLogin} className="flex flex-col gap-4">
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="E-mail"
                                    required
                                    disabled={loading}
                                    className="w-full h-14 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 dark:text-white outline-none focus-visible:ring-4 focus-visible:ring-orange-500/10 focus-visible:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 px-5 text-base font-medium p-3 rounded-lg"
                                />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Senha"
                                    required
                                    disabled={loading}
                                    className="w-full h-14 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 dark:text-white outline-none focus-visible:ring-4 focus-visible:ring-orange-500/10 focus-visible:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 px-5 text-base font-medium p-3 rounded-lg"
                                />
                                {/* Esqueceu a senha */}
                                <div className="text-right -mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setView('forgot')}
                                        className="text-xs font-bold text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                    >
                                        Esqueceu a senha?
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 transition-all shadow-xl shadow-orange-600/10 mt-2 bg-orange-600 hover:bg-orange-500 text-white text-lg font-black active:scale-95 text-center no-underline disabled:opacity-50 p-3 rounded-lg"
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
                                    className="w-full h-14 rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 dark:text-white outline-none focus-visible:ring-4 focus-visible:ring-orange-500/10 focus-visible:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 px-5 text-base font-medium"
                                />
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="E-mail corporativo"
                                    required
                                    disabled={loading}
                                    className="w-full h-14 rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 dark:text-white outline-none focus-visible:ring-4 focus-visible:ring-orange-500/10 focus-visible:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 px-5 text-base font-medium"
                                />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Criar senha"
                                    required
                                    disabled={loading}
                                    className="w-full h-14 rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 dark:text-white outline-none focus-visible:ring-4 focus-visible:ring-orange-500/10 focus-visible:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 px-5 text-base font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 rounded-lg transition-all shadow-xl shadow-orange-600/10 mt-2 bg-orange-600 hover:bg-orange-500 text-white text-lg font-black active:scale-95 text-center no-underline disabled:opacity-50"
                                >
                                    {loading ? 'Criando...' : 'Finalizar Cadastro'}
                                </button>
                            </form>
                        )}

                        <div className="pt-6 text-center space-y-8">
                            <p className="text-sm text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-widest">
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
                                <Link
                                    href="/"
                                    className="inline-flex items-center text-[10px] uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-700 hover:text-orange-600 dark:hover:text-orange-500 transition-colors font-black"
                                >
                                    ← Voltar para o Início
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
