'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, Plus, FileText, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

interface IPage {
    _id: string;
    titulo: string;
    tipo: 'texto' | 'cards';
    slug: string;
    ativo: boolean;
}

export default function PagesListPage() {
    const [pages, setPages] = useState<IPage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await fetch('/api/admin/pages');
            if (!res.ok) throw new Error('Failed to fetch pages');
            const data = await res.json();
            setPages(data);
        } catch (error) {
            toast.error('Erro ao carregar páginas');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta página?')) return;

        try {
            const res = await fetch(`/api/admin/pages?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Página excluída com sucesso');
            fetchPages();
        } catch (error) {
            toast.error('Erro ao excluir página');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Gerenciar Páginas</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Crie páginas personalizadas com texto ou cards.
                    </p>
                </div>
                <Link href="/admin/pages/novo">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Página
                    </Button>
                </Link>
            </div>

            <Card className="border-neutral-200 dark:border-zinc-800">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Carregando...</div>
                    ) : pages.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                <FileText className="text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Nenhuma página criada</h3>
                                <p className="text-slate-500 text-sm mt-1">Crie páginas para informar seus clientes sobre promoções ou novidades.</p>
                            </div>
                            <Link href="/admin/pages/novo">
                                <Button variant="outline" className="mt-2">Nova Página</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-200 dark:divide-zinc-800">
                            {pages.map((page) => (
                                <div key={page._id} className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-900 dark:text-slate-100">{page.titulo}</span>
                                            {!page.ativo && (
                                                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase">Inativo</span>
                                            )}
                                            <span className="text-[10px] bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-400 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                                                {page.tipo === 'texto' ? <FileText size={10} /> : <LayoutGrid size={10} />}
                                                {page.tipo}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                                            /{page.slug}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/admin/pages/${page._id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-orange-600">
                                                <Pencil size={16} />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                                            onClick={() => handleDelete(page._id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
