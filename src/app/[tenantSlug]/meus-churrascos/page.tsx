import connectDB from "@/lib/mongodb";
import { Tenant } from "@/models/Schemas";
import { getCalculationsByUserIdAction } from "@/lib/actions/calculation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Calendar, History, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClientMeusChurrascos } from "./ClientMeusChurrascos";

interface PageProps {
    params: Promise<{ tenantSlug: string }>;
}

export default async function MeusChurrascosPage({ params }: PageProps) {
    const { tenantSlug } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect(`/${tenantSlug}`);
    }

    await connectDB();
    const tenant = await Tenant.findOne({ slug: tenantSlug }).lean();
    if (!tenant) return null;

    const calculations = await getCalculationsByUserIdAction((session.user as any).id, tenant._id.toString());

    const primaryColor = tenant?.colorPrimary || '#e53935';

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-32 pb-12">
            <div className="max-w-6xl mx-auto px-6 space-y-8">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <History className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                                Meus Churrascos
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                                Seu histórico de cálculos salvos em {tenant.name}
                            </p>
                        </div>
                    </div>
                    <Link href={`/${tenantSlug}`}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                </div>

                <div className="h-0.5 w-full rounded-full opacity-60" style={{ backgroundColor: primaryColor }} />

                <div className="bg-white dark:bg-zinc-900 rounded-lg py-4 shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <ClientMeusChurrascos calculations={JSON.parse(JSON.stringify(calculations))} />
                </div>
            </div>
        </div>
    );
}
