import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { BookOpen, User, Shield, ArrowRight } from "lucide-react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function ManualIndexPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 flex flex-col">
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <main className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-4xl w-full space-y-12">
                    <section className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <BookOpen className="w-10 h-10 text-orange-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                            Manuais <span className="text-orange-600">MandeBem</span>
                        </h1>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                            Escolha o manual adequado para você
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Link 
                            href={`/manual/usuario`}
                            className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-600/30 transition-all duration-300"
                        >
                            <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center">
                                <User className="w-24 h-24 text-blue-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="p-8 space-y-4">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    Manual do Usuário
                                    <ArrowRight className="w-5 h-5 text-orange-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Aprenda a usar a calculadora de churrasco, navegar pelo cardápio e 
                                    gerenciar seus cálculos. Ideal para clientes da loja.
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                                        Calculadora
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                                        Cardápio
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                                        Login
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <Link 
                            href={`/manual/administrador`}
                            className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-600/30 transition-all duration-300"
                        >
                            <div className="aspect-video bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center">
                                <Shield className="w-24 h-24 text-purple-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="p-8 space-y-4">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    Manual do Administrador
                                    <ArrowRight className="w-5 h-5 text-orange-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Guia completo para gerenciar lojas, produtos, usuários e configurações. 
                                    Ideal para lojistas e administradores.
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                                        Produtos
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                                        Usuários
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                                        Configurações
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <section className="bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-8 md:p-12 text-white space-y-6">
                        <h3 className="text-2xl font-black uppercase tracking-tight">
                            Acesso Demo
                        </h3>
                        <p className="text-white/90 leading-relaxed">
                            Use estas credenciais para testar o sistema completo:
                        </p>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold uppercase tracking-wider text-white/70 w-20">Email:</span>
                                <code className="bg-white/20 px-4 py-2 rounded-lg font-mono">loja@mandebem.com</code>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold uppercase tracking-wider text-white/70 w-20">Senha:</span>
                                <code className="bg-white/20 px-4 py-2 rounded-lg font-mono">Loj@123</code>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link 
                                href={`/loja-modelo`}
                                className="flex items-center justify-center gap-2 bg-white text-orange-600 font-bold px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors"
                            >
                                Ver Loja Modelo
                            </Link>
                            <Link 
                                href={`/admin`}
                                className="flex items-center justify-center gap-2 bg-white/20 text-white font-bold px-6 py-3 rounded-lg hover:bg-white/30 transition-colors"
                            >
                                Acessar Admin
                            </Link>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
                <div className="max-w-4xl mx-auto px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    <p>MandeBem - Apps Inteligentes © 2026</p>
                    <p className="mt-2 text-xs">Desenvolvido por <a href="https://zornoff.com.br" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">Zornoff</a></p>
                </div>
            </footer>
        </div>
    );
}
