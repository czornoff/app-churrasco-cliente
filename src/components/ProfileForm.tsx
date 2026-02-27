'use client'

import { useState, useEffect } from "react";
import { updateProfileAction } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IUser } from "@/interfaces/user";
import { CloudinaryUpload } from "@/components/CldUploadWidget";
import { BadgeCheck } from "lucide-react";
import Image from "next/image";

export function ProfileForm({ initialData }: { initialData: IUser }) {
    const [nome, setNome] = useState(initialData?.nome || "");
    const [whatsApp, setWhatsApp] = useState(initialData?.whatsApp || "");
    const [ufs, setUfs] = useState<{ sigla: string; nome: string }[]>([]);
    const [selectedUf, setSelectedUf] = useState(initialData?.UF || "");
    const [cities, setCities] = useState<{ nome: string }[]>([]);
    const [selectedCity, setSelectedCity] = useState(initialData?.cidade || "");

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

    interface UF {
        sigla: string;
        nome: string;
    }

    interface City {
        nome: string;
    }

    // Carregar UFs do IBGE
    useEffect(() => {
        fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
            .then(res => res.json())
            .then((data: UF[]) => setUfs(data.map((item) => ({ sigla: item.sigla, nome: item.nome }))));
    }, []);

    // Carregar Cidades quando UF muda
    useEffect(() => {
        if (selectedUf) {
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`)
                .then(res => res.json())
                .then((data: City[]) => setCities(data.map((item) => ({ nome: item.nome }))));
        } else {
            setCities([]);
        }
    }, [selectedUf]);

    return (
        <form action={async (formData) => {
            await updateProfileAction(formData);
            alert("Perfil atualizado com sucesso!");
        }} className="space-y-6 max-w-lg bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm">

            <div className="space-y-4 border-b pb-6 mb-2">
                <Label className="text-zinc-700 dark:text-zinc-200 font-bold">Minha Foto</Label>
                <div className="flex items-center gap-6">
                    {initialData?.googleId ? (
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden border-2 border-orange-100 bg-white shadow-sm min-w-20 min-h-20">
                                <Image
                                    unoptimized
                                    src={((initialData?.avatar && !initialData.avatar.includes('mandebem.com') && !initialData.avatar.includes('placeholder')) ? initialData.avatar.trim() : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(nome || 'User')}&background=random`}
                                    alt="Foto de perfil"
                                    width={80}
                                    height={80}
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                                    Sincronizado via Google <BadgeCheck size={14} className="text-blue-500" />
                                </p>
                                <p className="text-xs text-zinc-500 italic leading-relaxed">
                                    Sua foto é gerenciada pela sua conta Google Suite.
                                </p>
                                <input type="hidden" name="avatar" value={initialData?.avatar} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1">
                            <CloudinaryUpload
                                name="avatar"
                                defaultValue={initialData?.avatar}
                                isAvatar={true}
                                fallbackUrl={`https://ui-avatars.com/api/?name=${encodeURIComponent(nome || 'User')}&background=random`}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input name="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input
                        name="whatsApp"
                        placeholder="(11) 99999-9999"
                        value={whatsApp}
                        onChange={handleWhatsAppChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Gênero</Label>
                    <select name="genero" className="w-full h-10 border rounded-lg px-3 text-sm" defaultValue={initialData?.genero}>
                        <option value="undefined">Prefiro não dizer</option>
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                        <option value="outros">Outros</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 space-y-2">
                    <Label>UF</Label>
                    <select
                        name="UF"
                        className="w-full h-10 border rounded-lg px-3 text-sm"
                        value={selectedUf}
                        onChange={(e) => {
                            setSelectedUf(e.target.value);
                            setSelectedCity(""); // Reseta cidade
                        }}
                    >
                        <option value="">UF</option>
                        {ufs.map(uf => (
                            <option key={uf.sigla} value={uf.sigla}>{uf.sigla}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-3 space-y-2">
                    <Label>Cidade</Label>
                    <select
                        name="cidade"
                        className="w-full h-10 border rounded-lg px-3 text-sm"
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

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                Salvar Alterações
            </Button>
        </form>
    );
}