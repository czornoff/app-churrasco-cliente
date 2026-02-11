import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteUserButton } from "@/components/DeleteUserButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chrome, Lock, Mail, MapPin, Plus } from "lucide-react";
import { EditUserModal } from "@/components/EditUserModal";
import Image from "next/image";
import { IUser} from "@/interfaces/user";

export default async function UsersPage() {
    await connectDB();
    
    // Buscamos os usuários convertendo para objetos simples para o Next.js
    const users = await User.find().sort({ createdAt: -1 }).lean() as unknown as IUser[];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gerenciar Usuários</h1>
                    <p className="text-sm text-slate-500">
                        Administre permissões, status e informações de perfil de todos os usuários.
                    </p>
                </div>

                {/* Botão Adicionar Usuário */}
                <Link href="/admin/register">
                    <Button className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2">
                        <Plus size={18} />
                        Novo Usuário
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                
                <Table>
                    <TableHeader className="bg-slate-50">
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
                            <TableRow key={user._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                                {/* Informações Básicas */}
                                <TableCell className="flex items-center gap-3">
                                    <Image 
                                        unoptimized
                                        src={user.avatar} 
                                        alt={user.nome}
                                        width={100}
                                        height={100}
                                        className="w-9 h-9 rounded-full border-2 border-slate-600 shadow-sm" 
                                        
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-700 leading-none mb-1">
                                            {user.nome}
                                        </span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Mail size={12} /> {user.email}
                                        </span>
                                    </div>
                                </TableCell>
                                
                                {/* Nível de Acesso */}
                                <TableCell>
                                    <Badge variant="outline" className="font-medium bg-slate-50 text-slate-600 border-slate-200">
                                        {user.role === 'SUPERADMIN' ? ' SuperAdmin' : (user.role === 'TENANT_OWNER' ? ' Dono da Loja' : 'Usuário Final')}
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
                                        className={
                                            user.status === 'active' 
                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none' 
                                            : user.status === 'banned'
                                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-none shadow-none'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-none shadow-none'
                                        }
                                    >
                                        {user.status === 'active' ? 'Ativo' : user.status === 'banned' ? 'Banido' : 'Inativo'}
                                    </Badge>
                                </TableCell>

                                {/* Coluna de Ações com o Modal Integrado */}
                                <TableCell className="text-right">
                                    <EditUserModal user={JSON.parse(JSON.stringify(user))} />
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