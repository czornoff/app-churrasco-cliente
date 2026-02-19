import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { ProfileForm } from "@/components/ProfileForm";
import Image from "next/image";
import { IUser } from "@/interfaces/user";
import { UserCircle } from "lucide-react";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    // TENANT_OWNER não pode acessar perfil geral, vai para seu primeiro tenant
    if (session?.user?.role === 'TENANT_OWNER' && session.user.tenantIds && session.user.tenantIds.length > 0) {
        redirect(`/admin/tenants/${session.user.tenantIds[0]}`);
    }

    await connectDB();
    const userData = await User.findOne({ email: session.user?.email }).lean() as unknown as IUser;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-6">
                <div className="flex items-left gap-2">
                    <UserCircle className="h-8 w-8 text-orange-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">Meu Perfil</h1>
                        <p className="text-zinc-500 dark:text-zinc-200 text-sm">Atualize suas informações de contato e localização.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-lg">
                <ProfileForm initialData={JSON.parse(JSON.stringify(userData))} />
            </div>
        </div>
    );
}