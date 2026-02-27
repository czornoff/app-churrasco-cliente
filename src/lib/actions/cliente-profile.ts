'use server'

import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateClienteProfileAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Não autorizado");

    await connectDB();

    const nome = formData.get("nome") as string;
    const tenantSlug = formData.get("tenantSlug") as string;

    const updateData = {
        nome,
        whatsApp: formData.get("whatsApp") as string,
        UF: formData.get("UF") as string,
        cidade: formData.get("cidade") as string,
        genero: formData.get("genero") as string,
        birthday: formData.get("birthday") ? new Date(formData.get("birthday") as string) : undefined,
    };

    const avatar = (() => {
        const currentAvatar = formData.get("avatar")?.toString().trim() || "";
        const isPlaceholder = !currentAvatar || currentAvatar.includes('ui-avatars.com') || currentAvatar.includes('placeholder');
        return isPlaceholder
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(nome || 'User')}&background=random`
            : currentAvatar;
    })();

    await User.findOneAndUpdate(
        { email: session.user.email },
        { $set: { ...updateData, avatar } }
    );

    revalidatePath(`/${tenantSlug}/perfil`);
    return { success: true };
}
