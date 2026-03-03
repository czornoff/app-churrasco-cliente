'use client'

import { useState } from 'react';
import { TenantTable } from './TenantTable';
import EditTenantForm from '@/app/(admin)/admin/tenants/[id]/EditTenantForm';
import { ClientProductList } from './ClientProductList';
import { CreateTenantForm } from '@/components/CreateTenantForm';

interface TenantManagerProps {
    initialTenants: any[];
    isTenantOwner: boolean;
}

export function TenantManager({ initialTenants, isTenantOwner }: TenantManagerProps) {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [currentTenant, setCurrentTenant] = useState<any>(null);
    const [tenants, setTenants] = useState(initialTenants);

    const handleEdit = (tenant: any) => {
        setCurrentTenant(tenant);
        setView('editor');
    };

    const handleBack = () => {
        setView('list');
        setCurrentTenant(null);
    };

    if (view === 'editor' && currentTenant) {
        return (
            <div className="max-w-6xl mx-auto">
                <EditTenantForm
                    tenant={currentTenant}
                    id={currentTenant._id.toString()}
                    onBack={handleBack}
                >
                    <ClientProductList
                        tenantId={currentTenant._id.toString()}
                        tenantSlug={currentTenant.slug}
                    />
                </EditTenantForm>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Formulário de Cadastro - Apenas SuperAdmin */}
            {!isTenantOwner && <CreateTenantForm />}

            {/* Listagem de Estabelecimentos */}
            <TenantTable tenants={tenants} onEdit={handleEdit} />
        </div>
    );
}
