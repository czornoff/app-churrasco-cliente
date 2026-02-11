import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { ProfileForm } from "@/components/ProfileForm";
import Image from "next/image";
import { IUser} from "@/interfaces/user";

export default async function ProfilePage() {
    const session = await getServerSession();
    if (!session) redirect("/admin");

    await connectDB();
    const userData = await User.findOne({ email: session.user?.email }).lean() as unknown as IUser;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
                <p className="text-slate-500 text-sm">Atualize suas informações de contato e localização.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Lado Esquerdo: Info do Google */}
                <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-sm h-fit text-center">
                    <Image 
                        src={userData?.avatar} 
                        alt="Foto de perfil" 
                        className="w-24 h-24 rounded-full mx-auto border-4 border-orange-100"
                    />
                    <h2 className="mt-4 font-bold text-lg">{userData?.nome}</h2>
                    <p className="text-sm text-slate-500">{userData?.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                        {userData?.role}
                    </span>
                </div>

                {/* Lado Direito: Formulário */}
                <div className="flex-1">
                    <ProfileForm initialData={JSON.parse(JSON.stringify(userData))} />
                </div>
            </div>
        </div>
    );
}