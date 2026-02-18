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
    mlPorAdulto?: number;
    qtdePorAdulto?: number;
    categoria?: string;
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
    produtosCalculo: Array<{
        produtoId: string;
        nome: string;
        preco: number;
        quantidade: number;
        totalPreco: number;
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
        return (pessoasAdultas * gramasPorPessoa) / 1000; // Converter para kg
    };

    const calcularQuantidadeBebidas = (pessoasQueBebem: number, horasEvento: number): number => {
        // Fórmula: 500ml base + 250ml por hora
        const mlPorPessoa = 500 + (horasEvento * 250);
        return pessoasQueBebem * mlPorPessoa;
    };

    const calcularQuantidadeAcompanhamentos = (pessoasAdultas: number): number => {
        // Fórmula: 200g por pessoa (total de acompanhamentos)
        return pessoasAdultas * 200; // em gramas
    };

    const handleCalcular = () => {
        if (formData.produtosSelecionados.length === 0) {
            toast.error('Selecione pelo menos um produto');
            return;
        }

        const totalPessoas = formData.homens + formData.mulheres + formData.criancas;
        const pessoasAdultas = formData.homens + formData.mulheres;

        if (totalPessoas === 0) {
            toast.error('Defina pelo menos 1 pessoa no evento');
            return;
        }

        const produtosCalculo = formData.produtosSelecionados
            .map(produtoId => {
                const produto = produtos.find(p => p._id === produtoId);
                if (!produto) return null;

                // Calcular quantidade baseado na categoria do produto
                let quantidade = 0;
                const categoria = produto.categoria?.toLowerCase() || '';

                if (categoria.includes('carne') || categoria.includes('proteína')) {
                    // Carnes: baseado em gramas por pessoa + horas
                    quantidade = calcularQuantidadeCarnes(pessoasAdultas, formData.horasEvento);
                } else if (categoria.includes('bebida')) {
                    // Bebidas: baseado em ml por pessoa bebendo
                    quantidade = calcularQuantidadeBebidas(formData.pessoasQueBebem, formData.horasEvento);
                } else if (categoria.includes('acompanhamento') || categoria.includes('acompanham')) {
                    // Acompanhamentos: baseado em gramas por pessoa
                    quantidade = calcularQuantidadeAcompanhamentos(pessoasAdultas);
                } else {
                    // Fallback para outros produtos
                    quantidade = pessoasAdultas;
                }

                const totalPreco = quantidade * produto.preco;

                return {
                    produtoId: produto._id,
                    nome: produto.nome,
                    preco: produto.preco,
                    quantidade: Math.ceil(quantidade),
                    totalPreco: Math.round(totalPreco * 100) / 100,
                };
            })
            .filter(Boolean) as Array<{
                produtoId: string;
                nome: string;
                preco: number;
                quantidade: number;
                totalPreco: number;
            }>;

        const totalCusto = produtosCalculo.reduce((sum, p) => sum + p.totalPreco, 0);

        setResultado({
            totalPessoas,
            pessoasAdultas,
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
            <Card className="border-neutral-200 dark:border-neutral-800">
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
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Quanto maior a duração, maior a quantidade de bebida necessária
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Seção de Seleção de Produtos */}
            <Card className="border-neutral-200 dark:border-neutral-800">
                <CardHeader>
                    <CardTitle>Selecione os Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(produtosPorCategoria).map(([categoria, produtosCategoria]) => (
                            <div key={categoria} className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                                {/* Header da Categoria */}
                                <button
                                    onClick={() => toggleCategory(categoria)}
                                    className="w-full flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    <h4 className="font-semibold text-neutral-900 dark:text-white">{categoria}</h4>
                                    {expandedCategories[categoria] ? (
                                        <ChevronUp size={20} className="text-neutral-500" />
                                    ) : (
                                        <ChevronDown size={20} className="text-neutral-500" />
                                    )}
                                </button>

                                {/* Conteúdo da Categoria */}
                                {expandedCategories[categoria] && (
                                    <div className="p-4 space-y-3 border-t border-neutral-200 dark:border-neutral-800">
                                        {produtosCategoria.map((produto) => (
                                            <label
                                                key={produto._id}
                                                className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.produtosSelecionados.includes(produto._id)}
                                                    onChange={() => toggleProduto(produto._id)}
                                                    className="w-4 h-4 rounded cursor-pointer accent-emerald-600"
                                                    style={{ accentColor: primaryColor }}
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-neutral-900 dark:text-white text-sm">
                                                        {produto.nome}
                                                    </div>
                                                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
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
                <Card className="bg-linear-to-br from-emerald-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-900 border-emerald-200 dark:border-emerald-900">
                    <CardHeader>
                        <CardTitle>Resultado do Cálculo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Resumo */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total de Pessoas</p>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {resultado.totalPessoas}
                                </p>
                            </div>
                            <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Pessoas Adultas</p>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {resultado.pessoasAdultas}
                                </p>
                            </div>
                            <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Custo Total</p>
                                <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                                    R$ {resultado.totalCusto.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Detalhes dos Produtos */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-neutral-900 dark:text-white">Detalhamento dos Produtos</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-emerald-200 dark:border-emerald-900">
                                            <th className="text-left p-2 text-neutral-600 dark:text-neutral-400">Produto</th>
                                            <th className="text-center p-2 text-neutral-600 dark:text-neutral-400">Qtde</th>
                                            <th className="text-right p-2 text-neutral-600 dark:text-neutral-400">Valor Unit.</th>
                                            <th className="text-right p-2 text-neutral-600 dark:text-neutral-400">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultado.produtosCalculo.map((item) => (
                                            <tr key={item.produtoId} className="border-b border-neutral-200 dark:border-neutral-800">
                                                <td className="p-2 text-neutral-900 dark:text-white font-medium">{item.nome}</td>
                                                <td className="p-2 text-center text-neutral-900 dark:text-white">{item.quantidade}</td>
                                                <td className="p-2 text-right text-neutral-900 dark:text-white">
                                                    R$ {item.preco.toFixed(2)}
                                                </td>
                                                <td className="p-2 text-right font-semibold text-neutral-900 dark:text-white">
                                                    R$ {item.totalPreco.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Total Final */}
                        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border-2" style={{ borderColor: primaryColor }}>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-neutral-900 dark:text-white text-lg">Valor Total do Evento:</span>
                                <span className="text-3xl font-black" style={{ color: primaryColor }}>
                                    R$ {resultado.totalCusto.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Dica */}
                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                            <p className="text-xs text-blue-900 dark:text-blue-100">
                                <strong>💡 Dica:</strong> Cálculo baseado em 250-300g de carne por pessoa adulta,
                                mais volume conforme a duração do evento. Bebidas calculadas em 500-750ml por pessoa,
                                também aumentando com a duração.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
