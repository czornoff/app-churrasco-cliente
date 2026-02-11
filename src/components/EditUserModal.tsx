'use client'

import { useState } from "react";
import { updateFullUserAction } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2 } from "lucide-react";
import { IUser} from "@/interfaces/user";

export function EditUserModal({ user }: { user: IUser }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const formattedBirthday = user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : "";

    async function handleUpdate(formData: FormData) {
        setLoading(true);
        const result = await updateFullUserAction(user._id.toString(), formData);
        setLoading(false);
        if (result.success) setOpen(false);
        else alert("Erro: " + result.error);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit2 size={14} className="text-slate-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Usuário Completo</DialogTitle>
                </DialogHeader>
                
                <form action={handleUpdate} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Nome e Email */}
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input name="nome" defaultValue={user.nome} required />
                        </div>
                        <div className="space-y-2">
                            <Label>E-mail</Label>
                            <Input name="email" type="email" defaultValue={user.email} required />
                        </div>

                        {/* WhatsApp e Aniversário */}
                        <div className="space-y-2">
                            <Label>WhatsApp</Label>
                            <Input name="whatsApp" defaultValue={user.whatsApp} />
                        </div>
                        <div className="space-y-2">
                            <Label>Data de Nascimento</Label>
                            <Input name="birthday" type="date" defaultValue={formattedBirthday} />
                        </div>

                        {/* UF e Cidade */}
                        <div className="space-y-2">
                            <Label>UF</Label>
                            <Input name="UF" maxLength={2} defaultValue={user.UF} />
                        </div>
                        <div className="space-y-2">
                            <Label>Cidade</Label>
                            <Input name="cidade" defaultValue={user.cidade} />
                        </div>

                        {/* Gênero e Role */}
                        <div className="space-y-2">
                            <Label>Gênero</Label>
                            <Select name="genero" defaultValue={user.genero}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="undefined">Não definido</SelectItem>
                                    <SelectItem value="masculino">Masculino</SelectItem>
                                    <SelectItem value="feminino">Feminino</SelectItem>
                                    <SelectItem value="outros">Outros</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Nível de Acesso (Role)</Label>
                            <Select name="role" defaultValue={user.role}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                                    <SelectItem value="TENANT_OWNER">Dono da Loja</SelectItem>
                                    <SelectItem value="END_USER">Usuário Final</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status e TenantId */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select name="status" defaultValue={user.status}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Ativo</SelectItem>
                                    <SelectItem value="inactive">Inativo</SelectItem>
                                    <SelectItem value="banned">Banido</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tenant ID (Opcional)</Label>
                            <Input name="tenantId" defaultValue={user.tenantId} placeholder="ID da Loja" />
                        </div>

                        {/* Avatar URL */}
                        <div className="col-span-2 space-y-2">
                            <Label>URL do Avatar</Label>
                            <Input name="avatar" defaultValue={user.avatar} />
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="bg-orange-600" disabled={loading}>
                            {loading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}