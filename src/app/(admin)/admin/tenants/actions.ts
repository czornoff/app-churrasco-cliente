'use server'

import connectDB from "@/lib/mongodb";
import { Tenant } from "@/models/Schemas";
import { tenantUpdateSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ActionState } from "@/types/action-state";

export async function createTenantAction(formData: FormData) {
    await connectDB();
    
    const name = formData.get('name');
    const slug = formData.get('slug')?.toString().toLowerCase().trim().replace(/\s+/g, '-');

    let newId;

    if (name && slug) {
        const newTenant = await Tenant.create({ 
        name, 
        slug,
        nomeApp: name 
        });
        
        newId = newTenant._id.toString();
        revalidatePath('/admin/tenants');
    }

    if (newId) {
        redirect(`/admin/tenants/${newId}`);
    }
}

// O primeiro argumento 'prevState' é obrigatório para usar com useActionState
export async function updateTenantAction(prevState: ActionState, formData: FormData) {
    await connectDB();

    const id = formData.get('id')?.toString();
    if (!id) return { message: "ID não fornecido" };

    // 1. Coletar dados para validação
    const rawData = {
        id: id,
        name: formData.get('name'),
        email: formData.get('email'),
        whatsApp: formData.get('whatsApp'),
        instagram: formData.get('instagram'),
    };

    // 2. Validar com Zod
    const result = tenantUpdateSchema.safeParse(rawData);
    
    if (!result.success) {
        // Retorna os erros formatados para o useActionState
        return {
        success: false,
        errors: result.error.flatten().fieldErrors,
        message: "Erro de validação. Verifique os campos."
        };
    }

    // 3. Preparar dados para o MongoDB
    const updateData = {
        name: formData.get('name'),
        nomeApp: formData.get('nomeApp'),
        slogan: formData.get('slogan'),
        email: formData.get('email'),
        whatsApp: formData.get('whatsApp'),
        instagram: formData.get('instagram'),
        logoUrl: formData.get('logoUrl'),
        colorPrimary: formData.get('colorPrimary'),
        versao: formData.get('versao'),
        active: formData.get('active') === 'on',
        limiteConsulta: Number(formData.get('limiteConsulta')) || 5
    };

    try {
        await Tenant.findByIdAndUpdate(id, updateData);
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        return { success: false, message: "Falha ao salvar no banco de dados." };
    }
    
    // 4. Revalidar caches
    revalidatePath('/admin/tenants');
    revalidatePath(`/admin/tenants/${id}`);
    
    // 5. Redirecionar
    redirect('/admin/tenants');
}

export async function deleteTenantAction(formData: FormData) {
    await connectDB();
    const id = formData.get('id');
    if (id) {
        await Tenant.findByIdAndDelete(id);
        revalidatePath('/admin/tenants');
    }
}