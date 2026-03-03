import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { Tenant } from "@/models/Schemas";
import { ClienteProfileForm } from "@/components/ClienteProfileForm";
import { IUser } from "@/interfaces/user";
import { UserCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PerfilPageProps {
    params: Promise<{ tenantSlug: string }>;
}

export default async function ClientePerfilPage({ params }: PerfilPageProps) {
    const { tenantSlug } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect(`/${tenantSlug}`);
    }

    await connectDB();

    const [userData, tenantData] = await Promise.all([
        User.findOne({ email: session.user?.email }).lean() as unknown as IUser | null,
        Tenant.findOne({ slug: tenantSlug }).lean(),
    ]);

    if (!userData) redirect(`/${tenantSlug}`);

    const primaryColor = tenantData?.colorPrimary || '#e53935';

    return (
        <div className="min-h-screen pt-32 pb-16 px-6">
            <div className="max-w-6xl mx-auto px-6 space-y-8">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <UserCircle className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                                Meu Perfil
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                                Atualize suas informações pessoais
                            </p>
                        </div>
                    </div>
                    <Link href={`/${tenantSlug}`}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                </div>

                {/* Accent line */}
                <div className="h-0.5 w-full rounded-full opacity-60" style={{ backgroundColor: primaryColor }} />

                {/* Form */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 shadow-sm p-6">
                    <ClienteProfileForm
                        initialData={JSON.parse(JSON.stringify(userData))}
                        tenantSlug={tenantSlug}
                        primaryColor={primaryColor}
                    />
                </div>
            </div>
        </div >
    );
}
