'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Mail, Lock, User as UserIcon, LogIn, Chrome } from 'lucide-react';
import { registerEndUserAction } from '@/lib/actions/end-user-auth';
import { toast } from 'sonner';

interface EndUserAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
    tenantName: string;
    primaryColor: string;
}

export function EndUserAuthModal({ isOpen, onClose, tenantId, tenantName, primaryColor }: EndUserAuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.append('tenantId', tenantId);

        if (isLogin) {
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;

            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                toast.error("E-mail ou senha incorretos.");
            } else {
                toast.success("Login realizado com sucesso!");
                onClose();
                window.location.reload();
            }
        } else {
            const res = await registerEndUserAction(formData);

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(res.success);
                setIsLogin(true);
            }
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] rounded-sm p-0 overflow-hidden border-none bg-white dark:bg-zinc-950">
                <div className="relative p-8 pt-12">
                    {/* Background Accent */}
                    <div
                        className="absolute top-0 left-0 w-full h-1.5 opacity-80"
                        style={{ backgroundColor: primaryColor }}
                    />

                    <DialogHeader className="space-y-4 text-center">
                        <div
                            className="mx-auto w-12 h-12 rounded-sm flex items-center justify-center text-white shadow-lg"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <LogIn size={24} />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                                {isLogin ? 'Bem-vindo de volta!' : 'Criar sua conta'}
                            </DialogTitle>
                            <DialogDescription className="text-zinc-500 dark:text-zinc-500 font-medium">
                                {isLogin
                                    ? `Acesse seu cardápio em ${tenantName}`
                                    : `Cadastre-se para aproveitar o melhor de ${tenantName}`}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="mt-8 space-y-6">
                        {/* Social Login */}
                        <Button
                            variant="outline"
                            className="w-full h-12 font-bold border-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-sm transition-all flex items-center justify-center gap-3"
                            onClick={() => signIn('google')}
                        >
                            <Chrome size={20} className="text-blue-600" />
                            Continuar com Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-400 font-bold">ou use seu e-mail</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Nome Completo</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <Input
                                            name="nome"
                                            placeholder="Seu nome"
                                            className="pl-10 h-11 border-2 focus-visible:ring-0 rounded-sm font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">E-mail</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="exemplo@email.com"
                                        className="pl-10 h-11 border-2 focus-visible:ring-0 rounded-sm font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <Input
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-11 border-2 focus-visible:ring-0 rounded-sm font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-sm font-black uppercase tracking-widest text-white shadow-xl hover:opacity-90 transition-all rounded-sm"
                                disabled={isLoading}
                                style={{ backgroundColor: primaryColor }}
                            >
                                {isLoading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}
                            </Button>
                        </form>

                        <div className="text-center pt-2">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                {isLogin ? 'Não tem uma conta? Crie agora' : 'Já tem uma conta? Entre aqui'}
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
