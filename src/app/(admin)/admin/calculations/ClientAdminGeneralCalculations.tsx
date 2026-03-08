'use client'

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Users as UsersIcon, Store, User as UserIcon, Calculator, Search, X } from "lucide-react";
import { CalculationDetailModal } from "@/components/CalculationDetailModal";
import { TablePagination } from "@/components/TablePagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function ClientAdminGeneralCalculations({ initialCalculations }: { initialCalculations: any[] }) {
    const [selectedCalc, setSelectedCalc] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter states
    const [tenantFilter, setTenantFilter] = useState<string>("all");
    const [userFilter, setUserFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Extract unique tenants and users for filter options
    const filterOptions = useMemo(() => {
        const tenants = new Map();
        const users = new Map();

        initialCalculations.forEach(calc => {
            if (calc.tenantId) {
                tenants.set(calc.tenantId._id, calc.tenantId.name);
            }
            if (calc.userId) {
                users.set(calc.userId._id, calc.userId.nome);
            }
        });

        return {
            tenants: Array.from(tenants.entries()).map(([id, name]) => ({ id, name })),
            users: Array.from(users.entries()).map(([id, name]) => ({ id, name }))
        };
    }, [initialCalculations]);

    // Apply filters
    const filteredCalculations = useMemo(() => {
        return initialCalculations.filter(calc => {
            const matchesTenant = tenantFilter === "all" || calc.tenantId?._id === tenantFilter;
            const matchesUser = userFilter === "all" || calc.userId?._id === userFilter;
            const matchesSearch = !searchTerm ||
                calc.tenantId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                calc.userId?.nome?.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesTenant && matchesUser && matchesSearch;
        });
    }, [initialCalculations, tenantFilter, userFilter, searchTerm]);

    // Handle filter changes (reset pagination)
    const handleTenantFilterChange = (value: string) => {
        setTenantFilter(value);
        setCurrentPage(1);
    };

    const handleUserFilterChange = (value: string) => {
        setUserFilter(value);
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setTenantFilter("all");
        setUserFilter("all");
        setSearchTerm("");
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

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-4 items-end">
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Buscar</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Buscar por estabelecimento ou usuário..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-9 h-10"
                        />
                    </div>
                </div>

                <div className="space-y-1.5 w-full md:w-[240px]">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Estabelecimento</label>
                    <Select value={tenantFilter} onValueChange={handleTenantFilterChange}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Todos os estabelecimentos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os estabelecimentos</SelectItem>
                            {filterOptions.tenants.map(tenant => (
                                <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5 w-full md:w-[240px]">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Usuário</label>
                    <Select value={userFilter} onValueChange={handleUserFilterChange}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Todos os usuários" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os usuários</SelectItem>
                            {filterOptions.users.map(user => (
                                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {(tenantFilter !== "all" || userFilter !== "all" || searchTerm) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 text-zinc-500">
                        <X className="h-4 w-4 mr-2" />
                        Limpar
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-zinc-100 dark:bg-zinc-800/50 border-y">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-2 md:px-3 py-4 text-xs font-black uppercase text-zinc-500">Data</TableHead>
                            <TableHead className="px-2 md:px-3 py-4 text-xs font-black uppercase text-zinc-500 hidden md:table-cell">Estabelecimento</TableHead>
                            <TableHead className="px-2 md:px-3 py-4 text-xs font-black uppercase text-zinc-500 hidden md:table-cell">Usuário</TableHead>
                            <TableHead className="px-2 md:px-3 py-4 text-xs font-black uppercase text-zinc-500 text-center hidden md:table-cell">Pessoas</TableHead>
                            <TableHead className="px-2 md:px-3 py-4 text-xs font-black uppercase text-zinc-500 text-center hidden md:table-cell">Itens</TableHead>
                            <TableHead className="px-2 md:px-3 py-4 text-xs font-black uppercase text-zinc-500 text-center">Total</TableHead>
                            <TableHead className="px-2 md:px-3 py-4 text-xs font-black uppercase text-zinc-500 text-center">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedCalculations.length > 0 ? (
                            paginatedCalculations.map((calc) => (
                                <TableRow key={calc._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors border-zinc-100 dark:border-zinc-800">
                                    <TableCell className="font-medium text-zinc-500 whitespace-nowrap px-2 md:px-3 py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-zinc-400" />
                                            {new Date(calc.createdAt).toLocaleDateString('pt-BR')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-2 md:px-3 py-4 hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Store size={14} className="text-orange-500" />
                                            <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                                {calc.tenantId?.name || 'Sistema'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-2 md:px-3 py-4 hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <UserIcon size={14} className="text-zinc-400" />
                                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                                {calc.userId?.nome || 'Convidado'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-2 md:px-3 py-4 text-center hidden md:table-cell">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-600">
                                            <UsersIcon size={12} />
                                            {(calc.totalPeople?.men || 0) + (calc.totalPeople?.women || 0) + (calc.totalPeople?.children || 0)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-2 md:px-3 py-4 text-center hidden md:table-cell">
                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-xs font-bold text-orange-600">
                                            <Calculator size={12} />
                                            {calc.items?.length || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-2 md:px-3 py-4 text-center font-black text-orange-600">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calc.totalPrice || 0)}
                                    </TableCell>
                                    <TableCell className="px-2 md:px-3 py-4 text-center whitespace-nowrap">
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
                                <TableCell colSpan={7} className="h-48 text-center text-zinc-400 font-bold uppercase tracking-widest text-sm">
                                    Nenhum cálculo encontrado com os filtros atuais.
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
