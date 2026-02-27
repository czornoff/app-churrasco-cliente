import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calculator, Flame, MapPin, Users, Clock10, History, BookAudio, Mail, Instagram } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function Home() {
    const session = await getServerSession(authOptions);
    const currentYear = new Date().getFullYear();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center pt-8 text-center transition-colors duration-500">
            {/* Top Bar / Theme Toggle */}
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 py-8">
                {/* Logo / Icon Area */}
                <div className="flex justify-center">
                    <div className="relative bg-white dark:bg-zinc-900 p-0 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <img
                            src="/icon-512.png"
                            alt="Logo"
                            className="w-24 h-24 object-cover"
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-tight">
                        Cálculo de <span className="text-orange-600">churrasco</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        A solução inteligente para organizar seu churrasco sem desperdícios.
                    </p>
                </div>

                {/* Features Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 max-w-2xl mx-auto">
                    <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                        <Users className="text-orange-600" size={20} />
                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">Total de Pessoas</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                        <Calculator className="text-orange-600" size={20} />
                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">Quantidades Exatas</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                        <Clock10 className="text-orange-600" size={20} />
                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">Quantidade de Horas</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                        <History className="text-orange-600" size={20} />
                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">Histórico de Consultas</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                        <BookAudio className="text-orange-600" size={20} />
                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">Cardápio de Produtos</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                        <MapPin className="text-orange-600" size={20} />
                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">Lojas Locais</span>
                    </div>
                </div>
            </div>

            {/* General Footer */}
            <footer className="w-full max-w-7xl mx-auto px-6 pt-8 border-t border-zinc-200 dark:border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="space-y-4">
                    <h3 className="text-lg font-black tracking-tight text-orange-600 uppercase">
                        Mande Bem
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                        A solução inteligente para organizar seu churrasco sem desperdícios. Desenvolvido para facilitar a vida de quem ama reunir os amigos.
                    </p>
                </div>

                <div className="space-y-4 md:text-right md:flex md:flex-col md:items-end">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-orange-600">
                        Contato
                    </h3>
                    <div className="space-y-3">
                        <a
                            href="mailto:contato@mandebem.com"
                            className="flex items-center md:justify-end gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200 group"
                        >
                            <Mail size={16} className="transition-transform group-hover:scale-110" />
                            <span>contato@mandebem.com</span>
                        </a>
                        <a
                            href="https://instagram.com/mandebem.com.apps"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center md:justify-end gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200 group"
                        >
                            <Instagram size={16} className="transition-transform group-hover:scale-110" />
                            <span>Instagram</span>
                        </a>
                    </div>
                </div>

                {/* Copyright */}
                <div className="md:col-span-2 border-t border-zinc-200 dark:border-zinc-900 text-center">
                    <div className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                        © {currentYear} MandeBem - Apps Inteligentes • Desenvolvido por{' '}
                        <a
                            href="https://zornoff.com.br"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-zinc-900 dark:hover:text-white transition-colors duration-200"
                        >
                            Zornoff
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
