'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
        totalPreco: number;
        categoria?: string;
        subCategoriaBebida?: 'alcoolica' | 'nao-alcoolica';
    }>;
    totalCusto: number;
}

interface CalculadoraChurascoProps {
    produtos: Produto[];
    primaryColor: string;
}

export function CalculadoraChurrasco({ produtos, primaryColor }: CalculadoraChurascoProps) {
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

    const calcularQuantidadeCarnes = (pessoasAdultas: number, horasEvento: number): number => {
        // Fórmula: 250g base + 50g por hora
        const gramasPorPessoa = 250 + (horasEvento * 50);
        return pessoasAdultas * gramasPorPessoa; // em gramas
    };

    const calcularQuantidadeAcompanhamentos = (pessoasAdultas: number): number => {
        // Fórmula: 200g por pessoa (total de acompanhamentos)
        return pessoasAdultas * 200; // em gramas
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
        const produtosPorCategoria: Record<string, typeof produtos> = {};
        const totalPorCategoria: Record<string, number> = {};
        
        // Para bebidas, vamos separar por subcategoria
        const produtosPorSubcategoriaBebida: Record<string, typeof produtos> = {};
        const totalPorSubcategoriaBebida: Record<string, number> = {};

        formData.produtosSelecionados.forEach(produtoId => {
            const produto = produtos.find(p => p._id === produtoId);
            if (!produto) return;

            const categoria = produto.categoria?.toLowerCase() || '';
            if (!produtosPorCategoria[categoria]) {
                produtosPorCategoria[categoria] = [];
                totalPorCategoria[categoria] = 0;
            }
            produtosPorCategoria[categoria].push(produto);

            // Somar os valores por adulto de cada categoria
            if (categoria === 'carnes' || categoria === 'acompanhamentos' || categoria === 'outros' || categoria === 'sobremesas') {
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

        const produtosCalculo = formData.produtosSelecionados
            .map(produtoId => {
                const produto = produtos.find(p => p._id === produtoId);
                if (!produto) return null;

                let quantidadeNecessaria = 0;
                let quantidadeEmbalagens = 0;
                const categoria = produto.categoria?.toLowerCase() || '';

                // Calcular quantidade baseado na categoria com proporções
                if (categoria === 'carnes') {
                    // Carnes: 300g total por equivalente de pessoa
                    const totalCarnes = pessoasEquivalentes * 300;
                    const totalSelecionados = totalPorCategoria['carnes'] || 0;
                    const fator = totalSelecionados > 0 ? (produto.gramasPorAdulto ?? 0) / totalSelecionados : 0;
                    quantidadeNecessaria = totalCarnes * fator;
                } else if (categoria === 'acompanhamentos') {
                    // Acompanhamentos: 200g total por equivalente de pessoa
                    const totalSelecionados = totalPorCategoria['acompanhamentos'] || 0;
                    if (totalSelecionados < 200) {
                        // Se a soma é menor que 200g, usar valor individual
                        quantidadeNecessaria = pessoasEquivalentes * (produto.gramasPorAdulto ?? 0);
                    } else {
                        // Se a soma é 200g ou mais, aplicar fator proporcional
                        const totalAcompanhamentos = pessoasEquivalentes * 200;
                        const fator = totalSelecionados > 0 ? (produto.gramasPorAdulto ?? 0) / totalSelecionados : 0;
                        quantidadeNecessaria = totalAcompanhamentos * fator;
                    }
                } else if (categoria === 'outros' || categoria === 'sobremesas') {
                    // Usar gramasPorAdulto como proporcional do total dessa categoria
                    const totalSelecionados = totalPorCategoria[categoria] || 0;
                    const fator = totalSelecionados > 0 ? (produto.gramasPorAdulto ?? 0) / totalSelecionados : 0;
                    quantidadeNecessaria = pessoasEquivalentes * (produto.gramasPorAdulto ?? 0) * fator;
                } else if (categoria === 'bebidas') {
                    // Bebidas usam ml - calcular baseado em subcategoria
                    const subCategoria = produto.subCategoriaBebida || 'nao-alcoolica';
                    const mlPorAdulto = produto.mlPorAdulto ?? 0;
                    
                    if (subCategoria === 'alcoolica') {
                        // Bebidas alcoólicas: apenas pessoas que bebem
                        const totalSelecionados = totalPorSubcategoriaBebida['alcoolica'] || 0;
                        
                        if (totalSelecionados > 0) {
                            // Se há múltiplos produtos, distribuir proporcionalmente
                            const mlTotalConsumido = formData.pessoasQueBebem * 1200; // 1200ml base por pessoa que bebe
                            const fator = mlPorAdulto / totalSelecionados;
                            quantidadeNecessaria = mlTotalConsumido * fator;
                        } else {
                            // Um único produto: usar mlPorAdulto direto
                            quantidadeNecessaria = mlPorAdulto * formData.pessoasQueBebem;
                        }
                    } else {
                        // Bebidas não-alcoólicas: usa sempre distribuição
                        const pessoasQueBebemRefri = formData.pessoasQueBebem * 0.1;
                        const pessoasQueNaoBebem = totalPessoas - formData.pessoasQueBebem;
                        const pessoasEquivalentes = pessoasQueNaoBebem + pessoasQueBebemRefri;
                        const mlTotalConsumido = pessoasEquivalentes * 1200; // 1200ml base
                        
                        const totalSelecionados = totalPorSubcategoriaBebida['nao-alcoolica'] || 0;
                        const fator = totalSelecionados > 0 ? mlPorAdulto / totalSelecionados : 0;
                        quantidadeNecessaria = mlTotalConsumido * fator;
                    }
                } else if (categoria === 'suprimentos') {
                    // Suprimentos têm lógica especial
                    if (produto.tipoSuprimento === 'CARVAO') {
                        // Carvão: kg por kg de produto final
                        const totalCarnes = pessoasEquivalentes * 300;
                        const kgProdutoFinal = totalCarnes / 1000;
                        quantidadeNecessaria = kgProdutoFinal * (produto.qtdePorAdulto ?? 2.5);
                    } else if (produto.tipoSuprimento === 'ACENDEDOR') {
                        // Acendedor: 1 por hora
                        quantidadeNecessaria = formData.horasEvento * (produto.qtdePorAdulto ?? 1);
                    } else {
                        // Outros suprimentos: quantidade por pessoa equivalente
                        quantidadeNecessaria = pessoasEquivalentes * (produto.qtdePorAdulto ?? 0);
                    }
                } else {
                    // Fallback
                    quantidadeNecessaria = pessoasEquivalentes;
                }

                // Calcular quantidade de embalagens (arredondar para cima)
                if (categoria === 'bebidas') {
                    if (produto.mlEmbalagem && produto.mlEmbalagem > 0) {
                        quantidadeEmbalagens = Math.ceil(quantidadeNecessaria / produto.mlEmbalagem);
                    } else {
                        quantidadeEmbalagens = Math.ceil(quantidadeNecessaria);
                    }
                } else {
                    if (produto.gramasEmbalagem && produto.gramasEmbalagem > 0) {
                        quantidadeEmbalagens = Math.ceil(quantidadeNecessaria / produto.gramasEmbalagem);
                    } else {
                        quantidadeEmbalagens = Math.ceil(quantidadeNecessaria);
                    }
                }

                const totalPreco = quantidadeEmbalagens * produto.preco;

                return {
                    produtoId: produto._id,
                    nome: produto.nome,
                    preco: produto.preco,
                    quantidade: Math.round(quantidadeNecessaria * 100) / 100,
                    quantidadeEmbalagem: quantidadeEmbalagens,
                    totalPreco: Math.round(totalPreco * 100) / 100,
                    categoria: categoria,
                    subCategoriaBebida: produto.subCategoriaBebida,
                };
            })
            .filter(Boolean) as Array<{
                produtoId: string;
                nome: string;
                preco: number;
                quantidade: number;
                quantidadeEmbalagem: number;
                totalPreco: number;
                categoria?: string;
                subCategoriaBebida?: 'alcoolica' | 'nao-alcoolica';
            }>;

        const totalCusto = produtosCalculo.reduce((sum, p) => sum + p.totalPreco, 0);

        setResultado({
            totalPessoas,
            pessoasAdultas,
            pessoasQueBebem: formData.pessoasQueBebem,
            produtosCalculo,
            totalCusto,
        });
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
                                                <td className="p-2 text-center text-zinc-900 dark:text-white font-medium">{item.quantidadeEmbalagem}</td>
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
                                <strong>💡 Cálculo Proporcional:</strong> A quantidade distribuída entre produtos é proporcional aos valores cadastrados. 
                                Carnes: distribuído de 300g total. Acompanhamentos: se soma &lt; 200g, usa valor individual; senão distribui de 200g. 
                                Bebidas Alcoólicas: apenas para quem bebe. Bebidas Não-Alcoólicas: para quem não bebe + 10% de quem bebe. 
                                Mulheres comem 75% e Crianças 50% dos valores de homens. As embalagens são arredondadas para cima.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
