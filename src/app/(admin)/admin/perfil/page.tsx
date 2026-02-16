import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { ProfileForm } from "@/components/ProfileForm";
import Image from "next/image";
import { IUser } from "@/interfaces/user";
import { UserCircle } from "lucide-react";

export default async function ProfilePage() {
    const session = await getServerSession();
    if (!session) redirect("/admin");

    await connectDB();
    const userData = await User.findOne({ email: session.user?.email }).lean() as unknown as IUser;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-6">
                <div className="flex items-left gap-2">
                    <UserCircle className="h-8 w-8 text-orange-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Meu Perfil</h1>
                        <p className="text-slate-500 dark:text-slate-200 text-sm">Atualize suas informações de contato e localização.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-lg">
                <ProfileForm initialData={JSON.parse(JSON.stringify(userData))} />
            </div>
        </div>
    );
}