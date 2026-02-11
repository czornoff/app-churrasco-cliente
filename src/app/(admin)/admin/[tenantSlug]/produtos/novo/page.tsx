import { getTenantBySlug } from "@/lib/actions/tenant"; // Exemplo do caminho da sua função
import { ProductForm } from "@/components/ProductForm";
import { notFound } from "next/navigation";

export default async function NewProductPage({ 
    params 
    }: { 
    params: Promise<{ tenantSlug: string }> 
    }) {
    // 1. Aguarda as params (Obrigatório no Next 15)
    const { tenantSlug } = await params;

    // 2. Busca o tenant
    const tenant = await getTenantBySlug(tenantSlug);

    // 3. Se não existir, mostra 404
    if (!tenant) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Novo Item para {tenant.name}
                </h1>
                <p className="text-slate-500">
                    Cadastre as opções de carnes, bebidas ou acompanhamentos de sua loja.
                </p>
            </div>

            {/* Passamos o ID como string para o componente client */}
            <ProductForm tenantId={tenant._id.toString()} />
        </div>
    );
}