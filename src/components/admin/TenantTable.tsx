'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Edit } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { DeleteTenantButton } from "@/components/DeleteTenantButton"
import { ITenantDocument } from "@/models/Schemas"

interface TenantTableProps {
    tenants: any[]; // Using any because of ITenantDocument type issues in client components if not serialized
    onEdit: (tenant: any) => void;
    isTenantOwner: boolean;
}

export function TenantTable({ tenants, onEdit, isTenantOwner }: TenantTableProps) {
    return (
        <div className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-lg bg-white dark:bg-zinc-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-zinc-200 dark:bg-zinc-700">
                    <TableRow>
                        <TableHead className="w-70 px-6 py-3">Loja</TableHead>
                        <TableHead className="px-6 py-3 hidden md:table-cell">Slug / URL</TableHead>
                        <TableHead className="px-6 py-3 hidden md:table-cell">Status</TableHead>
                        <TableHead className="text-right px-6 py-3 text-center">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tenants.length > 0 ? (
                        tenants.map((tenant) => (
                            <TableRow key={tenant._id.toString()} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-700/50 transition-colors">
                                <TableCell className="px-1 md:px-3 py-3">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Image
                                            unoptimized
                                            src={((tenant.logoUrl && !tenant.logoUrl.includes('mandebem.com') && !tenant.logoUrl.includes('placeholder')) ? tenant.logoUrl.trim() : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(tenant.name || "Loja")}&background=random`}
                                            alt={tenant.name || "Loja"}
                                            width={100}
                                            height={100}
                                            className="w-9 h-9 rounded-full border-2 border-zinc-600 shadow-sm object-cover hidden md:table-cell"
                                        />
                                        <div className="flex flex-col items-start">
                                            <Badge
                                                variant="outline"
                                                className={`font-medium border-0 px-0 py-0 mb-1 ${tenant.active
                                                    ? "text-green-700 dark:text-green-400"
                                                    : "text-red-700 dark:text-red-400"
                                                    }`}
                                            >
                                                {tenant.active ? "Ativo" : "Inativo"}
                                            </Badge>
                                            <span className="font-semibold text-zinc-700 dark:text-zinc-400 leading-tight">
                                                {tenant.name}
                                            </span>
                                        </div>
                                    </div>
                                    <Link href={`/${tenant.slug}`} target="_blank" className="block md:hidden">
                                        <span className="flex gap-1 text-xs text-blue-600 dark:text-blue-400">
                                            <ExternalLink size={14} />
                                            <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                                                mandebem.com/{tenant.slug}
                                            </span>
                                        </span>
                                    </Link>
                                </TableCell>

                                <TableCell className="px-1 md:px-3 py-3 text-left hidden md:table-cell">
                                    <Button variant="ghost" size="sm" asChild className="h-8 w-auto px-2 text-blue-600 hover:text-blue-600">
                                        <Link href={`/${tenant.slug}`} target="_blank">
                                            <ExternalLink size={14} />
                                            <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                                                mandebem.com/{tenant.slug}
                                            </span>
                                        </Link>
                                    </Button>
                                </TableCell>

                                <TableCell className="px-1 md:px-3 py-3 hidden md:table-cell">
                                    <Badge
                                        variant="outline"
                                        className={`font-medium rounded-lg ${tenant.active
                                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                                            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                                            }`}
                                    >
                                        {tenant.active ? "Ativo" : "Inativo"}
                                    </Badge>
                                </TableCell>

                                <TableCell className="text-center px-1 md:px-3 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(tenant)}
                                            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-600"
                                        >
                                            <Edit size={14} />
                                        </Button>
                                        {!isTenantOwner && <DeleteTenantButton
                                            tenantId={tenant._id.toString()}
                                            tenantName={tenant.name}
                                        />}

                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-20">
                                <p className="text-muted-foreground italic">Nenhum loja cadastrado no sistema.</p>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
