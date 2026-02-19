'use client'

import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { X, ChevronDown } from 'lucide-react';
import { ITenantDocument } from '@/models/Schemas';

interface TenantsMultiSelectProps {
    tenants: ITenantDocument[];
    selectedIds?: string[];
    onChange?: (selectedIds: string[]) => void;
    disabled?: boolean;
}

export function TenantsMultiSelect({ 
    tenants, 
    selectedIds = [], 
    onChange,
    disabled = false 
}: TenantsMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>(selectedIds);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSelect = (tenantId: string) => {
        const newSelected = selected.includes(tenantId)
            ? selected.filter(id => id !== tenantId)
            : [...selected, tenantId];
        
        setSelected(newSelected);
        onChange?.(newSelected);
    };

    const handleRemove = (tenantId: string) => {
        const newSelected = selected.filter(id => id !== tenantId);
        setSelected(newSelected);
        onChange?.(newSelected);
    };

    const selectedTenants = tenants.filter(t => selected.includes(t._id.toString()));

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">
            <input 
                type="hidden" 
                name="tenantIds" 
                value={JSON.stringify(selected)} 
            />
            
            <div
                onClick={() => !disabled && setOpen(!open)}
                className={`w-full min-h-10 border rounded-md px-3 py-2 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    disabled 
                        ? 'bg-zinc-100 dark:bg-zinc-700 cursor-not-allowed' 
                        : 'bg-white dark:bg-zinc-800 hover:border-orange-400'
                } ${open ? 'border-orange-500' : 'border-zinc-200 dark:border-zinc-600'}`}
            >
                <div className="flex flex-wrap gap-2 flex-1">
                    {selectedTenants.length > 0 ? (
                        selectedTenants.map(tenant => (
                            <Badge 
                                key={tenant._id.toString()} 
                                className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                            >
                                {tenant.name}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(tenant._id.toString());
                                    }}
                                    className="ml-1 hover:text-orange-600 dark:hover:text-orange-400"
                                    disabled={disabled}
                                >
                                    <X size={14} />
                                </button>
                            </Badge>
                        ))
                    ) : (
                        <span className="text-zinc-400 dark:text-zinc-500 text-sm">
                            Selecione estabelecimentos...
                        </span>
                    )}
                </div>
                <ChevronDown 
                    size={16} 
                    className={`text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </div>

            {open && !disabled && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                    {tenants.length === 0 ? (
                        <div className="p-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
                            Nenhum estabelecimento disponível
                        </div>
                    ) : (
                        <div className="p-2">
                            {tenants.map(tenant => (
                                <button
                                    key={tenant._id.toString()}
                                    type="button"
                                    onClick={() => handleSelect(tenant._id.toString())}
                                    className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                                        selected.includes(tenant._id.toString())
                                            ? 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 font-medium'
                                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                                    }`}
                                >
                                    {tenant.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
