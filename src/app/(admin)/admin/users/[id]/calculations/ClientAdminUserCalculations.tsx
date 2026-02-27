'use client'

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Users as UsersIcon } from "lucide-react";
import { CalculationDetailModal } from "@/components/CalculationDetailModal";

export function ClientAdminUserCalculations({ calculations }: { calculations: any[] }) {
    const [selectedCalc, setSelectedCalc] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenDetails = (calc: any) => {
        setSelectedCalc(calc);
        setIsModalOpen(true);
    };

    if (calculations.length === 0) {
        return (
            <div className="text-center py-24">
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Nenhum cálculo registrado para este usuário.</p>
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="text-[10px] uppercase font-black tracking-widest">Data</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-center">Pessoas</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-right">Total</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-right">Ação</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {calculations.map((calc) => (
                        <TableRow key={calc._id} className="border-zinc-50 dark:border-zinc-900 group">
                            <TableCell className="font-medium text-zinc-500">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    {new Date(calc.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-600">
                                    <UsersIcon size={12} />
                                    {(calc.totalPeople?.men || 0) + (calc.totalPeople?.women || 0) + (calc.totalPeople?.children || 0)}
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-black text-orange-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calc.totalPrice || 0)}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-orange-600 hover:text-white rounded-xl"
                                    onClick={() => handleOpenDetails(calc)}
                                >
                                    <Eye size={16} />
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
