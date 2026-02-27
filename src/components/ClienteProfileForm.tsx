'use client'

import { useState, useEffect } from "react";
import { updateClienteProfileAction } from "@/lib/actions/cliente-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IUser } from "@/interfaces/user";
import { CloudinaryUpload } from "@/components/CldUploadWidget";
import { BadgeCheck, CheckCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ClienteProfileFormProps {
    initialData: IUser;
    tenantSlug: string;
    primaryColor: string;
}

export function ClienteProfileForm({ initialData, tenantSlug, primaryColor }: ClienteProfileFormProps) {
    const [nome, setNome] = useState(initialData?.nome || "");
    const [whatsApp, setWhatsApp] = useState(initialData?.whatsApp || "");
    const [ufs, setUfs] = useState<{ sigla: string; nome: string }[]>([]);
    const [selectedUf, setSelectedUf] = useState(initialData?.UF || "");
    const [cities, setCities] = useState<{ nome: string }[]>([]);
    const [selectedCity, setSelectedCity] = useState(initialData?.cidade || "");
    const [genero, setGenero] = useState<'masculino' | 'feminino' | 'outros' | 'undefined'>(
        (initialData?.genero as 'masculino' | 'feminino' | 'outros' | 'undefined') || 'undefined'
    );
    const [birthday, setBirthday] = useState(
        initialData?.birthday
            ? new Date(initialData.birthday).toISOString().split('T')[0]
            : ""
    );
    const [isLoading, setIsLoading] = useState(false);

    // Máscara para WhatsApp: (00) 00000-0000
    const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 7) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        } else if (value.length > 0) {
            value = value.replace(/^(\d{0,2})/, "($1");
        }
        setWhatsApp(value);
    };

    interface UF { sigla: string; nome: string; }
    interface City { nome: string; }

    useEffect(() => {
        fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
            .then(res => res.json())
            .then((data: UF[]) => setUfs(data.map((item) => ({ sigla: item.sigla, nome: item.nome }))));
    }, []);

    useEffect(() => {
        if (selectedUf) {
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`)
                .then(res => res.json())
                .then((data: City[]) => setCities(data.map((item) => ({ nome: item.nome }))));
        } else {
            setCities([]);
        }
    }, [selectedUf]);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        formData.append("tenantSlug", tenantSlug);
        try {
            await updateClienteProfileAction(formData);
            toast.success("Perfil atualizado com sucesso!", {
                icon: <CheckCircle className="text-green-500" size={18} />,
            });
        } catch {
            toast.error("Erro ao atualizar perfil. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "h-11 border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus-visible:ring-0 focus-visible:border-zinc-400 rounded-lg font-medium";
    const selectClass = "w-full h-11 border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 text-sm font-medium text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-zinc-400";
    const labelClass = "text-[10px] uppercase font-black tracking-widest text-zinc-400";

    return (
        <form action={handleSubmit} className="space-y-6">

            {/* Foto */}
            <div className="space-y-3 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <Label className={labelClass}>Foto do Perfil</Label>
                <div className="flex items-center gap-6">
                    {initialData?.googleId ? (
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 shadow-sm">
                                <Image
                                    unoptimized
                                    src={initialData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(nome || 'User')}&background=random`}
                                    alt="Foto de perfil"
                                    width={80}
                                    height={80}
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                    Conta Google <BadgeCheck size={14} className="text-blue-500" />
                                </p>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Sua foto é gerenciada pelo Google.
                                </p>
                                <input type="hidden" name="avatar" value={initialData?.avatar} />
                            </div>
                        </div>
                    ) : (
                        <CloudinaryUpload
                            name="avatar"
                            defaultValue={initialData?.avatar}
                            isAvatar={true}
                            fallbackUrl={`https://ui-avatars.com/api/?name=${encodeURIComponent(nome || 'User')}&background=random`}
                        />
                    )}
                </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
                <Label className={labelClass}>Nome Completo</Label>
                <Input
                    name="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Seu nome"
                />
            </div>

            {/* WhatsApp + Gênero */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className={labelClass}>WhatsApp</Label>
                    <Input
                        name="whatsApp"
                        placeholder="(11) 99999-9999"
                        value={whatsApp}
                        onChange={handleWhatsAppChange}
                        className={inputClass}
                    />
                </div>
                <div className="space-y-2">
                    <Label className={labelClass}>Gênero</Label>
                    <select
                        name="genero"
                        className={selectClass}
                        value={genero}
                        onChange={(e) => setGenero(e.target.value as 'masculino' | 'feminino' | 'outros' | 'undefined')}

                    >
                        <option value="undefined">Prefiro não dizer</option>
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                        <option value="outros">Outros</option>
                    </select>
                </div>
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
                <Label className={labelClass}>Data de Nascimento</Label>
                <Input
                    name="birthday"
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className={inputClass}
                />
            </div>

            {/* UF + Cidade */}
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 space-y-2">
                    <Label className={labelClass}>UF</Label>
                    <select
                        name="UF"
                        className={selectClass}
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
                <div className="col-span-3 space-y-2">
                    <Label className={labelClass}>Cidade</Label>
                    <select
                        name="cidade"
                        className={selectClass}
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
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 font-black text-xs uppercase tracking-widest text-white shadow-xl hover:opacity-90 transition-all rounded-lg"
                style={{ backgroundColor: primaryColor }}
            >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
        </form>
    );
}
