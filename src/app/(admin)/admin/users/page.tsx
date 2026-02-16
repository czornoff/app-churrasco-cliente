import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { Tenant, ITenantDocument } from "@/models/Schemas";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteUserButton } from "@/components/DeleteUserButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chrome, Lock, Mail, MapPin, Plus, Users } from "lucide-react";
import { EditUserModal } from "@/components/EditUserModal";
import Image from "next/image";
import { IUser } from "@/interfaces/user";

export default async function UsersPage() {
    await connectDB();

    // Buscamos os usuários e estabelecimentos
    const users = await User.find().sort({ createdAt: -1 }).lean() as unknown as IUser[];
    const tenants = await Tenant.find().sort({ name: 1 }).lean() as unknown as ITenantDocument[];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-6">
                <div className="flex items-left gap-2">
                    <Users className="h-8 w-8 text-orange-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Gerenciar Usuários</h1>
                        <p className="text-slate-500 dark:text-slate-200 text-sm">
                            Administre permissões, status e informações de perfil de todos os usuários.
                        </p>
                    </div>
                </div>

                {/* Botão Adicionar Usuário */}
                <Link href="/admin/register">
                    <Button className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2 text-white">
                        <Plus size={18} />
                        Novo Usuário
                    </Button>
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-sm shadow-sm overflow-hidden">

                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-700">
                        <TableRow>
                            <TableHead className="w-70">Usuário</TableHead>
                            <TableHead>Nível / Cargo</TableHead>
                            <TableHead>Método</TableHead>
                            <TableHead>Localização</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id.toString()} className="hover:bg-zinc-50/50 transition-colors">
                                {/* Informações Básicas */}
                                <TableCell className="flex items-center gap-3">
                                    <Image
                                        unoptimized
                                        src={(user.avatar && user.avatar.trim()) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome || "User")}&background=random`}
                                        alt={user.nome}
                                        width={100}
                                        height={100}
                                        className="w-9 h-9 rounded-full border-2 border-slate-600 shadow-sm"

                                    />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-700 dark:text-slate-400 leading-none mb-1">
                                            {user.nome}
                                        </span>
                                        <span className="text-xs text-slate-700 dark:text-slate-400 flex items-center gap-1">
                                            <Mail size={12} /> {user.email}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Nível de Acesso */}
                                <TableCell>
                                    <Badge variant="outline" className="font-medium bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-400 border-slate-200 rounded-[0.4em] dark:border-slate-600">
                                        {user.role === 'SUPERADMIN' ? ' SuperAdmin' : (user.role === 'TENANT_OWNER' ? ' Dono do Estabelecimento' : 'Usuário Final')}
                                    </Badge>
                                </TableCell>

                                {/* Método de Login */}
                                <TableCell>
                                    {user.googleId ? (
                                        <div className="flex items-center gap-1.5 text-blue-600 font-medium text-xs">
                                            <Chrome size={14} /> Google
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                                            <Lock size={14} /> Senha
                                        </div>
                                    )}
                                </TableCell>

                                {/* Localização Rápida */}
                                <TableCell>
                                    <span className="text-xs text-slate-600 flex items-center gap-1">
                                        <MapPin size={12} className="text-slate-400" />
                                        {user.cidade ? `${user.cidade} - ${user.UF}` : "Não informado"}
                                    </span>
                                </TableCell>

                                {/* Status com Cores */}
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`font-medium rounded-[0.4em] ${user.status === 'active'
                                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                                            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                                            }`}
                                    >
                                        {user.status === 'active' ? 'Ativo' : user.status === 'banned' ? 'Banido' : 'Inativo'}
                                    </Badge>
                                </TableCell>

                                {/* Coluna de Ações com o Modal Integrado */}
                                <TableCell className="text-right">
                                    <EditUserModal
                                        user={JSON.parse(JSON.stringify(user))}
                                        tenants={JSON.parse(JSON.stringify(tenants))}
                                    />
                                    <DeleteUserButton
                                        userId={user._id.toString()}
                                        userName={user.nome}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {users.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">Nenhum usuário cadastrado no sistema.</p>
                </div>
            )}
        </div>
    );
}