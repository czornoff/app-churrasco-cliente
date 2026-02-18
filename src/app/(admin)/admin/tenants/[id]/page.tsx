import connectDB from "@/lib/mongodb";
import { Tenant } from "@/models/Schemas";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import EditTenantForm from "./EditTenantForm"; 
import { ProductList } from "@/components/ProductList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Se for TENANT_OWNER, só pode acessar seus próprios tenants
    if (session?.user?.role === 'TENANT_OWNER' && !session.user.tenantIds?.includes(id)) {
        redirect(`/admin/tenants/${session.user.tenantIds?.[0]}`);
    }

    await connectDB();
    
    const tenantRaw = await Tenant.findById(id).lean();

    if (!tenantRaw) {
        return <div className="p-10 text-center text-red-500 font-bold">Tenant não encontrado.</div>;
    }

    // Serializa o objeto do Mongo para um JSON simples
    const tenant = JSON.parse(JSON.stringify(tenantRaw));

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* HEADER */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold italic text-slate-700 flex items-center gap-3">
                    <Edit className="w-8 h-8 text-slate-400 shrink-0" />
                    <div className="flex flex-col line-height-tight">
                        <span>{tenant.name}</span>
                        <span className="text-xs text-slate-500 font-mono font-normal not-italic tracking-wider">
                        /{tenant.slug}
                        </span>
                    </div>
                </h1>
                <Button variant="ghost" asChild>
                    <Link href="/admin/tenants">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Link>
                </Button>
            </div>

            {/* FORMULÁRIO DE CLIENTE (Com validação e hooks) */}
            <EditTenantForm tenant={tenant} id={id}>
                <ProductList tenantId={id} />
            </EditTenantForm>
        </div>
    );
}