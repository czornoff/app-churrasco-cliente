'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calculator, Calendar, Users, Flame, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CalculationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    calculation: any;
}

export function CalculationDetailModal({ isOpen, onClose, calculation }: CalculationDetailModalProps) {
    if (!calculation) return null;

    const totalPessoas = calculation.totalPeople.men + calculation.totalPeople.women + calculation.totalPeople.children;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl bg-zinc-50 dark:bg-zinc-950 p-0">
                <div className="bg-orange-600 p-8 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Flame size={32} />
                            Detalhes do Churrasco
                        </DialogTitle>
                    </DialogHeader>
                    <p className="mt-2 text-orange-100 font-medium opacity-90">
                        {calculation.eventName} • {new Date(calculation.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Resumo de Pessoas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Total</p>
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-orange-600" />
                                <span className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{totalPessoas}</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Homens</p>
                            <span className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{calculation.totalPeople.men}</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Mulheres</p>
                            <span className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{calculation.totalPeople.women}</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Crianças</p>
                            <span className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{calculation.totalPeople.children}</span>
                        </div>
                    </div>

                    {/* Itens Calculados */}
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                            <Calculator size={16} />
                            Quantidades Sugeridas
                        </h3>
                        <div className="space-y-2">
                            {calculation.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.nome}</span>
                                        <span className="text-[10px] uppercase font-bold text-zinc-400">{item.categoria}</span>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-lg font-black text-orange-600">
                                            {item.quantidade} <span className="text-xs uppercase text-zinc-400">
                                                {item.unidade || (item.categoria === 'bebidas' ? 'ml' : (item.categoria === 'suprimentos' ? '' : 'g'))}
                                            </span>
                                        </span>
                                        {item.quantidadeEmbalagem > 0 && (
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">
                                                {item.quantidadeEmbalagem} emb.
                                                {item.tamanhoEmbalagem > 0 && ` (${item.tamanhoEmbalagem}${item.unidade || (item.categoria === 'bebidas' ? 'ml' : 'g')})`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator className="bg-zinc-200 dark:bg-zinc-800" />

                    {/* Total e Info */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl text-orange-800 dark:text-orange-400">
                            <Info size={20} />
                            <p className="text-xs font-bold leading-tight uppercase tracking-tight">
                                Valores baseados nas <br /> médias de consumo.
                            </p>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Estimativa de Custo</p>
                            <p className="text-4xl font-black text-zinc-900 dark:text-white">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculation.totalPrice)}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
