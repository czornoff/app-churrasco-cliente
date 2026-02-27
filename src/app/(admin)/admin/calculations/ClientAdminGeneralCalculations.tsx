'use client'

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Users as UsersIcon, Store, User as UserIcon } from "lucide-react";
import { CalculationDetailModal } from "@/components/CalculationDetailModal";

export function ClientAdminGeneralCalculations({ initialCalculations }: { initialCalculations: any[] }) {
    const [selectedCalc, setSelectedCalc] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenDetails = (calc: any) => {
        setSelectedCalc(calc);
        setIsModalOpen(true);
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="text-[10px] uppercase font-black tracking-widest">Data</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest">Estabelecimento</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest">Usuário</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-center">Pessoas</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-right">Total</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-right">Ação</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialCalculations.map((calc) => (
                        <TableRow key={calc._id} className="border-zinc-50 dark:border-zinc-900 group">
                            <TableCell className="font-medium text-zinc-500 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    {new Date(calc.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Store size={14} className="text-orange-500" />
                                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                        {calc.tenantId?.name || 'Sistema'}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <UserIcon size={14} className="text-zinc-400" />
                                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                        {calc.userId?.nome || 'Convidado'}
                                    </span>
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
                            <TableCell className="text-right whitespace-nowrap">
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
