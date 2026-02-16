'use client'

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ITenant } from "@/interfaces/tenant";
import { ActionState } from "@/types/action-state";
import { updateTenantAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaskedInput } from "@/components/ui/masked-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Palette, Globe, ShieldCheck, ScanBarcode, PlusCircle } from "lucide-react";
import { ColorPicker } from "@/components/ColorPicker";
import { CloudinaryUpload } from "@/components/CldUploadWidget"
import { toast } from "sonner";

export default function EditTenantForm(
    {
        tenant,
        id,
        children
    }: {
        tenant: ITenant,
        id: string,
        children: React.ReactNode
    }
) {
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(tabFromUrl || "geral");

    const [state, formAction, isPending] = useActionState<ActionState, FormData>(
        updateTenantAction,
        null
    );
    const [nameValue, setNameValue] = useState(state?.formData?.name || tenant.name);

    useEffect(() => {
        if (state?.errors) {
            if (state.errors.whatsApp || state.errors.instagram || state.errors.email) {
                toast.error("Verifique os campos de Contato & Social.");
                setActiveTab("contato");
            }
            else if (state.errors.name) {
                toast.error("Verifique as informações em Geral & Branding.");
                setActiveTab("geral");
            }
        }
    }, [state]);

    return (
        <div className="w-full">
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="geral"><Globe className="w-3 h-3 mr-2" /> Geral & Branding</TabsTrigger>
                    <TabsTrigger value="contato"><Palette className="w-3 h-3 mr-2" /> Contato & Social</TabsTrigger>
                    <TabsTrigger value="config"><ShieldCheck className="w-3 h-3 mr-2" /> Sistema</TabsTrigger>
                    <TabsTrigger value="cardapio"><ScanBarcode className="w-3 h-3 mr-2" /> Cardápio</TabsTrigger>
                </TabsList>

                <TabsContent value="cardapio" forceMount className="data-[state=inactive]:hidden">
                    <Card>
                        <CardHeader><CardTitle>Cardápio de Produtos</CardTitle></CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            {children}
                        </CardContent>
                    </Card>
                </TabsContent>

                <form action={formAction}>
                    <input type="hidden" name="id" value={id} />
                    <TabsContent value="geral" forceMount className="data-[state=inactive]:hidden">
                        <Card>
                            <CardHeader><CardTitle>Identidade Visual</CardTitle></CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Nome do Estabelecimento</Label>
                                    <Input
                                        name="name"
                                        value={nameValue}
                                        onChange={(e) => setNameValue(e.target.value)}
                                    />
                                    {state?.errors?.name && <p className="text-xs text-red-500 font-medium">{state.errors.name[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Nome do App</Label>
                                    <Input name="nomeApp" defaultValue={state?.formData?.nomeApp || tenant.nomeApp} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Slogan</Label>
                                    <Input name="slogan" defaultValue={state?.formData?.slogan || tenant.slogan} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cor Primária (HEX)</Label>
                                    <ColorPicker name="colorPrimary" defaultValue={state?.formData?.colorPrimary || tenant.colorPrimary || "#000000"} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Logotipo da Página</Label>
                                    <CloudinaryUpload
                                        name="logoUrl"
                                        defaultValue={state?.formData?.logoUrl || tenant.logoUrl}
                                        isAvatar={true}
                                        fallbackUrl={`https://ui-avatars.com/api/?name=${encodeURIComponent(nameValue || "Estabelecimento")}&background=random`}
                                    />
                                    <p className="text-[10px] text-slate-400 italic">
                                        * Esta imagem será exibida no topo do seu cardápio.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="contato" forceMount className="data-[state=inactive]:hidden">
                        <Card>
                            <CardHeader><CardTitle>Canais de Atendimento</CardTitle></CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>WhatsApp</Label>
                                    <MaskedInput name="whatsApp" defaultValue={state?.formData?.whatsApp || tenant.whatsApp} maskType="whatsapp" />
                                    {state?.errors?.whatsApp && <p className="text-xs text-red-500 font-medium">{state.errors.whatsApp[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Instagram</Label>
                                    <MaskedInput name="instagram" defaultValue={state?.formData?.instagram || tenant.instagram} maskType="instagram" />
                                    {state?.errors?.instagram && <p className="text-xs text-red-500 font-medium">{state.errors.instagram[0]}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>E-mail de Contato</Label>
                                    <MaskedInput name="email" type="email" defaultValue={state?.formData?.email || tenant.email} maskType="email" />
                                    {state?.errors?.email && <p className="text-xs text-red-500 font-medium">{state.errors.email[0]}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="config" forceMount className="data-[state=inactive]:hidden">
                        <Card>
                            <CardHeader><CardTitle>Configurações Administrativas</CardTitle></CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Limite de Consultas Gratuitas</Label>
                                    <Input type="number" name="limiteConsulta" defaultValue={state?.formData?.limiteConsulta || tenant.limiteConsulta} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Versão do Sistema</Label>
                                    <Input name="versao" defaultValue={state?.formData?.versao || tenant.versao} />
                                </div>
                                <div className="flex items-center space-x-2 pt-8">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        id="active"
                                        defaultChecked={state?.formData?.active || tenant.active}
                                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <Label htmlFor="active" className="text-sm font-medium">Conta Ativa (Acesso liberado)</Label>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    {activeTab !== "cardapio" ? (

                        /* Botão Salvar (Aparece em todas as outras abas) */
                        <div className="mt-8 flex flex-col items-end gap-2">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-orange-600 hover:bg-orange-700 w-full md:w-auto px-12 py-6 text-white"
                            >
                                {isPending ? "Salvando..." : <><Save className="mr-2 h-5 w-5" /> Salvar Alterações</>}
                            </Button>
                        </div>
                    ) : null}
                </form>
            </Tabs>

            <div className="mt-8 flex flex-col items-end gap-2">
                {activeTab === "cardapio" ? (
                    /* Botão que aparece APENAS na aba Cardápio */
                    <Button
                        asChild
                        className="bg-orange-600 w-full md:w-auto px-12 py-6 text-white"
                    >
                        {/* Note: Aqui usamos o slug se você tiver, ou o ID. 
                            O ideal é passar o link para a página de criação de produtos.
                        */}
                        <Link href={`/admin/${tenant.slug}/produtos/novo`}>
                            <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Produto
                        </Link>
                    </Button>
                ) : null}
            </div>
        </div>
    );
}