import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { Calculator, Utensils, MapPin, User, LogIn, Sun, Moon, Home, BookOpen } from "lucide-react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function ManualUsuarioPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-orange-600" />
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                            Manual do Usuário
                        </h1>
                    </div>
                    <Link 
                        href={`/manual`}
                        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Voltar para Manuais
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
                <section className="text-center space-y-4">
                    <h2 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                        Como usar a <span className="text-orange-600">Loja</span>
                    </h2>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                        Guia completo para calcular seu churrasco e navegar pelo cardápio
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center p-8">
                            <img 
                                src="https://res.cloudinary.com/dt6juutam/image/upload/c_crop,g_custom/c_fill,ar_1:1,w_500/v1772758044/oqwvojiaa4o8ialrba1s.png"
                                alt="Loja Modelo"
                                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-xl"
                            />
                        </div>
                        <div className="p-6 space-y-4">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Home className="w-5 h-5 text-blue-600" />
                                Página Inicial
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                Ao acessar a loja, você verá a página inicial com o logo, nome e slogan da loja. 
                                Há botões para acessar a Calculadora e o Cardápio, além de informações sobre a localização.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                                    Logo personalizado
                                </span>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                                    Botões de navegação
                                </span>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                                    Mapa de localização
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <div className="aspect-video bg-gradient-to-br from-orange-500/10 to-orange-600/20 flex items-center justify-center p-8">
                            <div className="text-center space-y-4">
                                <Calculator className="w-20 h-20 text-orange-600 mx-auto" />
                                <p className="text-sm font-bold text-orange-600 uppercase tracking-widest">
                                    Calculadora de Churrasco
                                </p>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-orange-600" />
                                Calculadora
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                A calculadora permite que você informe o número de convidados e receba automaticamente 
                                a quantidade recomendada de carnes, acompanhamentos, bebidas e sobremesas.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold rounded-full">
                                    Cálculo automático
                                </span>
                                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold rounded-full">
                                    Lista de compras
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <div className="aspect-video bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center p-8">
                            <div className="text-center space-y-4">
                                <Utensils className="w-20 h-20 text-green-600 mx-auto" />
                                <p className="text-sm font-bold text-green-600 uppercase tracking-widest">
                                    Cardápio
                                </p>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Utensils className="w-5 h-5 text-green-600" />
                                Cardápio
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                No cardápio você encontra todos os produtos disponíveis na loja, com preços, 
                                descrições e opções de personalização. Navegue pelas categorias para encontrar o que procura.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">
                                    Lista de produtos
                                </span>
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">
                                    Categorias
                                </span>
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">
                                    Preços
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <div className="aspect-video bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center p-8">
                            <div className="text-center space-y-4">
                                <User className="w-20 h-20 text-purple-600 mx-auto" />
                                <p className="text-sm font-bold text-purple-600 uppercase tracking-widest">
                                    Área do Cliente
                                </p>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <LogIn className="w-5 h-5 text-purple-600" />
                                Login / Cadastro
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                Faça login ou cadastre-se para acessar recursos exclusivos como histórico de 
                                cálculos e salvar seus churrascos favoritos. Clique no botão "Entrar" no menu.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                                    Histórico
                                </span>
                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                                    Churrascos salvos
                                </span>
                            </div>
                        </div>
                    </section>
                </div>

                <section className="bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-8 md:p-12 text-white space-y-6">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                        Acesso Demo
                    </h3>
                    <p className="text-white/90 leading-relaxed">
                        Para testar a experiência completa, você pode usar estas credenciais de demonstração:
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
                    <Link 
                        href={`/admin`}
                        className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                        Acessar Painel Admin Demo
                    </Link>
                </section>

                <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-6">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Perguntas Frequentes
                    </h3>
                    <div className="space-y-4">
                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer text-zinc-900 dark:text-white font-semibold">
                                Como funciona a calculadora?
                                <span className="text-orange-600 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                A calculadora usa médias recomendadas por pessoa para cada tipo de alimento. 
                                Você informa o número de convidados e ela calcula automaticamente as quantidades 
                                de carnes, acompanhamentos, bebidas e sobremesas necessárias.
                            </p>
                        </details>
                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer text-zinc-900 dark:text-white font-semibold">
                                Preciso me cadastrar para usar?
                                <span className="text-orange-600 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                Não! A calculadora e o cardápio podem ser acessados sem cadastro. 
                                O cadastro é necessário apenas para salvar seu histórico de cálculos e 
                                acessar funcionalidades exclusivas.
                            </p>
                        </details>
                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer text-zinc-900 dark:text-white font-semibold">
                                Como entro em contato com a loja?
                                <span className="text-orange-600 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                Você pode entrar em contato pelo WhatsApp clicando no ícone verde no canto 
                                inferior direito da página, ou pelo email disponível no rodapé.
                            </p>
                        </details>
                    </div>
                </section>

                <section className="text-center space-y-6 pb-8">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            href={`/manual/administrador`}
                            className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold px-8 py-4 rounded-lg transition-colors border-2 border-zinc-200 dark:border-zinc-700"
                        >
                            <BookOpen className="w-5 h-5" />
                            Manual do Administrador
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 mt-16">
                <div className="max-w-5xl mx-auto px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    <p>MandeBem - Apps Inteligentes © 2026</p>
                    <p className="mt-2 text-xs">Desenvolvido por <a href="https://zornoff.com.br" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">Zornoff</a></p>
                </div>
            </footer>
        </div>
    );
}
