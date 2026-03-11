import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calculator, Flame, MapPin, Users, History, BookAudio, Mail, Instagram, ScanBarcode, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from "next/image";

export default async function Home() {
    const session = await getServerSession(authOptions);
    const currentYear = new Date().getFullYear();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center pt-8 text-center transition-colors duration-500">
            {/* Top Bar / Theme Toggle */}
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center max-w-4xl space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 py-16 px-6">
                {/* Hero Section */}
                <div className="flex flex-col items-center space-y-8">
                    {/* Logo / Icon Area */}
                    <div className="flex justify-center">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <img
                                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon-512.png`}
                                alt="Logo"
                                className="relative w-40 h-40 md:w-48 md:h-48 object-cover rounded-full bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-800 shadow-xl"
                            />
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-8xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">
                            Mande <span className="text-orange-600">Bem</span>
                        </h1>
                        <p className="text-xl md:text-3xl text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto leading-tight italic">
                            A solução inteligente para organizar seu churrasco.
                        </p>
                    </div>

                    {/* Main CTA */}
                    <div className="pt-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xl px-12 py-8 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] transition-all transform hover:scale-105 active:scale-95"
                        >
                            <Link href="./loja-modelo">
                                <Calculator className="mr-2 h-6 w-6" />
                                VEJA UMA LOJA MODELO
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* The "Gap" Section - LinkedIn Article Content */}
                <section className="w-full space-y-8 text-left bg-white dark:bg-zinc-900/40 p-8 md:p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <BookAudio size={160} className="text-orange-600" />
                    </div>

                    <div className="space-y-4 relative z-10">
                        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                            O Problema
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white leading-tight">
                            "Quanto eu levo?"
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
                            Essa dúvida consome o tempo precioso do atendimento no balcão, gera filas e, pior: faz o cliente levar menos do que precisava ou esquecer itens essenciais como carvão, pão de alho e bebidas.
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed font-bold border-l-4 border-orange-600 pl-4 italic">
                            "O lojista tem o melhor produto, mas faltava uma ferramenta para dar segurança ao cliente e agilizar a venda."
                        </p>
                    </div>
                </section>

                {/* The Concept Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <div className="space-y-4 bg-orange-600 p-8 md:p-12 rounded-3xl text-white shadow-xl flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame size={24} className="text-orange-200" />
                            <span className="text-xs font-bold uppercase tracking-widest text-orange-100">O Conceito</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black leading-tight">Simplicidade e Precisão</h2>
                        <p className="text-orange-50 text-lg leading-relaxed opacity-90">
                            Não é apenas uma calculadora. É um facilitador de negócios que transforma o PDV físico e digital.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="p-6 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 group hover:border-orange-600/30 transition-colors">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-orange-600 group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-zinc-900 dark:text-white">Para o Consumidor</h4>
                                <p className="text-sm text-zinc-500">Segurança de que não vai faltar nada no evento.</p>
                            </div>
                        </div>
                        <div className="p-6 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 group hover:border-orange-600/30 transition-colors">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-orange-600 group-hover:scale-110 transition-transform">
                                <ScanBarcode size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-zinc-900 dark:text-white">Para o Lojista</h4>
                                <p className="text-sm text-zinc-500">Agilidade no atendimento e aumento de ticket médio.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Impact / Benefits Section */}
                <div className="w-full space-y-12 py-8">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                            Impacto nos <span className="text-orange-600">Negócios</span>
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto">
                            Transforme sua loja na referência da região com tecnologia prática.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Aumento das Vendas",
                                description: "O app faz o cliente se lembrar do sal de parrilla, carvão, pão de alho e bebidas, garantindo que compre tudo na sua loja.",
                                icon: <Calculator className="text-orange-600" size={28} />
                            },
                            {
                                title: "Agilidade & Display",
                                description: "Com um QR Code no balcão ou link na bio, o cliente já chega com a lista pronta, otimizando o tempo do atendente.",
                                icon: <MapPin className="text-orange-600" size={28} />
                            },
                            {
                                title: "Fidelização Premium",
                                description: "Ao oferecer um serviço consultivo gratuito, o cliente sente segurança e volta pela experiência perfeita.",
                                icon: <History className="text-orange-600" size={28} />
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-8 bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl border border-transparent dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl hover:border-zinc-200 transition-all duration-300 group">
                                <div className="mb-6 p-4 bg-white dark:bg-zinc-800 rounded-2xl w-fit shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">{item.title}</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Partnership Invitation (CTA Section) */}
                <section className="w-full bg-zinc-900 dark:bg-zinc-100 rounded-[3rem] p-10 md:p-16 text-center space-y-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent"></div>
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-3xl md:text-5xl font-black text-white dark:text-zinc-900 leading-tight">
                            Quer o MandeBem na <span className="text-orange-600">sua loja?</span>
                        </h2>
                        <p className="text-zinc-400 dark:text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto">
                            Boutiques de cortes premium, mercados e casas de carne: vamos elevar o nível do seu atendimento juntos.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                            <Button
                                asChild
                                size="lg"
                                className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-orange-50 dark:hover:bg-zinc-800 font-bold px-8 py-7 rounded-full text-lg w-full md:w-auto"
                            >
                                <a
                                    href="https://api.whatsapp.com/send/?phone=5511993788486&text=SIM%2C%20quero%20saber%20mais%20sobre%20o%20MandeBem%20para%20minha%20loja"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MessageCircle className="mr-2 h-5 w-5 text-orange-600" />
                                    FALE CONOSCO NO WHATSAPP
                                </a>
                            </Button>
                        </div>
                    </div>
                </section>
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
