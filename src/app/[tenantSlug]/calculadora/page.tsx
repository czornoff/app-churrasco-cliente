import connectDB from '@/lib/mongodb';
import { Tenant } from '@/models/Schemas';
import { CalculadoraChurrasco } from '@/components/CalculadoraChurrasco';
import { getCardapioByTenant } from '@/lib/actions/product';

interface CalculadoraPageProps {
    params: Promise<{ tenantSlug: string }>;
}

export default async function CalculadoraPage({ params }: CalculadoraPageProps) {
    const { tenantSlug } = await params;
    await connectDB();

    const tenantRaw = await Tenant.findOne({ slug: tenantSlug }).lean();
    if (!tenantRaw) return null;

    const tenant = JSON.parse(JSON.stringify(tenantRaw));
    const primaryColor = tenant.colorPrimary || "#059669";

    // Fetch cardápio
    const { produtos } = await getCardapioByTenant(tenantRaw._id.toString());

    return (
        <>

            {/* Conteúdo Principal */}
            <section className="max-w-6xl mx-auto px-6 py-12 mt-12">
                <div className="mb-4 space-y-2">
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white">
                        🔥 Calculadora de Churrasco
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Calcule a quantidade perfeita de alimentos para seu evento
                    </p>
                </div>

                <CalculadoraChurrasco
                    produtos={produtos}
                    primaryColor={primaryColor}
                    tenantId={tenantRaw._id.toString()}
                    params={{
                        grCarnePessoa: tenant.grCarnePessoa,
                        grAcompanhamentoPessoa: tenant.grAcompanhamentoPessoa,
                        mlBebidaPessoa: tenant.mlBebidaPessoa,
                        grSobremesaPessoa: tenant.grSobremesaPessoa,
                    }}
                />
            </section>
        </>
    );
}
