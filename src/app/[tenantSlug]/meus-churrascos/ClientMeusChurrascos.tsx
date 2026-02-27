'use client'

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Users as UsersIcon, Calculator, History } from "lucide-react";
import { CalculationDetailModal } from "@/components/CalculationDetailModal";
import Link from "next/link";
import { useParams } from "next/navigation";

export function ClientMeusChurrascos({ calculations }: { calculations: any[] }) {
    const [selectedCalc, setSelectedCalc] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { tenantSlug } = useParams();

    const handleOpenDetails = (calc: any) => {
        setSelectedCalc(calc);
        setIsModalOpen(true);
    };

    if (calculations.length === 0) {
        return (
            <div className="text-center py-24">
                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                    Nenhum churrasco salvo
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-xs mx-auto text-sm">
                    Seus cálculos salvos aparecerão aqui para você consultar quando quiser.
                </p>
                <Link href={`/${tenantSlug}/calculadora`}>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold uppercase tracking-widest px-8 shadow-lg shadow-orange-600/20">
                        Ir para Calculadora
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Data</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-400 text-center">Pessoas</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-400 text-center">Itens</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-400 text-right">Total</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-400 text-right">Ação</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {calculations.map((calc) => (
                        <TableRow key={calc._id} className="border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                            <TableCell className="py-5 font-medium text-zinc-600 dark:text-zinc-400 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-zinc-300" />
                                    {new Date(calc.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                            </TableCell>
                            <TableCell className="py-5 text-center">
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-600">
                                    <UsersIcon size={12} />
                                    {(calc.totalPeople?.men || 0) + (calc.totalPeople?.women || 0) + (calc.totalPeople?.children || 0)}
                                </div>
                            </TableCell>
                            <TableCell className="py-5 text-center">
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-xs font-bold text-orange-600">
                                    <Calculator size={12} />
                                    {calc.items?.length || 0}
                                </div>
                            </TableCell>
                            <TableCell className="py-5 text-right font-black text-zinc-900 dark:text-zinc-100">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calc.totalPrice || 0)}
                            </TableCell>
                            <TableCell className="py-5 text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="bg-zinc-100 dark:bg-zinc-800 hover:bg-orange-600 hover:text-white rounded-xl transition-all"
                                    onClick={() => handleOpenDetails(calc)}
                                >
                                    <Eye size={16} className="mr-2" />
                                    Detalhes
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <CalculationDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                calculation={selectedCalc}
            />
        </>
    );
}
