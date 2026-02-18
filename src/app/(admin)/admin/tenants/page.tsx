import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ExternalLink, Users, Edit } from "lucide-react"
import connectDB from "@/lib/mongodb"
import { Tenant, ITenantDocument } from "@/models/Schemas"
import { DeleteTenantButton } from "@/components/DeleteTenantButton"
import { deleteTenantAction } from "./actions"
import { CreateTenantForm } from "@/components/CreateTenantForm"
import { ITenant } from "@/interfaces/tenant";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Configurações para garantir que a página reflita os dados do banco em tempo real
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminTenantsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // TENANT_OWNER não pode acessar lista de tenants
    if (session?.user?.role === 'TENANT_OWNER') {
        redirect(`/admin/tenants/${session.user.tenantId}`);
    }

    await connectDB()
    const tenants = await Tenant.find({}).sort({ active: -1 }).sort({ createdAt: -1 }).lean()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-6">
                <div className="flex items-left gap-2">
                    <Users className="h-8 w-8 text-orange-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Estabelecimentos</h1>
                        <p className="text-slate-500 dark:text-slate-200 text-sm">
                            Cadastre e gerencie estabelecimentos que utilizam sua calculadora.
                        </p>
                    </div>
                </div>
            </div>

            {/* Formulário de Cadastro */}
            <CreateTenantForm />

            {/* Listagem de Estabelecimentos em Tabela */}
            <div className="bg-white dark:bg-zinc-800 rounded-sm shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-700">
                        <TableRow>
                            <TableHead className="w-70">Estabelecimento</TableHead>
                            <TableHead>Slug / URL</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenants.length > 0 ? (
                            tenants.map((tenant: ITenantDocument) => (
                                <TableRow key={tenant._id.toString()} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-700/50 transition-colors">
                                    {/* Logo e Nome */}
                                    <TableCell className="flex items-center gap-3">
                                        <Image
                                            unoptimized
                                            src={((tenant.logoUrl && !tenant.logoUrl.includes('mandebem.com') && !tenant.logoUrl.includes('placeholder')) ? tenant.logoUrl.trim() : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(tenant.name || "Estabelecimento")}&background=random`}
                                            alt={tenant.name}
                                            width={100}
                                            height={100}
                                            className="w-9 h-9 rounded-full border-2 border-slate-600 shadow-sm object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-700 dark:text-slate-400 leading-none mb-1">
                                                {tenant.name}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Slug / URL */}
                                    <TableCell>
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                                            mandebem.com/{tenant.slug}
                                        </span>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`font-medium rounded-[0.4em] ${tenant.active
                                                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                                                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                                                }`}
                                        >
                                            {tenant.active ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </TableCell>

                                    {/* Ações */}
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Botão Visitar */}
                                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                <Link href={`/${tenant.slug}`} target="_blank">
                                                    <ExternalLink size={14} />
                                                </Link>
                                            </Button>

                                            {/* Botão Editar */}
                                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                                                <Link href={`/admin/tenants/${tenant._id.toString()}`}>
                                                    <Edit size={14} />
                                                </Link>
                                            </Button>

                                            {/* Botão Excluir */}
                                            <form action={deleteTenantAction}>
                                                <input type="hidden" name="id" value={tenant._id.toString()} />
                                                <DeleteTenantButton tenantName={tenant.name} />
                                            </form>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20">
                                    <p className="text-muted-foreground italic">Nenhum estabelecimento cadastrado no sistema.</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}