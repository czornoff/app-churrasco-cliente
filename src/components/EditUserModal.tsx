'use client'

import { useState, useEffect } from "react";
import { updateFullUserAction } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, BadgeCheck } from "lucide-react";
import { IUser } from "@/interfaces/user";
import { ITenantDocument } from "@/models/Schemas";
import { CloudinaryUpload } from "@/components/CldUploadWidget";
import { TenantsMultiSelect } from "@/components/TenantsMultiSelect";
import Image from "next/image";

export function EditUserModal({ user, tenants }: { user: IUser; tenants: ITenantDocument[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Estados para campos controlados e máscaras
    const [nome, setNome] = useState(user.nome || "");
    const [whatsApp, setWhatsApp] = useState(user.whatsApp || "");
    const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>(
        user.tenantIds?.map(id => id.toString()) || []
    );
    const [ufs, setUfs] = useState<{ sigla: string; nome: string }[]>([]);
    const [selectedUf, setSelectedUf] = useState(user.UF || "");
    const [cities, setCities] = useState<{ nome: string }[]>([]);
    const [selectedCity, setSelectedCity] = useState(user.cidade || "");

    const formattedBirthday = user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : "";

    // Máscara para WhatsApp
    const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 7) value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
        else if (value.length > 2) value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        else if (value.length > 0) value = value.replace(/^(\d{0,2})/, "($1");
        setWhatsApp(value);
    };

    // IBGE APIs
    interface IApiUF {
        sigla: string;
        nome: string;
    }

    interface IApiCity {
        nome: string;
    }

    useEffect(() => {
        fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
            .then(res => res.json())
            .then((data: IApiUF[]) => setUfs(data.map((item) => ({ sigla: item.sigla, nome: item.nome }))));
    }, []);

    useEffect(() => {
        if (selectedUf) {
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`)
                .then(res => res.json())
                .then((data: IApiCity[]) => setCities(data.map((item) => ({ nome: item.nome }))));
        } else {
            setCities([]);
        }
    }, [selectedUf]);

    async function handleUpdate(formData: FormData) {
        setLoading(true);
        // Garantindo que enviamos a UF e Cidade se forem provenientes dos selects customizados
        formData.set("UF", selectedUf);
        formData.set("cidade", selectedCity);
        formData.set("tenantIds", JSON.stringify(selectedTenantIds));

        const result = await updateFullUserAction(user._id.toString(), formData);
        setLoading(false);
        if (result.success) setOpen(false);
        else alert("Erro: " + result.error);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit2 size={14} className="text-zinc-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Editar Usuário: {user.nome}
                        {user.googleId && <BadgeCheck className="text-blue-500" size={18} />}
                    </DialogTitle>
                </DialogHeader>

                <form action={handleUpdate} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Nome e Email */}
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input name="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>E-mail</Label>
                            <Input name="email" type="email" defaultValue={user.email} required />
                        </div>

                        {/* WhatsApp e Aniversário */}
                        <div className="space-y-2">
                            <Label>WhatsApp</Label>
                            <Input name="whatsApp" value={whatsApp} onChange={handleWhatsAppChange} placeholder="(11) 99999-9999" />
                        </div>
                        <div className="space-y-2">
                            <Label>Data de Nascimento</Label>
                            <Input name="birthday" type="date" defaultValue={formattedBirthday} />
                        </div>

                        {/* UF e Cidade */}
                        <div className="space-y-2">
                            <Label>UF</Label>
                            <select
                                className="w-full h-10 border rounded-md px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                value={selectedUf}
                                onChange={(e) => {
                                    setSelectedUf(e.target.value);
                                    setSelectedCity("");
                                }}
                            >
                                <option value="">UF</option>
                                {ufs.map(uf => (
                                    <option key={uf.sigla} value={uf.sigla}>{uf.sigla}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Cidade</Label>
                            <select
                                className="w-full h-10 border rounded-md px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                disabled={!selectedUf}
                            >
                                <option value="">Selecione a cidade</option>
                                {cities.map(city => (
                                    <option key={city.nome} value={city.nome}>{city.nome}</option>
                                ))}
                            </select>
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
                                    <SelectItem value="TENANT_OWNER">Dono do Estabelecimento</SelectItem>
                                    <SelectItem value="END_USER">Usuário Final</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status e Estabelecimentos */}
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
                    </div>

                    {/* Estabelecimentos (Multi-select) - Full Width */}
                    <div className="space-y-2 pt-2">
                        <Label>Estabelecimentos (Tenants)</Label>
                        <TenantsMultiSelect
                            tenants={tenants}
                            selectedIds={selectedTenantIds}
                            onChange={setSelectedTenantIds}
                        />
                    </div>

                    {/* Avatar e outros itens */}
                    <div className="col-span-2 space-y-3 pt-2">
                        <Label>Avatar do Usuário</Label>
                        <div className="p-4 border rounded-lg bg-zinc-200 dark:bg-zinc-800">
                            {user.googleId ? (
                                <div className="flex items-start gap-4">
                                    <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden border-2 border-orange-100 bg-white shadow-sm min-w-[80px] min-h-[80px]">
                                        <Image
                                            unoptimized
                                            src={((user.avatar && !user.avatar.includes('mandebem.com') && !user.avatar.includes('placeholder')) ? user.avatar.trim() : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(nome || "User")}&background=random`}
                                            alt="Avatar Preview"
                                            width={80}
                                            height={80}
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
                                            Sincronizado via Google <BadgeCheck size={14} className="text-blue-500" />
                                        </p>
                                        <p className="text-xs text-zinc-500 italic">
                                            O avatar é gerenciado pela conta do Google Suite.
                                        </p>
                                        <input type="hidden" name="avatar" value={user.avatar} />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <CloudinaryUpload
                                        name="avatar"
                                        defaultValue={user.avatar}
                                        isAvatar={true}
                                        fallbackUrl={`https://ui-avatars.com/api/?name=${encodeURIComponent(nome || "User")}&background=random`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={loading}>
                            {loading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}