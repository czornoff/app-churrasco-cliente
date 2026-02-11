'use client'

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ITenant} from "@/interfaces/tenant";
import { ActionState } from "@/types/action-state";
import { useActionState } from "react";
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
                                    <Label>Nome da Loja</Label>
                                    <Input name="name" defaultValue={tenant.name} />
                                    {state?.errors?.name && <p className="text-xs text-red-500 font-medium">{state.errors.name[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Nome do App</Label>
                                    <Input name="nomeApp" defaultValue={tenant.nomeApp} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Slogan</Label>
                                    <Input name="slogan" defaultValue={tenant.slogan} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cor Primária (HEX)</Label>
                                    <ColorPicker name="colorPrimary" defaultValue={tenant.colorPrimary || "#000000"} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Logotipo da Página</Label>
                                    <CloudinaryUpload 
                                        name="logoUrl" 
                                        defaultValue={tenant.logoUrl} 
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
                                    <MaskedInput name="whatsApp" defaultValue={tenant.whatsApp} maskType="whatsapp" />
                                    {state?.errors?.whatsApp && <p className="text-xs text-red-500 font-medium">{state.errors.whatsApp[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Instagram</Label>
                                    <MaskedInput name="instagram" defaultValue={tenant.instagram} maskType="instagram" />
                                    {state?.errors?.instagram && <p className="text-xs text-red-500 font-medium">{state.errors.instagram[0]}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>E-mail de Contato</Label>
                                    <MaskedInput name="email" type="email" defaultValue={tenant.email} maskType="email" />
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
                                    <Input type="number" name="limiteConsulta" defaultValue={tenant.limiteConsulta} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Versão do Sistema</Label>
                                    <Input name="versao" defaultValue={tenant.versao} />
                                </div>
                                <div className="flex items-center space-x-2 pt-8">
                                    <input 
                                        type="checkbox" 
                                        name="active" 
                                        id="active" 
                                        defaultChecked={tenant.active}
                                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <Label htmlFor="active" className="text-sm font-medium">Conta Ativa (Acesso liberado)</Label>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </form>
            </Tabs>

            <div className="mt-8 flex flex-col items-end gap-2">
                {activeTab === "cardapio" ? (
                    /* Botão que aparece APENAS na aba Cardápio */
                    <Button 
                        asChild
                        className="bg-green-600 hover:bg-green-700 w-full md:w-auto px-12 py-6 text-lg"
                    >
                        {/* Note: Aqui usamos o slug se você tiver, ou o ID. 
                            O ideal é passar o link para a página de criação de produtos.
                        */}
                        <Link href={`/admin/${tenant.slug}/produtos/novo`}>
                            <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Produto
                        </Link>
                    </Button>
                ) : (
                    /* Botão Salvar (Aparece em todas as outras abas) */
                    <>
                        {state?.message && !state.success && (
                            <p className="text-sm text-red-600 font-bold bg-red-50 px-4 py-2 rounded-md border border-red-200">
                                {state.message}
                            </p>
                        )}
                        <Button 
                            type="submit" 
                            disabled={isPending}
                            className="bg-orange-600 hover:bg-orange-700 w-full md:w-auto px-12 py-6 text-lg"
                        >
                            {isPending ? "Salvando..." : <><Save className="mr-2 h-5 w-5" /> Salvar Alterações</>}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}