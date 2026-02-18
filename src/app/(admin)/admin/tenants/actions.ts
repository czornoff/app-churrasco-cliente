'use server'

import connectDB from "@/lib/mongodb";
import { Tenant } from "@/models/Schemas";
import { tenantCreateSchema, tenantUpdateSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ActionState } from "@/types/action-state";

export async function createTenantAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
    await connectDB();

    const rawData = {
        name: formData.get('name')?.toString(),
        slug: formData.get('slug')?.toString(),
    };

    const result = tenantCreateSchema.safeParse(rawData);

    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors,
            message: "Erro de validação. Verifique os campos.",
            formData: rawData
        };
    }

    const { name, slug } = result.data;
    const formattedSlug = slug.toLowerCase().trim().replace(/\s+/g, '-');

    let newId;

    try {
        const newTenant = await Tenant.create({
            name,
            slug: formattedSlug,
            nomeApp: name,
            logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        });

        newId = newTenant._id.toString();
        revalidatePath('/admin/tenants');
    } catch (error: any) {
        if (error.code === 11000) {
            return {
                success: false,
                message: `O endereço "/${formattedSlug}" já está sendo usado por outro estabelecimento.`,
                formData: rawData
            };
        }
        return {
            success: false,
            message: "Ocorreu um erro ao salvar o estabelecimento. Tente novamente.",
            formData: rawData
        };
    }

    if (newId) {
        redirect(`/admin/tenants/${newId}`);
    }

    return { success: true };
}

export async function updateTenantAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
    await connectDB();

    const id = formData.get('id')?.toString();
    if (!id) return { success: false, message: "ID não fornecido" };

    const rawData = {
        id: id,
        name: formData.get('name')?.toString(),
        nomeApp: formData.get('nomeApp')?.toString(),
        slogan: formData.get('slogan')?.toString(),
        email: formData.get('email')?.toString(),
        whatsApp: formData.get('whatsApp')?.toString(),
        instagram: formData.get('instagram')?.toString(),
        address: formData.get('address')?.toString(),
        logoUrl: (() => {
            const currentLogo = formData.get('logoUrl')?.toString().trim() || "";
            const isPlaceholder = !currentLogo || currentLogo.includes('ui-avatars.com') || currentLogo.includes('mandebem.com') || currentLogo.includes('placeholder');
            return isPlaceholder
                ? `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.get('name')?.toString() || "Estabelecimento")}&background=random`
                : currentLogo;
        })(),
        colorPrimary: formData.get('colorPrimary')?.toString(),
        versao: formData.get('versao')?.toString(),
        active: formData.get('active') === 'on',
        limiteConsulta: Number(formData.get('limiteConsulta')) || 5
    };

    const result = tenantUpdateSchema.safeParse(rawData);

    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors,
            message: "Erro de validação. Verifique os campos.",
            formData: rawData
        };
    }

    try {
        await Tenant.findByIdAndUpdate(id, result.data);
        revalidatePath(`/admin/tenants/${id}`);
        revalidatePath('/admin/tenants');
    } catch (error) {
        return { success: false, message: "Falha ao salvar no banco de dados.", formData: rawData };
    }

    redirect('/admin/tenants');
}

export async function deleteTenantAction(formData: FormData) {
    await connectDB();
    const id = formData.get('id');
    try {
        if (id) {
            await Tenant.findByIdAndDelete(id);
            revalidatePath('/admin/tenants');
        }
    } catch (error) {
        console.error("Erro ao deletar:", error);
        throw new Error("Falha ao remover estabelecimento.");
    }
}