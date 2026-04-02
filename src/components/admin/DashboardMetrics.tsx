'use client'

import { useState } from 'react';
import { Users, Calculator, MessageCircle, Package, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardStats } from '@/lib/actions/dashboard-stats';

type PeriodKey = 'lastDay' | 'lastWeek' | 'lastMonth' | 'total';

const periods: { key: PeriodKey; label: string; shortLabel: string }[] = [
    { key: 'lastDay', label: 'Último Dia', shortLabel: '24h' },
    { key: 'lastWeek', label: 'Última Semana', shortLabel: '7d' },
    { key: 'lastMonth', label: 'Último Mês', shortLabel: '30d' },
    { key: 'total', label: 'Total', shortLabel: 'Total' },
];

const metricCards = [
    {
        key: 'users' as const,
        title: 'Usuários',
        description: 'Cadastrados no período',
        icon: Users,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        accentBorder: 'border-blue-500/20 dark:border-blue-400/20',
        gradient: 'from-blue-500/5 to-blue-600/10',
    },
    {
        key: 'calculations' as const,
        title: 'Cálculos Feitos',
        description: 'Cálculos realizados',
        icon: Calculator,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        accentBorder: 'border-emerald-500/20 dark:border-emerald-400/20',
        gradient: 'from-emerald-500/5 to-emerald-600/10',
    },
    {
        key: 'whatsappSent' as const,
        title: 'WhatsApp Enviados',
        description: 'Compartilhamentos feitos',
        icon: MessageCircle,
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-500/10',
        accentBorder: 'border-green-500/20 dark:border-green-400/20',
        gradient: 'from-green-500/5 to-green-600/10',
    },
    {
        key: 'products' as const,
        title: 'Produtos Cadastrados',
        description: 'Itens no cardápio',
        icon: Package,
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-500/10',
        accentBorder: 'border-orange-500/20 dark:border-orange-400/20',
        gradient: 'from-orange-500/5 to-orange-600/10',
    },
];

export function DashboardMetrics({ stats }: { stats: DashboardStats }) {
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('total');

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                    <Calendar size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Período</span>
                </div>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 gap-1">
                    {periods.map((period) => (
                        <button
                            key={period.key}
                            onClick={() => setSelectedPeriod(period.key)}
                            className={`
                                px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-300
                                ${selectedPeriod === period.key
                                    ? 'bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-sm'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }
                            `}
                        >
                            <span className="hidden sm:inline">{period.label}</span>
                            <span className="sm:hidden">{period.shortLabel}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricCards.map((metric) => {
                    const value = stats[metric.key][selectedPeriod];
                    const totalValue = stats[metric.key].total;
                    const percentage = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;

                    return (
                        <Card
                            key={metric.key}
                            className={`
                                border border-zinc-200/50 dark:border-zinc-600/50 
                                shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 
                                transition-all duration-300 rounded-lg overflow-hidden group relative
                            `}
                        >
                            {/* Gradient background accent */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                                <CardTitle className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                                    {metric.title}
                                </CardTitle>
                                <div className={`p-2.5 rounded-lg ${metric.bg} ${metric.color} transition-all group-hover:scale-110 group-hover:rotate-3 duration-500`}>
                                    <metric.icon size={20} />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-4xl font-black text-zinc-900 dark:text-white mb-1 tracking-tighter transition-all duration-300">
                                    {value.toLocaleString('pt-BR')}
                                </div>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mb-3">
                                    {metric.description}
                                </p>

                                {/* Progress bar for period vs total */}
                                {selectedPeriod !== 'total' && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                                <TrendingUp size={10} />
                                                {percentage}% do total
                                            </span>
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                                                {totalValue.toLocaleString('pt-BR')} total
                                            </span>
                                        </div>
                                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ease-out ${metric.color.includes('blue')
                                                    ? 'bg-blue-500'
                                                    : metric.color.includes('emerald')
                                                        ? 'bg-emerald-500'
                                                        : metric.color.includes('green')
                                                            ? 'bg-green-500'
                                                            : 'bg-orange-500'
                                                    }`}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
