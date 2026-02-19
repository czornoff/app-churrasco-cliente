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
    slug: string;
    nomeApp: string;
}

interface PublicTenantSelectorProps {
    currentTenantSlug?: string;
    colorPrimary?: string;
}

export function PublicTenantSelector({ currentTenantSlug, colorPrimary }: PublicTenantSelectorProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentTenantId, setCurrentTenantId] = useState<string>('');

    useEffect(() => {
        const fetchTenants = async () => {
            if (!session?.user?.tenantIds || session.user.tenantIds.length <= 1) return;

            try {
                const response = await fetch(`/api/tenants?ids=${session.user.tenantIds.join(',')}`);
                const data = await response.json();
                setTenants(data.tenants || []);

                // Encontrar o tenant atual pelo slug
                if (currentTenantSlug && data.tenants) {
                    const current = data.tenants.find((t: Tenant) => t.slug === currentTenantSlug);
                    if (current) {
                        setCurrentTenantId(current._id);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar tenants:', error);
            }
        };

        fetchTenants();
    }, [session?.user?.tenantIds, currentTenantSlug]);

    const handleTenantChange = async (tenantId: string) => {
        setLoading(true);
        try {
            // Encontrar o slug do tenant selecionado
            const selectedTenant = tenants.find(t => t._id === tenantId);
            if (selectedTenant && selectedTenant.slug) {
                router.push(`/${selectedTenant.slug}`);
            }
        } catch (error) {
            console.error('Erro ao mudar tenant:', error);
        } finally {
            setLoading(false);
        }
    };

    // Só mostra seletor se o usuário estiver autenticado e tiver mais de um tenant
    if (!session || !session.user?.tenantIds || session.user.tenantIds.length <= 1) {
        return null;
    }

    return (
        <div className="w-full max-w-xs">
            <Select value={currentTenantId || ''} onValueChange={handleTenantChange} disabled={loading}>
                <SelectTrigger 
                    className="w-full text-xs md:text-sm py-1"
                    style={{ 
                        borderColor: colorPrimary,
                    }}
                >
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
