'use client'

import { useState, useActionState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ITenant } from "@/interfaces/tenant";
import { ActionState } from "@/types/action-state";
import { updateTenantAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaskedInput } from "@/components/ui/masked-input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Palette, Globe, ShieldCheck, ScanBarcode, Plus, List, FileText, MapPin } from "lucide-react";
import { ColorPicker } from "@/components/ColorPicker";
import { CloudinaryUpload } from "@/components/CldUploadWidget"
import { toast } from "sonner";
import { TenantMenuManager } from "@/components/admin/TenantMenuManager";
import { TenantPageManager } from "@/components/admin/TenantPageManager";
import { Textarea } from "@/components/ui/textarea";
import { LocationPreview } from "@/components/LocationPreview";

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
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(tabFromUrl || "geral");
    const [addressValue, setAddressValue] = useState(tenant.address || "");
    const [, startTransition] = useTransition();

    const [state, formAction, isPending] = useActionState<ActionState, FormData>(
        updateTenantAction,
        null
    );
    const [nameValue, setNameValue] = useState<string>((state?.formData?.name as string) || tenant.name);

    useEffect(() => {
        if (state?.errors) {
            if (state.errors.whatsApp || state.errors.instagram || state.errors.email) {
                toast.error("Verifique os campos de Contato & Social.");
                startTransition(() => {
                    setActiveTab("contato");
                });
            }
            else if (state.errors.name) {
                toast.error("Verifique as informações em Geral & Branding.");
                startTransition(() => {
                    setActiveTab("geral");
                });
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
                <div className="overflow-x-auto pb-2">
                    <TabsList className="inline-flex h-auto w-full justify-start md:grid md:grid-cols-6 mb-8 min-w-150">
                        <TabsTrigger value="geral"><Globe className="w-3 h-3 mr-2" /> Geral</TabsTrigger>
                        <TabsTrigger value="contato"><Palette className="w-3 h-3 mr-2" /> Contato</TabsTrigger>
                        <TabsTrigger value="cardapio"><ScanBarcode className="w-3 h-3 mr-2" /> Produtos</TabsTrigger>
                        <TabsTrigger value="menus"><List className="w-3 h-3 mr-2" /> Menu App</TabsTrigger>
                        <TabsTrigger value="paginas"><FileText className="w-3 h-3 mr-2" /> Páginas</TabsTrigger>
                        {session?.user?.role === 'SUPERADMIN' && (
                            <TabsTrigger value="config"><ShieldCheck className="w-3 h-3 mr-2" /> Sistema</TabsTrigger>
                        )}
                    </TabsList>
                </div>

                <TabsContent value="cardapio" forceMount className="data-[state=inactive]:hidden">
                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Produtos</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                        Crie e gerencie os produtos do seu estabelecimento
                                    </p>
                                </div>
                                {activeTab === "cardapio" ? (
                                    <Button
                                        asChild
                                        className="bg-orange-600  hover:bg-orange-700 text-white font-bold"
                                    >
                                        <Link href={`/admin/${tenant.slug}/produtos/novo`}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Novo Item
                                        </Link>
                                    </Button>
                                ) : null}
                            </div>
                            {children}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="menus" forceMount className="data-[state=inactive]:hidden">
                    <Card>
                        <CardContent>
                            <TenantMenuManager tenantId={id} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="paginas" forceMount className="data-[state=inactive]:hidden">
                    <Card>
                        <CardContent>
                            <TenantPageManager tenantId={id} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <form action={formAction}>
                    <input type="hidden" name="id" value={id} />
                    <TabsContent value="geral" forceMount className="data-[state=inactive]:hidden">
                        <Card>
                            <div className="px-6">
                                <div>
                                    <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
                                        Identidade Visual
                                    </h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                        Defina as informações básicas e a aparência do seu estabelecimento no MandeBem.
                                    </p>
                                </div>
                            </div>
                            <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
                                    <Input name="nomeApp" defaultValue={(state?.formData?.nomeApp as string) || tenant.nomeApp} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Slogan</Label>
                                    <Input name="slogan" defaultValue={(state?.formData?.slogan as string) || tenant.slogan} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cor Primária (HEX)</Label>
                                    <ColorPicker name="colorPrimary" defaultValue={(state?.formData?.colorPrimary as string) || tenant.colorPrimary || "#000000"} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Logotipo da Página</Label>
                                    <CloudinaryUpload
                                        name="logoUrl"
                                        defaultValue={(state?.formData?.logoUrl as string) || tenant.logoUrl}
                                        isAvatar={true}
                                        fallbackUrl={`https://ui-avatars.com/api/?name=${encodeURIComponent(nameValue || "Estabelecimento")}&background=random`}
                                    />
                                    <p className="text-[10px] text-zinc-400 italic">
                                        * Esta imagem será exibida no topo do seu cardápio.
                                    </p>
                                </div>

                                {/* Seção de Parâmetros de Cálculo */}
                                <div className="md:col-span-2 pt-6">
                                    <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
                                        Parâmetros de Consumo (por Pessoa)
                                    </h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                                        Defina o consumo base para um homem adulto. Mulheres serão 75% e crianças 50% desses valores.
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label>Carne (gramas)</Label>
                                            <Input type="number" name="grCarnePessoa" defaultValue={(state?.formData?.grCarnePessoa as number) || tenant.grCarnePessoa || 400} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Acomp./Outro (gramas)</Label>
                                            <Input type="number" name="grAcompanhamentoPessoa" defaultValue={(state?.formData?.grAcompanhamentoPessoa as number) || tenant.grAcompanhamentoPessoa || 250} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Bebida (ml)</Label>
                                            <Input type="number" name="mlBebidaPessoa" defaultValue={(state?.formData?.mlBebidaPessoa as number) || tenant.mlBebidaPessoa || 1200} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Sobremesa (gramas)</Label>
                                            <Input type="number" name="grSobremesaPessoa" defaultValue={(state?.formData?.grSobremesaPessoa as number) || tenant.grSobremesaPessoa || 100} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="contato" forceMount className="data-[state=inactive]:hidden">
                        <Card>
                            <div className="px-6">
                                <div>
                                    <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
                                        Canais de Atendimento
                                    </h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                        Configure os meios de contato e redes sociais para seus clientes.
                                    </p>
                                </div>
                            </div>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>WhatsApp</Label>
                                    <MaskedInput name="whatsApp" defaultValue={(state?.formData?.whatsApp as string) || tenant.whatsApp} maskType="whatsapp" />
                                    {state?.errors?.whatsApp && <p className="text-xs text-red-500 font-medium">{state.errors.whatsApp[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Instagram</Label>
                                    <MaskedInput name="instagram" defaultValue={(state?.formData?.instagram as string) || tenant.instagram} maskType="instagram" />
                                    {state?.errors?.instagram && <p className="text-xs text-red-500 font-medium">{state.errors.instagram[0]}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>E-mail de Contato</Label>
                                    <MaskedInput name="email" type="email" defaultValue={(state?.formData?.email as string) || tenant.email} maskType="email" />
                                    {state?.errors?.email && <p className="text-xs text-red-500 font-medium">{state.errors.email[0]}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Endereço Completo (Localização)
                                    </Label>
                                    <Textarea
                                        name="address"
                                        placeholder="Ex: Rua das Flores, 123, São Paulo, SP"
                                        defaultValue={(state?.formData?.address as string) || tenant.address}
                                        onChange={(e) => setAddressValue(e.target.value)}
                                        className="min-h-20"
                                    />
                                    <p className="text-xs text-zinc-500">
                                        O endereço será exibido no mapa da página inicial.
                                    </p>
                                </div>
                                {addressValue && (
                                    <div className="mt-6 md:col-span-2">
                                        <LocationPreview address={addressValue} name={tenant.name} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {session?.user?.role === 'SUPERADMIN' && (
                        <TabsContent value="config" forceMount className="data-[state=inactive]:hidden">
                            <Card>
                                <div className="px-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
                                            Configurações Administrativas
                                        </h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                            Configure os limites e versão do sistema.
                                        </p>
                                    </div>
                                </div>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Limite de Consultas Gratuitas</Label>
                                        <Input type="number" name="limiteConsulta" defaultValue={(state?.formData?.limiteConsulta as number) || tenant.limiteConsulta} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Versão do Sistema</Label>
                                        <Input name="versao" defaultValue={(state?.formData?.versao as string) || tenant.versao} />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-8">
                                        <input
                                            type="checkbox"
                                            name="active"
                                            id="active"
                                            defaultChecked={(state?.formData?.active as boolean) || tenant.active}
                                            className="h-4 w-4 rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <Label htmlFor="active" className="text-sm font-medium">Conta Ativa (Acesso liberado)</Label>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                    {activeTab !== "cardapio" && activeTab !== "menus" && activeTab !== "paginas" ? (

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
        </div>
    );
}