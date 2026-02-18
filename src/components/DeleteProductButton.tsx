'use client'

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProductAction } from "@/lib/actions/product";

interface DeleteProps {
  tenantId: string;
  category: string;
  productId: string;
}

export function DeleteProductButton({ tenantId, category, productId }: DeleteProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm("Deseja excluir?")) return;

        startTransition(async () => {
            await deleteProductAction(tenantId, category, productId);
        });
    };

    return (
        <button 
            onClick={handleDelete}
            disabled={isPending}
            className={`p-2 text-slate-600 ${isPending ? 'opacity-50' : 'hover:text-red-600'}`}
        >
            {isPending ? "..." : <Trash2 size={18} />}
        </button>
    );
}