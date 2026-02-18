'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Tenant {
    _id: string;
    name: string;
}

interface TenantSelectorProps {
    tenantIds?: string[];
    currentTenantId?: string | null;
    role?: string;
}

export function TenantSelector({ tenantIds = [], currentTenantId, role }: TenantSelectorProps) {
    const router = useRouter();
    const { update } = useSession();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedValue, setSelectedValue] = useState(currentTenantId || '');

    useEffect(() => {
        const fetchTenants = async () => {
            if (!tenantIds || tenantIds.length <= 1) return;

            try {
                const response = await fetch(`/api/tenants?ids=${tenantIds.join(',')}`);
                const data = await response.json();
                setTenants(data.tenants || []);
            } catch (error) {
                console.error('Erro ao buscar tenants:', error);
            }
        };

        fetchTenants();
    }, [tenantIds]);

    const handleTenantChange = async (tenantId: string) => {
        setLoading(true);
        try {
            // Passo 1: Atualizar o tenant ativo no banco de dados
            const response = await fetch('/api/user/set-active-tenant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tenantId }),
            });

            const result = await response.json();
            
            if (result.success) {
                setSelectedValue(tenantId);
                
                // Passo 2: Refrescar a sessão do NextAuth
                const sessionRefresh = await fetch('/api/auth/session-refresh');
                const sessionData = await sessionRefresh.json();
                
                if (sessionData.success) {
                    // Atualizar a sessão localmente
                    await update({
                        tenantId: sessionData.user.tenantId,
                        tenantIds: sessionData.user.tenantIds
                    });
                }
                
                // Passo 3: Fazer o redirecionamento apropriado
                if (role === 'TENANT_OWNER') {
                    // TENANT_OWNER vai para /admin/tenants/[id]
                    router.push(`/admin/tenants/${tenantId}`);
                } else {
                    // SUPERADMIN fica no dashboard mas com o novo tenant ativo
                    // Usar replace para evitar ciclos no histórico
                    router.replace('/admin', { scroll: false });
                }
            } else {
                console.error('Erro ao mudar tenant:', result.message);
                setSelectedValue(currentTenantId || '');
            }
        } catch (error) {
            console.error('Erro ao mudar tenant:', error);
            setSelectedValue(currentTenantId || '');
        } finally {
            setLoading(false);
        }
    };

    // Só mostra seletor se houver mais de um tenant
    if (!tenantIds || tenantIds.length <= 1) {
        return null;
    }

    return (
        <div className="w-full max-w-xs">
            <Select value={selectedValue} onValueChange={handleTenantChange} disabled={loading}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um estabelecimento" />
                </SelectTrigger>
                <SelectContent>
                    {tenants.map(tenant => (
                        <SelectItem key={tenant._id} value={tenant._id}>
                            {tenant.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

