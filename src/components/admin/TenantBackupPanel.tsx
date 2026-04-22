'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Download,
    Upload,
    ShieldCheck,
    Users,
    Package,
    History,
    Tag,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    List,
    FileText,
} from 'lucide-react';

interface BackupSummary {
    tenant: number;
    cardapio: number;
    categories: number;
    calculations: number;
    menus: number;
    paginas: number;
    users: number;
    whatsappLogs: number;
    note?: string;
}

interface TenantBackupPanelProps {
    tenantId: string;
    tenantSlug?: string;
}

export function TenantBackupPanel({ tenantId, tenantSlug }: TenantBackupPanelProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [lastImportSummary, setLastImportSummary] = useState<BackupSummary | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- EXPORTAR ---
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const res = await fetch(`/api/admin/tenants/${tenantId}/backup`);

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.error || 'Erro ao exportar backup.');
                return;
            }

            const blob = await res.blob();
            const contentDisposition = res.headers.get('Content-Disposition');
            const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
            const filename = filenameMatch?.[1] || `backup-${tenantSlug || tenantId}-${new Date().toISOString().split('T')[0]}.mbkp`;

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Backup exportado com sucesso!', {
                description: `Arquivo: ${filename}`,
            });
        } catch (error) {
            console.error('[EXPORT_ERROR]', error);
            toast.error('Falha na exportação. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    };

    // --- IMPORTAR ---
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.mbkp')) {
            toast.error('Arquivo inválido. Selecione um arquivo .mbkp');
            return;
        }

        const confirmed = window.confirm(
            `⚠️ ATENÇÃO: A importação irá sobrescrever os dados atuais desta loja (cardápio, categorias e cálculos).\n\nTem certeza que deseja continuar com o arquivo:\n"${file.name}"?`
        );
        if (!confirmed) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsImporting(true);
        setLastImportSummary(null);

        try {
            const text = await file.text();

            const res = await fetch(`/api/admin/tenants/${tenantId}/backup`, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: text,
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Erro ao importar backup.');
                return;
            }

            setLastImportSummary(data.restored);
            toast.success('Backup restaurado com sucesso!', {
                description: 'Os dados da loja foram atualizados.',
            });
        } catch (error) {
            console.error('[IMPORT_ERROR]', error);
            toast.error('Falha na importação. Verifique o arquivo e tente novamente.');
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const includedItems = [
        { icon: ShieldCheck, label: 'Configurações da loja', color: 'text-blue-500' },
        { icon: Package, label: 'Produtos do cardápio', color: 'text-orange-500' },
        { icon: Tag, label: 'Categorias dinâmicas', color: 'text-purple-500' },
        { icon: List, label: 'Menus do App', color: 'text-pink-500' },
        { icon: FileText, label: 'Páginas', color: 'text-indigo-500' },
        { icon: Users, label: 'Usuários vinculados', color: 'text-green-500' },
        { icon: History, label: 'Histórico de cálculos', color: 'text-yellow-500' },
        { icon: MessageSquare, label: 'Logs do WhatsApp', color: 'text-teal-500' },
    ];

    return (
        <div className="space-y-6 pt-4">
            {/* Header */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-semibold mb-1">Backup criptografado</p>
                    <p className="text-amber-700 dark:text-amber-400">
                        O arquivo <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">.mbkp</code> é criptografado com AES e só pode ser importado neste sistema. Guarde-o em local seguro.
                    </p>
                </div>
            </div>

            {/* O que está incluído */}
            <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    O backup inclui:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {includedItems.map(({ icon: Icon, label, color }) => (
                        <div
                            key={label}
                            className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700"
                        >
                            <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Exportar */}
                <Card className="border-zinc-200 dark:border-zinc-700">
                    <CardContent className="p-4 space-y-3">
                        <div>
                            <h4 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                <Download className="w-4 h-4 text-blue-500" />
                                Exportar Backup
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                Gera um arquivo <code className="text-[11px]">.mbkp</code> com todos os dados desta loja.
                            </p>
                        </div>
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            variant="outline"
                            className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/40"
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Exportando...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar Loja
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Importar */}
                <Card className="border-zinc-200 dark:border-zinc-700">
                    <CardContent className="p-4 space-y-3">
                        <div>
                            <h4 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-green-500" />
                                Importar Backup
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                Restaura dados de um arquivo <code className="text-[11px]">.mbkp</code> exportado anteriormente.
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".mbkp"
                            className="hidden"
                            onChange={handleFileChange}
                            id={`backup-import-${tenantId}`}
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isImporting}
                            variant="outline"
                            className="w-full border-green-300 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/40"
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Importar Loja
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Resultado da última importação */}
            {lastImportSummary && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 space-y-3">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Restauração concluída
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                            { label: 'Loja', value: lastImportSummary.tenant },
                            { label: 'Cardápio', value: lastImportSummary.cardapio },
                            { label: 'Categorias', value: lastImportSummary.categories },
                            { label: 'Menus', value: lastImportSummary.menus },
                            { label: 'Páginas', value: lastImportSummary.paginas },
                            { label: 'Cálculos', value: lastImportSummary.calculations },
                            { label: 'Usuários', value: lastImportSummary.users },
                            { label: 'Logs WA', value: lastImportSummary.whatsappLogs },
                        ].map(({ label, value }) => (
                            <div key={label} className="text-center p-2 rounded bg-green-100 dark:bg-green-900/30">
                                <div className="text-lg font-bold text-green-700 dark:text-green-300">{value}</div>
                                <div className="text-xs text-green-600 dark:text-green-400">{label}</div>
                            </div>
                        ))}
                    </div>
                    {lastImportSummary.note && (
                        <p className="text-xs text-green-600 dark:text-green-400 italic">
                            ℹ️ {lastImportSummary.note}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
