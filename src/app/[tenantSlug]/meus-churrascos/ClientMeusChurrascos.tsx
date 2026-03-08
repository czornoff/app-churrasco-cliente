'use client'

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Users as UsersIcon, Calculator, History } from "lucide-react";
import { CalculationDetailModal } from "@/components/CalculationDetailModal";
import { TablePagination } from "@/components/TablePagination";
import Link from "next/link";
import { useParams } from "next/navigation";

export function ClientMeusChurrascos({ calculations }: { calculations: any[] }) {
    const [selectedCalc, setSelectedCalc] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { tenantSlug } = useParams();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Calculate pagination
    const totalPages = Math.ceil(calculations.length / itemsPerPage);
    const paginatedCalculations = calculations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold uppercase tracking-widest px-8 shadow-lg shadow-orange-600/20">
                        Ir para Calculadora
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto" >
                <Table>
                    <TableHeader className="bg-zinc-100 dark:bg-zinc-800/50 border-y">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-2 md:px-3 py-3 hidden md:table-cell">Data</TableHead>
                            <TableHead className="px-2 md:px-3 py-3 text-center">Pessoas</TableHead>
                            <TableHead className="px-2 md:px-3 py-3 text-center hidden md:table-cell">Itens</TableHead>
                            <TableHead className="px-2 md:px-3 py-3 text-center">Total</TableHead>
                            <TableHead className="px-2 md:px-3 py-3 text-center">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedCalculations.map((calc) => (
                            <TableRow key={calc._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-700/50 transition-colors">
                                <TableCell className="py-5 font-medium text-zinc-600 dark:text-zinc-400 text-sm px-2 md:px-3 py-3 hidden md:table-cell">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-zinc-300" />
                                        {new Date(calc.createdAt).toLocaleDateString('pt-BR')}
                                    </div>
                                </TableCell>
                                <TableCell className="py-5 text-center px-2 md:px-3 py-3">
                                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-600">
                                        <UsersIcon size={12} />
                                        {(calc.totalPeople?.men || 0) + (calc.totalPeople?.women || 0) + (calc.totalPeople?.children || 0)}
                                    </div>
                                </TableCell>
                                <TableCell className="py-5 text-center px-2 md:px-3 py-3 hidden md:table-cell">
                                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-xs font-bold text-orange-600">
                                        <Calculator size={12} />
                                        {calc.items?.length || 0}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center font-black text-orange-600 px-2 md:px-3 py-3">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calc.totalPrice || 0)}
                                </TableCell>
                                <TableCell className="py-5 text-center px-2 md:px-3 py-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="bg-zinc-50 dark:bg-zinc-800 hover:dark:bg-zinc-700 hover:bg-zinc-100 text-blue-600 hover:text-blue-600 rounded-lg transition-all"
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
            </div >

            <div className="px-4">
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />

                <CalculationDetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    calculation={selectedCalc}
                />
            </div>
        </>
    );
}
