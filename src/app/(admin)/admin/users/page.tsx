import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { Tenant, ITenantDocument } from "@/models/Schemas";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteUserButton } from "@/components/DeleteUserButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chrome, Lock, Mail, MapPin, Plus, Users, History } from "lucide-react";
import { EditUserModal } from "@/components/EditUserModal";
import { ToggleStatusButton } from "@/components/ToggleStatusButton";
import Image from "next/image";
import { IUser } from "@/interfaces/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UsersPage() {
    const session = await getServerSession(authOptions);

    const isSuperAdmin = session?.user?.role === 'SUPERADMIN';
    const isTenantOwner = session?.user?.role === 'TENANT_OWNER';

    if (!session || (!isSuperAdmin && !isTenantOwner)) {
        redirect("/admin");
    }

    await connectDB();

    // Filtros por permissão
    const userFilter = isTenantOwner && session.user.tenantIds
        ? { tenantIds: { $in: session.user.tenantIds } }
        : {};

    const tenantFilter = isTenantOwner && session.user.tenantIds
        ? { _id: { $in: session.user.tenantIds } }
        : {};

    const users = await User.find(userFilter).sort({ createdAt: -1 }).lean() as unknown as IUser[];
    const tenants = await Tenant.find(tenantFilter).sort({ name: 1 }).lean() as unknown as ITenantDocument[];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-6">
                <div className="flex items-left gap-2">
                    <Users className="h-8 w-8 text-orange-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                            Gerenciar Usuários
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-200 text-sm">
                            Administre permissões, status e informações de perfil de todos os usuários.
                        </p>
                    </div>
                </div>

                <Link href="/admin/register">
                    <Button className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2 text-white">
                        <Plus size={18} />
                        Novo Usuário
                    </Button>
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-700">
                        <TableRow>
                            <TableHead className="w-70">Usuário</TableHead>
                            <TableHead>Nível / Cargo</TableHead>
                            <TableHead>Método</TableHead>
                            <TableHead>Localização</TableHead>
                            <TableHead>Estabelecimentos</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id.toString()} className="hover:bg-zinc-50/50 transition-colors">
                                <TableCell className="flex items-center gap-3">
                                    <Image
                                        unoptimized
                                        src={(user.avatar && user.avatar.trim()) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome || "User")}&background=random`}
                                        alt={user.nome}
                                        width={100}
                                        height={100}
                                        className="w-9 h-9 rounded-full border-2 border-zinc-600 shadow-sm"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-zinc-700 dark:text-zinc-400 leading-none mb-1">
                                            {user.nome}
                                        </span>
                                        <span className="text-xs text-zinc-700 dark:text-zinc-400 flex items-center gap-1">
                                            <Mail size={12} /> {user.email}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline" className="font-medium bg-zinc-50 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-400 border-zinc-200 rounded-[0.4em] dark:border-zinc-600">
                                        {user.role === 'SUPERADMIN' ? ' SuperAdmin' : (user.role === 'TENANT_OWNER' ? ' Dono do Estabelecimento' : 'Usuário Final')}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    {user.googleId ? (
                                        <div className="flex items-center gap-1.5 text-blue-600 font-medium text-xs">
                                            <Chrome size={14} /> Google
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-zinc-500 font-medium text-xs">
                                            <Lock size={14} /> Senha
                                        </div>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <span className="text-xs text-zinc-600 flex items-center gap-1">
                                        <MapPin size={12} className="text-zinc-400" />
                                        {user.cidade ? `${user.cidade} - ${user.UF}` : "Não informado"}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {user.tenantIds && user.tenantIds.length > 0 ? (
                                            user.tenantIds.map(tenantId => {
                                                const tenant = tenants.find(t => t._id.toString() === tenantId.toString());
                                                return tenant ? (
                                                    <Badge key={tenantId.toString()} className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                                                        {tenant.name}
                                                    </Badge>
                                                ) : null;
                                            })
                                        ) : (
                                            <span className="text-xs text-zinc-400">Nenhum</span>
                                        )}
                                    </div>
                                </TableCell>

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

                                <TableCell className="text-right flex items-center justify-end gap-1">
                                    <Link href={`/admin/users/${user._id.toString()}/calculations`}>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver Histórico de Churrascos">
                                            <History size={16} className="text-orange-600" />
                                        </Button>
                                    </Link>


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
                <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-zinc-200">
                    <p className="text-zinc-400 font-medium">Nenhum usuário cadastrado no sistema.</p>
                </div>
            )}
        </div>
    );
}
