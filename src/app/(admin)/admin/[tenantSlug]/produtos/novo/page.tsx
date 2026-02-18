import { getTenantBySlug } from "@/lib/actions/tenant"; // Exemplo do caminho da sua função
import { ProductForm } from "@/components/ProductForm";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function NewProductPage({
    params
}: {
    params: Promise<{ tenantSlug: string }>
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // 1. Aguarda as params (Obrigatório no Next 15)
    const { tenantSlug } = await params;

    // 2. Busca o tenant
    const tenant = await getTenantBySlug(tenantSlug);

    // 3. Se não existir, mostra 404
    if (!tenant) {
        notFound();
    }

    // 4. Se for TENANT_OWNER, só pode acessar seus próprios tenants
    if (session?.user?.role === 'TENANT_OWNER' && !session.user.tenantIds?.includes(tenant._id?.toString())) {
        redirect(`/admin/tenants/${session.user.tenantIds?.[0]}`);
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Novo Item para {tenant.name}
                </h1>
                <p className="text-slate-500 dark:text-slate-200 text-sm">
                    Cadastre as opções de carnes, bebidas ou acompanhamentos do estabelecimento.
                </p>
            </div>

            {/* Passamos o ID como string para o componente client */}
            <ProductForm tenantId={tenant._id.toString()} />
        </div>
    );
}