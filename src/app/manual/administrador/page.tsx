import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { 
    BookOpen, 
    Home, 
    Settings, 
    Users, 
    Store, 
    Package, 
    Calculator,
    FileText,
    Menu,
    UserCog,
    Plus,
    Edit,
    Trash2,
    Save,
    LogOut,
    BarChart3,
    Image,
    Palette,
    History
} from "lucide-react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function ManualAdministradorPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-orange-600" />
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                            Manual do Administrador
                        </h1>
                    </div>
                    <Link 
                        href={`${basePath}/admin`}
                        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Voltar para Admin
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
                <section className="text-center space-y-4">
                    <h2 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                        Painel de <span className="text-orange-600">Administração</span>
                    </h2>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                        Guia completo para gerenciar sua loja, produtos, usuários e configurações
                    </p>
                </section>

                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-8 md:p-12 text-white space-y-6">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                        Credenciais de Acesso Demo
                    </h3>
                    <p className="text-white/90 leading-relaxed">
                        Use estas credenciais para acessar o painel administrativo de demonstração:
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
                        href={`${basePath}/admin`}
                        className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Acessar Painel Admin
                    </Link>
                </div>

                <section className="space-y-8">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <Menu className="w-6 h-6 text-orange-600" />
                        Menu de Navegação
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Store className="w-5 h-5 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-zinc-900 dark:text-white">Lojas</h4>
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Gerenciar tiendas/lojistas cadastrados no sistema. Criar novas lojas, editar informações e configurar preferências.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Users className="w-5 h-5 text-green-600" />
                                </div>
                                <h4 className="font-bold text-zinc-900 dark:text-white">Usuários</h4>
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Gerenciar usuários clientes. Verificar histórico de cálculos, editar perfis e gerenciar acessos.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <History className="w-5 h-5 text-purple-600" />
                                </div>
                                <h4 className="font-bold text-zinc-900 dark:text-white">Histórico</h4>
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Visualize todos os cálculos realizados em todos os lojas de todos os usuários.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Calculator className="w-5 h-5 text-orange-600" />
                                </div>
                                <h4 className="font-bold text-zinc-900 dark:text-white">Cálculos</h4>
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Acompanhar todos os cálculos realizados pelos clientes. Ver detalhes e análises gerais.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                                    <FileText className="w-5 h-5 text-pink-600" />
                                </div>
                                <h4 className="font-bold text-zinc-900 dark:text-white">Menus/Páginas</h4>
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Criar e editar menus e páginas personalizadas da loja. Adicionar conteúdo rico com editor visual.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                    <UserCog className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h4 className="font-bold text-zinc-900 dark:text-white">Perfil</h4>
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Acessar e editar suas informações pessoais e preferências do sistema.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="space-y-8">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <Settings className="w-6 h-6 text-orange-600" />
                        Configurações da Loja
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 p-6 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <Image className="w-6 h-6 text-blue-600" />
                                    <h4 className="font-bold text-zinc-900 dark:text-white">Logo e Identidade</h4>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        Upload de logo da loja
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        Nome da loja / Nome do app
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        Slogan da empresa
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        Cor primária da marca
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        Definir a quantidade de consumo
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 p-6 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <Store className="w-6 h-6 text-green-600" />
                                    <h4 className="font-bold text-zinc-900 dark:text-white">Contatos da Loja</h4>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">•</span>
                                        Endereço completo
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">•</span>
                                        Email de contato
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">•</span>
                                        Número de WhatsApp
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">•</span>
                                        Link do Instagram
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 p-6 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <Package className="w-6 h-6 text-orange-600" />
                                    <h4 className="font-bold text-zinc-900 dark:text-white">Produtos</h4>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600">•</span>
                                        Cadastrar e gerenciar produtos da loja
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600">•</span>
                                        Gramas de acompanhamento por pessoa
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600">•</span>
                                        Definir preços, categorias
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600">•</span>
                                        Aplicar Descrições e Imagens
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 p-6 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <Palette className="w-6 h-6 text-purple-600" />
                                    <h4 className="font-bold text-zinc-900 dark:text-white">Menus e Páginas</h4>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-600">•</span>
                                        Crie menus exclusivos
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-600">•</span>
                                        Crie menu para suas páginas personalizadas
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-600">•</span>
                                        Crie suas páginas em html
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-600">•</span>
                                        Adicione cards para suas páginas
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-8">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-orange-600" />
                        Acompanhamento e Análises
                    </h3>

                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h4 className="font-bold text-zinc-900 dark:text-white">Histórico de Cálculos</h4>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Acompanhe todos os cálculos realizados pelos clientes da sua loja:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    <BarChart3 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                                    <span>Visualizar data e hora de cada cálculo</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    <Users className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <span>Identificar clientes que mais usam a calculadora</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    <Calculator className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <span>Analisar preferências de quantidade por evento</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-6">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Atalhos e Dicas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-mono">
                                    Esc
                                </kbd>
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Fechar modais e janelas
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Save className="w-4 h-4 text-green-600 mt-1" />
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Sempre clique em &quot;Salvar&quot; após fazer alterações
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="text-center space-y-6 pb-8">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            href={`${basePath}/admin`}
                            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-lg transition-colors"
                        >
                            <UserCog className="w-5 h-5" />
                            Acessar Painel Admin
                        </Link>
                        <Link 
                            href={`${basePath}/manual/usuario`}
                            className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold px-8 py-4 rounded-lg transition-colors border-2 border-zinc-200 dark:border-zinc-700"
                        >
                            <BookOpen className="w-5 h-5" />
                            Manual do Usuário
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 mt-16">
                <div className="max-w-6xl mx-auto px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    <p>MandeBem - Apps Inteligentes © 2026</p>
                    <p className="mt-2 text-xs">Desenvolvido por <a href="https://zornoff.com.br" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">Zornoff</a></p>
                </div>
            </footer>
        </div>
    );
}
