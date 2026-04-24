'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, DatabaseBackup } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GlobalBackupImport() {
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.mbkp')) {
            toast.error('Arquivo inválido. Selecione um arquivo .mbkp');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const confirmed = window.confirm(
            `⚠️ ATENÇÃO: Esta ação criará uma NOVA LOJA com os dados do backup.\nSe o slug (URL) da loja antiga ainda existir, será criado um novo slug numérico.\n\nTem certeza que deseja importar a loja do arquivo:\n"${file.name}"?`
        );
        if (!confirmed) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsImporting(true);

        try {
            const text = await file.text();

            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const res = await fetch(`${basePath}/api/admin/backup/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: text,
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Erro ao importar backup.');
                return;
            }

            toast.success('Loja importada com sucesso!', {
                description: data.restored?.note || 'A loja foi recriada e já está disponível.',
            });

            // Atualiza a página para exibir a nova loja
            router.refresh();
        } catch (error) {
            console.error('[GLOBAL_IMPORT_ERROR]', error);
            toast.error('Falha na importação. Verifique o arquivo e tente novamente.');
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex items-center">
            <input
                ref={fileInputRef}
                type="file"
                accept=".mbkp"
                className="hidden"
                onChange={handleFileChange}
                id="global-backup-import"
            />
            <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                variant="outline"
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-700"
            >
                {isImporting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importando Loja...
                    </>
                ) : (
                    <>
                        <DatabaseBackup className="w-4 h-4 mr-2 text-indigo-500" />
                        Importar Loja (Backup)
                    </>
                )}
            </Button>
        </div>
    );
}
