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
            <div className="max-w-lg mx-auto space-y-8">

                {/* Voltar */}
                <Link
                    href={`/${tenantSlug}`}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                    <ArrowLeft size={14} />
                    Voltar
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <UserCircle size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                            Meu Perfil
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                            Atualize suas informações pessoais
                        </p>
                    </div>
                </div>

                {/* Accent line */}
                <div className="h-0.5 w-full rounded-full opacity-60" style={{ backgroundColor: primaryColor }} />

                {/* Form */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6">
                    <ClienteProfileForm
                        initialData={JSON.parse(JSON.stringify(userData))}
                        tenantSlug={tenantSlug}
                        primaryColor={primaryColor}
                    />
                </div>
            </div>
        </div>
    );
}
