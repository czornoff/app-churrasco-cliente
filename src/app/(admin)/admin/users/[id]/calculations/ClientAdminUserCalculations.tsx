'use client'

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Users as UsersIcon, Calculator, Store, X } from "lucide-react";
import { CalculationDetailModal } from "@/components/CalculationDetailModal";
import { TablePagination } from "@/components/TablePagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ClientAdminUserCalculations({ calculations }: { calculations: any[] }) {
    const [selectedCalc, setSelectedCalc] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter state
    const [tenantFilter, setTenantFilter] = useState<string>("all");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Extract unique tenants for filter options
    const uniqueTenants = useMemo(() => {
        const tenants = new Map();
        calculations.forEach(calc => {
            if (calc.tenantId) {
                tenants.set(calc.tenantId._id, calc.tenantId.name);
            }
        });
        return Array.from(tenants.entries()).map(([id, name]) => ({ id, name }));
    }, [calculations]);

    // Apply filter
    const filteredCalculations = useMemo(() => {
        return calculations.filter(calc => {
            return tenantFilter === "all" || calc.tenantId?._id === tenantFilter;
        });
    }, [calculations, tenantFilter]);

    // Handle filter change
    const handleFilterChange = (value: string) => {
        setTenantFilter(value);
        setCurrentPage(1);
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredCalculations.length / itemsPerPage);
    const paginatedCalculations = filteredCalculations.slice(
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
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Nenhum cálculo registrado para este usuário.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-4 items-end">
                <div className="space-y-1.5 w-full md:w-[300px]">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Filtrar por Loja</label>
                    <Select value={tenantFilter} onValueChange={handleFilterChange}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Todos os lojas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os lojas</SelectItem>
                            {uniqueTenants.map(tenant => (
                                <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {tenantFilter !== "all" && (
                    <Button variant="ghost" size="sm" onClick={() => handleFilterChange("all")} className="h-10 text-zinc-500">
                        <X className="h-4 w-4 mr-2" />
                        Limpar Filtro
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-zinc-100 dark:bg-zinc-800/50 border-y">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-2 md:px-3 py-3">Data</TableHead>
                            {tenantFilter === "all" && (
                                <TableHead className="px-2 md:px-3 py-3 hidden md:table-cell">Loja</TableHead>
                            )}
                            <TableHead className="px-2 md:px-3 py-3 text-center hidden md:table-cell">Pessoas</TableHead>
                            <TableHead className="px-2 md:px-3 py-4 text-center hidden md:table-cell">Itens</TableHead>
                            <TableHead className="px-2 md:px-3 py-4 text-center">Total</TableHead>
                            <TableHead className="px-2 md:px-3 py-4 text-center">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedCalculations.length > 0 ? (
                            paginatedCalculations.map((calc) => (
                                <TableRow key={calc._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-700/50 transition-colors border-zinc-100 dark:border-zinc-800">
                                    <TableCell className="font-medium text-zinc-500 px-2 md:px-3 py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-zinc-400" />
                                            {new Date(calc.createdAt).toLocaleDateString('pt-BR')}
                                        </div>
                                    </TableCell>
                                    {tenantFilter === "all" && (
                                        <TableCell className="px-2 md:px-3 py-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <Store size={14} className="text-orange-500" />
                                                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                                    {calc.tenantId?.name || 'Sistema'}
                                                </span>
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell className="text-center px-2 md:px-3 py-4 hidden md:table-cell">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-600">
                                            <UsersIcon size={12} />
                                            {(calc.totalPeople?.men || 0) + (calc.totalPeople?.women || 0) + (calc.totalPeople?.children || 0)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center px-2 md:px-3 py-4 hidden md:table-cell">
                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-xs font-bold text-orange-600">
                                            <Calculator size={12} />
                                            {calc.items?.length || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-black text-orange-600 px-2 md:px-3 py-4">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calc.totalPrice || 0)}
                                    </TableCell>
                                    <TableCell className="text-center px-2 md:px-3 py-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg"
                                            onClick={() => handleOpenDetails(calc)}
                                        >
                                            <Eye size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={tenantFilter === "all" ? 6 : 5} className="h-48 text-center text-zinc-400 font-bold uppercase tracking-widest text-sm">
                                    Nenhum cálculo encontrado para este filtro.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

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
    );
}
