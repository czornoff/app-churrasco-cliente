import connectDB from '@/lib/mongodb';
import { Tenant } from '@/models/Schemas';
import { Calculator } from 'lucide-react';

interface CalculadoraPageProps {
    params: Promise<{ tenantSlug: string }>;
}

export default async function CalculadoraPage({ params }: CalculadoraPageProps) {
    const { tenantSlug } = await params;
    await connectDB();

    const tenant = await Tenant.findOne({ slug: tenantSlug }).lean();
    if (!tenant) return null;

    const primaryColor = tenant.colorPrimary || "#059669";

    return (
        <section className="max-w-6xl mx-auto px-6 pb-32 mt-20">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white dark:border-zinc-800/50 rounded-sm p-8 md:p-12 shadow-xl shadow-neutral-200/50 dark:shadow-black/20">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white mb-4">
                        Calculadora de Churrasco
                    </h2>
                    <div className="h-1.5 w-20 bg-emerald-600 mx-auto rounded-sm" style={{ backgroundColor: primaryColor }}></div>
                </div>

                <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
                    <Calculator size={80} className="text-neutral-300 dark:text-zinc-700" />
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                            Em breve!
                        </h3>
                        <p className="text-neutral-500 dark:text-zinc-500 max-w-md">
                            A calculadora interativa estará disponível em breve para ajudá-lo a planejar o churrasco perfeito.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
