'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveCalculationAction } from '@/lib/actions/calculation';


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
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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

    const calcularEquivalentePessoas = (homens: number, mulheres: number, crianças: number): number => {
        // Calcular equivalente em pessoas adultas (homens)
        // Mulheres: 75% dos homens
        // Crianças: 50% dos homens
        return homens + (mulheres * 0.75) + (crianças * 0.5);
    };

    const handleCalcular = () => {
        if (formData.produtosSelecionados.length === 0) {
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

        const produtosCalculo = formData.produtosSelecionados
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
                        const totalCarnes = pessoasEquivalentes * config.carne * multiplicadorCarnes;
                        const kgProdutoFinal = totalCarnes / 1000;
                        quantidadeNecessaria = kgProdutoFinal * (produto.qtdePorAdulto ?? 2.5);
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
                const unidade = categoria === 'bebidas' ? 'ml' : categoria === 'suprimentos' ? '' : 'g';

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
            saveCalculationAction({
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
        }
    };


    const toggleCategory = (categoria: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoria]: !prev[categoria],
        }));
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
            <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle>Informações do Evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Linha 1: Pessoas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                </CardContent>
            </Card>

            {/* Seção de Seleção de Produtos */}
            <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle>Selecione os Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(produtosPorCategoria).map(([categoria, produtosCategoria]) => (
                            <div key={categoria} className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                                {/* Header da Categoria */}
                                <button
                                    onClick={() => toggleCategory(categoria)}
                                    className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <h4 className="font-semibold text-zinc-900 dark:text-white">{categoria}</h4>
                                    {expandedCategories[categoria] ? (
                                        <ChevronUp size={20} className="text-zinc-500" />
                                    ) : (
                                        <ChevronDown size={20} className="text-zinc-500" />
                                    )}
                                </button>

                                {/* Conteúdo da Categoria */}
                                {expandedCategories[categoria] && (
                                    <div className="p-4 space-y-3 border-t border-zinc-200 dark:border-zinc-800">
                                        {produtosCategoria.map((produto) => (
                                            <label
                                                key={produto._id}
                                                className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.produtosSelecionados.includes(produto._id)}
                                                    onChange={() => toggleProduto(produto._id)}
                                                    className="w-4 h-4 rounded cursor-pointer accent-emerald-600"
                                                    style={{ accentColor: primaryColor }}
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-zinc-900 dark:text-white text-sm">
                                                        {produto.nome}
                                                    </div>
                                                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                                        R$ {produto.preco.toFixed(2)}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
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
                                <strong>💡 Cálculo Personalizado:</strong> As quantidades são baseadas nos parâmetros definidos pelo estabelecimento.
                                Se selecionar **apenas carnes**, o consumo base é aumentado em 20%.
                                Acompanhamentos e outros itens dividem a base de consumo. Bebidas são calculadas por ml.
                                Mulheres consomem 75% e crianças 50% dos valores base de homens adultas.
                                Embalagens são arredondadas para cima conforme o cadastro do produto.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
