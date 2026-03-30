'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Trash2, Mail, MessageCircle, Star } from 'lucide-react';
import { toast } from 'sonner';
import { saveCalculationAction } from '@/lib/actions/calculation';
import { sendCalculationEmailAction } from '@/lib/actions/email';


interface Produto {
    _id: string;
    nome: string;
    preco: number;
    gramasPorAdulto?: number;
    gramasEmbalagem?: number;
    mlPorAdulto?: number;
    mlEmbalagem?: number;
    qtdePorAdulto?: number;
    tipoSuprimento?: string;
    categoria?: string;
    imageUrl?: string;
    subCategoriaBebida?: 'alcoolica' | 'nao-alcoolica';
}

interface CalculadoraFormData {
    homens: number;
    mulheres: number;
    criancas: number;
    pessoasQueBebem: number;
    horasEvento: number;
    produtosSelecionados: string[];
}

interface ResultadoCalculo {
    totalPessoas: number;
    pessoasAdultas: number;
    pessoasQueBebem: number;
    produtosCalculo: Array<{
        produtoId: string;
        nome: string;
        preco: number;
        quantidade: number;
        quantidadeEmbalagem: number;
        tamanhoEmbalagem: number;
        totalPreco: number;
        categoria?: string;
        subCategoriaBebida?: 'alcoolica' | 'nao-alcoolica';
        unidade: string;
    }>;
    totalCusto: number;
}

interface CalculadoraChurrascoProps {
    produtos: Produto[];
    primaryColor: string;
    tenantId: string;
    params?: {
        grCarnePessoa?: number;
        grAcompanhamentoPessoa?: number;
        mlBebidaPessoa?: number;
        grSobremesaPessoa?: number;
        whatsApp?: string;
    };
}

