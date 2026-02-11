import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ExternalLink, Users, Edit } from "lucide-react"
import connectDB from "@/lib/mongodb"
import { Tenant } from "@/models/Schemas"
import { DeleteTenantButton } from "@/components/DeleteTenantButton" // Importe o novo botão
import { createTenantAction, deleteTenantAction } from "./actions"
import { ITenant} from "@/interfaces/tenant";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

// Configurações para garantir que a página reflita os dados do banco em tempo real
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminTenantsPage() {
    const session = await getServerSession();

    if (!session) {
        redirect("/admin"); // Se não estiver logado, volta pro login
    }

    await connectDB()
    const tenants = await Tenant.find({}).sort({ createdAt: -1 }).lean()

    return (
        <div className="max-w-4xl mx-auto space-y-10 p-4 md:p-8">
        {/* Cabeçalho da Página */}
            <div className="flex items-center gap-3 border-b pb-6">
                <Users className="h-8 w-8 text-orange-600" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1>
                    <p className="text-muted-foreground">Cadastre e gerencie as lojas que utilizam sua calculadora.</p>
                </div>
            </div>

            {/* Formulário de Cadastro */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle>Cadastrar Nova Loja</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createTenantAction} className="grid gap-6 md:grid-cols-2 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Estabelecimento</Label>
                                <Input 
                                    id="name" 
                                    name="name" 
                                    placeholder="Ex: Churrascaria Pantanal" 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug da URL (ex: churrascaria-pantanal)</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-400 font-mono">/</span>
                                    <Input 
                                    id="slug" 
                                    name="slug" 
                                    placeholder="slug-unico" 
                                    minLength={5}
                                    required 
                                />
                            </div>
                        </div>
                        <Button type="submit" className="md:col-span-2 w-full bg-orange-600 hover:bg-orange-700">
                        Criar Portal de Churrasco
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Listagem de Clientes */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    Clientes Ativos 
                    <span className="text-sm font-normal text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                        {tenants.length}
                    </span>
                </h2>

                <div className="grid gap-3">
                {tenants.length > 0 ? (
                    tenants.map((tenant: ITenant) => (
                    <div 
                        key={tenant._id.toString()} 
                        className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:border-orange-200 transition-all"
                    >
                        <div className="space-y-1">
                            <p className="font-bold text-slate-900 leading-none">{tenant.name}</p>
                            <p className="text-xs text-blue-600 font-mono">mandebem.com/{tenant.slug}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Botão Visitar Site */}
                            <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                                <Link href={`/${tenant.slug}`} target="_blank">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Visitar
                                </Link>
                            </Button>

                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/tenants/${tenant._id.toString()}`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                </Link>
                            </Button>

                        {/* Botão Excluir */}
                            <form action={deleteTenantAction}>
                                <input type="hidden" name="id" value={tenant._id.toString()} />
                                <DeleteTenantButton tenantName={tenant.name} />
                            </form>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl bg-slate-50">
                        <p className="text-muted-foreground italic">Nenhum cliente cadastrado no sistema.</p>
                    </div>
                )}
                </div>
            </div>
        </div>
    )
}