export function CalculadoraChurrasco({ produtos, primaryColor, tenantId, params }: CalculadoraChurrascoProps) {
    const { data: session } = useSession();

    // Parâmetros dinâmicos do tenant com fallbacks
    const config = {
        carne: params?.grCarnePessoa ?? 400,
        acompanhamento: params?.grAcompanhamentoPessoa ?? 250,
        bebida: params?.mlBebidaPessoa ?? 1200,
        sobremesa: params?.grSobremesaPessoa ?? 100
    };

    const [formData, setFormData] = useState<CalculadoraFormData>({
        homens: 1,
        mulheres: 1,
        criancas: 0,
        pessoasQueBebem: 2,
        horasEvento: 4,
        produtosSelecionados: [],
    });

    const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
    const [emailDestino, setEmailDestino] = useState(session?.user?.email || '');
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const handleSendEmail = async () => {
        if (!emailDestino) {
            toast.error('Informe um e-mail para receber o orçamento');
            return;
        }
        if (!resultado) return;

        setIsSendingEmail(true);
        try {
            const res = await sendCalculationEmailAction({
                tenantId,
                userEmail: emailDestino,
                calculationData: {
                    eventName: formData.produtosSelecionados.length + ' itens selecionados',
                    totalPeople: {
                        men: formData.homens,
                        women: formData.mulheres,
                        children: formData.criancas,
                    },
                    items: resultado.produtosCalculo,
                    totalPrice: resultado.totalCusto
                }
            });

            if (res.success) {
                toast.success('Lista de compras e orçamento enviados com sucesso!');
            } else {
                toast.error(res.error || 'Falha ao enviar e-mail');
            }
        } catch (error) {
            toast.error('Erro ao enviar e-mail');
        } finally {
            setIsSendingEmail(false);
        }
    };

    // Agrupar produtos por categoria
    const produtosPorCategoria = produtos.reduce((acc, produto) => {
        const categoria = produto.categoria || 'Outros';
        if (!acc[categoria]) {
            acc[categoria] = [];
        }
        acc[categoria].push(produto);
        return acc;
    }, {} as Record<string, Produto[]>);

    const handleInputChange = (field: keyof CalculadoraFormData, value: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: Math.max(0, value),
        }));
    };

    const toggleProduto = (produtoId: string) => {
        setFormData(prev => ({
            ...prev,
            produtosSelecionados: prev.produtosSelecionados.includes(produtoId)
                ? prev.produtosSelecionados.filter(id => id !== produtoId)
                : [...prev.produtosSelecionados, produtoId],
        }));
    };

    const handleAdicionarERecalcular = (produtoId: string) => {
        setFormData(prev => {
            const novosSelecionados = [...prev.produtosSelecionados, produtoId];
            // Disparar o cálculo após a atualização do estado
            setTimeout(() => handleCalcularInternal(novosSelecionados), 0);
            return {
                ...prev,
                produtosSelecionados: novosSelecionados
            };
        });
    };

    const calcularEquivalentePessoas = (homens: number, mulheres: number, crianças: number): number => {
        // Calcular equivalente em pessoas adultas (homens)
        // Mulheres: 75% dos homens
        // Crianças: 50% dos homens
        return homens + (mulheres * 0.75) + (crianças * 0.5);
    };

    const handleCalcular = async () => {
        handleCalcularInternal(formData.produtosSelecionados);
    };

    const handleCalcularInternal = async (produtosSelecionadosIds: string[]) => {
        if (produtosSelecionadosIds.length === 0) {
            toast.error('Selecione pelo menos um produto');
            return;
        }

        const totalPessoas = formData.homens + formData.mulheres + formData.criancas;
        const pessoasAdultas = formData.homens + formData.mulheres;
        const pessoasEquivalentes = calcularEquivalentePessoas(formData.homens, formData.mulheres, formData.criancas);

        if (totalPessoas === 0) {
            toast.error('Defina pelo menos 1 pessoa no evento');
            return;
        }

        // Agrupar produtos selecionados por categoria e calcular fatores
        const produtosPorCategoriaMap: Record<string, Produto[]> = {};
        const totalPorCategoria: Record<string, number> = {};

        // Para bebidas, vamos separar por subcategoria
        const produtosPorSubcategoriaBebida: Record<string, Produto[]> = {};
        const totalPorSubcategoriaBebida: Record<string, number> = {};

        formData.produtosSelecionados.forEach(produtoId => {
            const produto = produtos.find(p => p._id === produtoId);
            if (!produto) return;

            const categoria = produto.categoria?.toLowerCase() || '';
            if (!produtosPorCategoriaMap[categoria]) {
                produtosPorCategoriaMap[categoria] = [];
                totalPorCategoria[categoria] = 0;
            }
            produtosPorCategoriaMap[categoria].push(produto);

            // Somar os valores por adulto de cada categoria (fatores internos de distribuição)
            if (['carnes', 'acompanhamentos', 'outros', 'sobremesas'].includes(categoria)) {
                totalPorCategoria[categoria] += produto.gramasPorAdulto ?? 0;
            } else if (categoria === 'bebidas') {
                const subCategoria = produto.subCategoriaBebida || 'nao-alcoolica';
                if (!produtosPorSubcategoriaBebida[subCategoria]) {
                    produtosPorSubcategoriaBebida[subCategoria] = [];
                    totalPorSubcategoriaBebida[subCategoria] = 0;
                }
                produtosPorSubcategoriaBebida[subCategoria].push(produto);
                totalPorSubcategoriaBebida[subCategoria] += produto.mlPorAdulto ?? 0;
            }
        });

        // REGRA: Se houver carnes mas NÃO houver acompanhamentos ou outros, aumentar consumo em 20%
        const hasCarnes = !!produtosPorCategoriaMap['carnes'];
        const hasAcompanhamentos = !!produtosPorCategoriaMap['acompanhamentos'];
        const hasOutros = !!produtosPorCategoriaMap['outros'];
        const hasAlcoolica = (produtosPorSubcategoriaBebida['alcoolica']?.length || 0) > 0;

        const multiplicadorCarnes = (hasCarnes && !hasAcompanhamentos && !hasOutros) ? 1.2 : 1.0;

        const produtosCalculo = produtosSelecionadosIds
            .map(produtoId => {
                const produto = produtos.find(p => p._id === produtoId);
                if (!produto) return null;

                let quantidadeNecessaria = 0;
                let quantidadeEmbalagens = 0;
                const categoria = produto.categoria?.toLowerCase() || '';

                // Calcular quantidade baseado na categoria com proporções dinâmicas
                if (categoria === 'carnes') {
                    const totalCarnesBase = pessoasEquivalentes * config.carne * multiplicadorCarnes;
                    const totalDesteProduto = totalPorCategoria['carnes'] || 0;
                    const fator = totalDesteProduto > 0 ? (produto.gramasPorAdulto ?? 0) / totalDesteProduto : 0;
                    quantidadeNecessaria = totalCarnesBase * fator;
                } else if (categoria === 'acompanhamentos' || categoria === 'outros') {
                    const baseConsumo = config.acompanhamento;
                    const totalDesteGrupo = (totalPorCategoria['acompanhamentos'] || 0) + (totalPorCategoria['outros'] || 0);

                    if (totalDesteGrupo < baseConsumo) {
                        // Se a soma é menor que a base, usar valor individual
                        quantidadeNecessaria = pessoasEquivalentes * (produto.gramasPorAdulto ?? 0);
                    } else {
                        // Se a soma atinge a base, aplicar fator proporcional
                        const totalConsumoBase = pessoasEquivalentes * baseConsumo;
                        const fator = totalDesteGrupo > 0 ? (produto.gramasPorAdulto ?? 0) / totalDesteGrupo : 0;
                        quantidadeNecessaria = totalConsumoBase * fator;
                    }
                } else if (categoria === 'sobremesas') {
                    const baseConsumo = config.sobremesa;
                    const totalSelecionados = totalPorCategoria['sobremesas'] || 0;
                    const fator = totalSelecionados > 0 ? (produto.gramasPorAdulto ?? 0) / totalSelecionados : 0;
                    quantidadeNecessaria = pessoasEquivalentes * baseConsumo * fator;
                } else if (categoria === 'bebidas') {
                    const subCategoria = produto.subCategoriaBebida || 'nao-alcoolica';
                    const mlPorAdulto = produto.mlPorAdulto ?? 0;
                    const baseBebida = config.bebida;

                    if (subCategoria === 'alcoolica') {
                        const totalSelecionados = totalPorSubcategoriaBebida['alcoolica'] || 0;
                        if (totalSelecionados > 0) {
                            const mlTotalConsumido = formData.pessoasQueBebem * baseBebida;
                            const fator = mlPorAdulto / totalSelecionados;
                            quantidadeNecessaria = mlTotalConsumido * fator;
                        } else {
                            quantidadeNecessaria = mlPorAdulto * formData.pessoasQueBebem;
                        }
                    } else {
                        let eqBebidaNaoAlcool = totalPessoas;

                        // Se houver álcool, aplicamos a regra de que quem bebe álcool também consome 10% de refri/suco
                        if (hasAlcoolica) {
                            const pessoasQueBebemRefri = formData.pessoasQueBebem * 0.1;
                            const pessoasQueNaoBebem = totalPessoas - formData.pessoasQueBebem;
                            eqBebidaNaoAlcool = pessoasQueNaoBebem + pessoasQueBebemRefri;
                        }

                        const mlTotalConsumido = eqBebidaNaoAlcool * baseBebida;
                        const totalSelecionados = totalPorSubcategoriaBebida['nao-alcoolica'] || 0;
                        const fator = totalSelecionados > 0 ? mlPorAdulto / totalSelecionados : 0;
                        quantidadeNecessaria = mlTotalConsumido * fator;
                    }
                } else if (categoria === 'suprimentos') {
                    if (produto.tipoSuprimento === 'CARVAO') {
                        const totalCarnesG = pessoasEquivalentes * config.carne * multiplicadorCarnes;
                        // Regra base: 1kg de carvão por 1kg de carne a cada 4 horas
                        // Carvão (g) = Carne (g) * (Horas / 4) * Multiplicador
                        quantidadeNecessaria = totalCarnesG * (formData.horasEvento / 4) * (produto.qtdePorAdulto || 1);
                    } else if (produto.tipoSuprimento === 'ACENDEDOR') {
                        quantidadeNecessaria = formData.horasEvento * (produto.qtdePorAdulto ?? 1);
                    } else {
                        quantidadeNecessaria = pessoasEquivalentes * (produto.qtdePorAdulto ?? 0);
                    }
                } else {
                    quantidadeNecessaria = pessoasEquivalentes;
                }

                // Arredondar embalagens
                const divisorEmbalagem = (categoria === 'bebidas') ? (produto.mlEmbalagem || 1) : (produto.gramasEmbalagem || 1);
                quantidadeEmbalagens = Math.ceil(quantidadeNecessaria / divisorEmbalagem);

                const totalPreco = quantidadeEmbalagens * produto.preco;
                const unidade = categoria === 'bebidas' ? 'ml' : (categoria === 'suprimentos' && produto.tipoSuprimento !== 'CARVAO') ? '' : 'g';

                return {
                    produtoId: produto._id,
                    nome: produto.nome,
                    preco: produto.preco,
                    quantidade: Math.round(quantidadeNecessaria * 100) / 100,
                    quantidadeEmbalagem: quantidadeEmbalagens,
                    tamanhoEmbalagem: (categoria === 'bebidas') ? (produto.mlEmbalagem || 0) : (produto.gramasEmbalagem || 0),
                    totalPreco: Math.round(totalPreco * 100) / 100,
                    categoria: categoria,
                    subCategoriaBebida: produto.subCategoriaBebida,
                    unidade: unidade
                };
            })
            .filter(Boolean) as Array<{
                produtoId: string;
                nome: string;
                preco: number;
                quantidade: number;
                quantidadeEmbalagem: number;
                tamanhoEmbalagem: number;
                totalPreco: number;
                categoria?: string;
                subCategoriaBebida?: 'alcoolica' | 'nao-alcoolica';
                unidade: string;
            }>;

        const totalCusto = produtosCalculo.reduce((sum, p) => sum + p.totalPreco, 0);

        const resultadoCalculo = {
            totalPessoas,
            pessoasAdultas,
            pessoasQueBebem: formData.pessoasQueBebem,
            produtosCalculo,
            totalCusto,
        };

        setResultado(resultadoCalculo);

        // Salvar se estiver logado
        if (session?.user) {
            try {
                await saveCalculationAction({
                    tenantId,
                    userId: (session.user as any).id || undefined,
                    totalPeople: {
                        men: formData.homens,
                        women: formData.mulheres,
                        children: formData.criancas
                    },
                    items: produtosCalculo,
                    totalPrice: totalCusto
                });
            } catch (err) {
                console.error("Erro ao salvar cálculo:", err);
            }
        }
    };


    const toggleCategory = (categoria: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoria]: !prev[categoria],
        }));
    };

    const handleShareWhatsApp = (toTenant: boolean = false) => {
        if (!resultado) return;

        let total = formData.homens + formData.mulheres + formData.criancas;
        const fire = String.fromCodePoint(0x1F525);
        const people = String.fromCodePoint(0x1F465);
        const meat = String.fromCodePoint(0x1F969);
        const money = String.fromCodePoint(0x1F4B0);

        let text = `*${fire} Orçamento Calculadora de Churrasco*\n\n`;
        text += `*${people} Convidados:*\n`;
        text += `Homens: ${formData.homens}\n`;
        text += `Mulheres: ${formData.mulheres}\n`;
        text += `Crianças: ${formData.criancas}\n`;
        text += `*Total:* ${total} pessoas\n\n`;

        text += `*${meat} Lista de Compras:*\n`;
        resultado.produtosCalculo.forEach(item => {
            text += `- ${item.nome}: ${item.quantidadeEmbalagem} emb.`;
            if (item.tamanhoEmbalagem > 0) {
                text += ` (${item.tamanhoEmbalagem}${item.unidade})`;
            }
            text += ` - R$ ${item.totalPreco.toFixed(2)}\n`;
        });

        text += `\n*${money} Total Estimado:* R$ ${resultado.totalCusto.toFixed(2)}`;

        const encodedText = encodeURIComponent(text);

        if (toTenant && params?.whatsApp) {
            const numbersOnly = params.whatsApp.replace(/\D/g, '');
            const finalNumber = numbersOnly.length <= 11 ? `55${numbersOnly}` : numbersOnly;
            window.open(`https://api.whatsapp.com/send/?phone=${finalNumber}&text=${encodedText}`, '_blank');
        } else {
            window.open(`https://api.whatsapp.com/send/?text=${encodedText}`, '_blank');
        }
    };

    const resetarCalculadora = () => {
        setFormData({
            homens: 1,
            mulheres: 1,
            criancas: 0,
            pessoasQueBebem: 2,
            horasEvento: 4,
            produtosSelecionados: [],
        });
        setResultado(null);
    };

    return (
        <div className="space-y-8">
            {/* Seção de Entrada de Dados */}
            <Card className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg bg-white dark:bg-zinc-800">
                <CardHeader>
                    <CardTitle className="text-xl">Informações do Evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Linha 1: Pessoas */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="homens">Homens</Label>
                            <Input
                                id="homens"
                                type="number"
                                min="0"
                                value={formData.homens}
                                onChange={(e) => handleInputChange('homens', parseInt(e.target.value) || 0)}
                                className="text-center"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mulheres">Mulheres</Label>
                            <Input
                                id="mulheres"
                                type="number"
                                min="0"
                                value={formData.mulheres}
                                onChange={(e) => handleInputChange('mulheres', parseInt(e.target.value) || 0)}
                                className="text-center"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="criancas">Crianças</Label>
                            <Input
                                id="criancas"
                                type="number"
                                min="0"
                                value={formData.criancas}
                                onChange={(e) => handleInputChange('criancas', parseInt(e.target.value) || 0)}
                                className="text-center"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pessoasQueBebem">Pessoas que bebem</Label>
                            <Input
                                id="pessoasQueBebem"
                                type="number"
                                min="0"
                                value={formData.pessoasQueBebem}
                                onChange={(e) => handleInputChange('pessoasQueBebem', parseInt(e.target.value) || 0)}
                                className="text-center"
                            />
                        </div>


                        {/* Linha 2: Duração */}
                        <div className="space-y-2">
                            <Label htmlFor="horasEvento">Duração do Evento (horas)</Label>
                            <Input
                                id="horasEvento"
                                type="number"
                                min="1"
                                max="24"
                                value={formData.horasEvento}
                                onChange={(e) => handleInputChange('horasEvento', parseInt(e.target.value) || 1)}
                                className="w-full md:w-32"
                            />
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Quanto maior a duração, maior a quantidade de bebida necessária
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Seção de Seleção de Produtos */}
            <Card className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg bg-white dark:bg-zinc-800">
                <CardHeader>
                    <CardTitle className="text-xl">Selecione os Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(produtosPorCategoria).map(([categoria, produtosCategoria]) => (
                            <div key={categoria} className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700">
                                <div 
                                    className="w-full flex items-center justify-between p-4 border-b transition-colors"
                                    style={{ 
                                        backgroundColor: primaryColor,
                                        borderColor: `${primaryColor}44` 
                                    }}
                                >
                                    <h4 className="font-bold text-white uppercase text-sm tracking-wider">{categoria}</h4>
                                </div>

                                {/* Conteúdo da Categoria */}
                                <div className="p-4 space-y-3">
                                    {produtosCategoria.map((produto) => (
                                        <label
                                            key={produto._id}
                                            className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.produtosSelecionados.includes(produto._id)}
                                                onChange={() => toggleProduto(produto._id)}
                                                className="w-5 h-5 rounded cursor-pointer accent-emerald-600 shrink-0"
                                                style={{ accentColor: primaryColor }}
                                            />
                                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                                                <img
                                                    src={produto.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(produto.nome)}&background=random`}
                                                    alt={produto.nome}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-zinc-900 dark:text-white text-sm">
                                                    {produto.nome}
                                                </div>
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    R$ {produto.preco.toFixed(2)}
                                                    {(produto.gramasEmbalagem || produto.mlEmbalagem) ? (
                                                        <span className="ml-1 opacity-70">
                                                            • {produto.gramasEmbalagem || produto.mlEmbalagem}{produto.categoria?.toLowerCase() === 'bebidas' ? 'ml' : 'g'}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-4">
                <Button
                    onClick={handleCalcular}
                    className="flex-1 text-white font-bold py-6"
                    style={{ backgroundColor: primaryColor }}
                >
                    Calcular
                </Button>
                <Button
                    onClick={resetarCalculadora}
                    variant="outline"
                    className="flex-1 py-6"
                >
                    <Trash2 size={16} className="mr-2" />
                    Resetar
                </Button>
            </div>

            {/* Resultado */}
            {resultado && (
                <Card className="bg-linear-to-br from-emerald-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-900 border-emerald-200 dark:border-emerald-900">
                    <CardHeader>
                        <CardTitle>Resultado do Cálculo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Resumo */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg">
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Total de Pessoas</p>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {resultado.totalPessoas}
                                </p>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg">
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Pessoas Adultas</p>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {resultado.pessoasAdultas}
                                </p>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg">
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Que bebem</p>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {resultado.pessoasQueBebem}
                                </p>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg">
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Custo Total</p>
                                <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                                    R$ {resultado.totalCusto.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Detalhes dos Produtos */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-zinc-900 dark:text-white">Detalhamento dos Produtos</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-emerald-200 dark:border-emerald-900">
                                            <th className="text-left p-2 text-zinc-600 dark:text-zinc-400">Produto</th>
                                            <th className="text-right p-2 text-zinc-600 dark:text-zinc-400">Quantidade</th>
                                            <th className="text-center p-2 text-zinc-600 dark:text-zinc-400">Embalagens</th>
                                            <th className="text-right p-2 text-zinc-600 dark:text-zinc-400">Valor Unit.</th>
                                            <th className="text-right p-2 text-zinc-600 dark:text-zinc-400">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultado.produtosCalculo.map((item) => (
                                            <tr key={item.produtoId} className="border-b border-zinc-200 dark:border-zinc-800">
                                                <td className="p-2 text-zinc-900 dark:text-white font-medium">
                                                    {item.subCategoriaBebida === 'alcoolica' ? (
                                                        <i>{item.nome}</i>
                                                    ) : (
                                                        item.nome
                                                    )}
                                                </td>
                                                <td className="p-2 text-right text-zinc-600 dark:text-zinc-400 text-xs">
                                                    {item.quantidade.toFixed(0)}{item.categoria === 'bebidas' ? 'ml' : item.categoria === 'suprimentos' ? '' : 'g'}
                                                </td>
                                                <td className="p-2 text-center text-zinc-900 dark:text-white font-medium">
                                                    {item.quantidadeEmbalagem}
                                                    {item.tamanhoEmbalagem > 0 && (
                                                        <span className="text-xs text-zinc-500 font-normal ml-1">
                                                            ({item.tamanhoEmbalagem}{item.unidade})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-2 text-right text-zinc-900 dark:text-white">
                                                    R$ {item.preco.toFixed(2)}
                                                </td>
                                                <td className="p-2 text-right font-semibold text-zinc-900 dark:text-white">
                                                    R$ {item.totalPreco.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>



                        {/* Upsell de Favoritos */}
                        {(() => {
                            const favoritosNaoSelecionados = produtos.filter(p => p.favorito && !formData.produtosSelecionados.includes(p._id));
                            if (favoritosNaoSelecionados.length === 0) return null;

                            return (
                                <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900 rounded-xl space-y-4">
                                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                        <h4 className="font-bold uppercase tracking-tight text-sm">Não deixe seu churrasco incompleto!</h4>
                                    </div>
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        Você ainda não selecionou estes itens que fazem toda a diferença:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {favoritosNaoSelecionados.map(item => (
                                            <div key={item._id} className="flex items-center justify-between bg-white dark:bg-zinc-800 p-3 rounded-lg border border-amber-100 dark:border-amber-900 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{item.nome}</div>
                                                    <div className="text-xs font-medium text-zinc-500">R$ {item.preco.toFixed(2)}</div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleAdicionarERecalcular(item._id)}
                                                    className="h-8 px-3 text-[10px] font-black uppercase tracking-wider text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
                                                >
                                                    + Adicionar
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Total Final */}
                        <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border-2" style={{ borderColor: primaryColor }}>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-zinc-900 dark:text-white text-lg">Valor Total do Evento:</span>
                                <span className="text-3xl font-black" style={{ color: primaryColor }}>
                                    R$ {resultado.totalCusto.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Dica */}
                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                            <p className="text-xs text-blue-900 dark:text-blue-100">
                                <strong>💡 Cálculo Personalizado:</strong> As quantidades são baseadas nos parâmetros definidos pela loja.
                                Se selecionar **apenas carnes**, o consumo base é aumentado em 20%.
                                Acompanhamentos e outros itens dividem a base de consumo. Bebidas são calculadas por ml.
                                Mulheres consomem 75% e crianças 50% dos valores base de homens adultas.
                                Embalagens são arredondadas para cima conforme o cadastro do produto.
                            </p>
                        </div>

                        {/* Envio por E-mail */}
                        <div className="pt-6 border-t border-emerald-200 dark:border-emerald-900">
                            <h4 className="font-semibold text-zinc-900 dark:text-white mb-2">Compartilhar Resultado</h4>
                            <p className="text-sm text-zinc-500 mb-4">
                                Envie a lista de compras para você ou solicite um orçamento diretamente conosco.
                            </p>

                            {/* Botoes WhatsApp */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                <Button
                                    onClick={() => handleShareWhatsApp(false)}
                                    variant="outline"
                                    className="flex-1 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                                >
                                    <MessageCircle size={16} className="mr-2" />
                                    WhatsApp (Lista)
                                </Button>
                                {params?.whatsApp && (
                                    <Button
                                        onClick={() => handleShareWhatsApp(true)}
                                        className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white"
                                    >
                                        <MessageCircle size={16} className="mr-2" />
                                        WhatsApp (Loja)
                                    </Button>
                                )}
                            </div>

                            {/* Email */}
                            <div className="flex gap-3">
                                <Input
                                    type="email"
                                    placeholder="Seu melhor e-mail para orçamento"
                                    value={emailDestino}
                                    onChange={(e) => setEmailDestino(e.target.value)}
                                    className="flex-1 bg-white dark:bg-zinc-800"
                                    disabled={isSendingEmail}
                                />
                                <Button
                                    onClick={handleSendEmail}
                                    disabled={isSendingEmail || !emailDestino}
                                    className="text-white"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {isSendingEmail ? 'Enviando...' : (
                                        <>
                                            <Mail size={16} className="mr-2" />
                                            E-mail
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            )}
        </div>
    );
}
