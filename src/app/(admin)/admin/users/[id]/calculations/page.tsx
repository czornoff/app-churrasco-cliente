import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { getCalculationsByUserIdAction } from "@/lib/actions/calculation";
import { History, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClientAdminUserCalculations } from "./ClientAdminUserCalculations";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function UserCalculationsAdminPage({ params }: PageProps) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPERADMIN') {
        redirect("/admin");
    }

    await connectDB();
    const user = await User.findById(id).lean();
    if (!user) return <div className="p-8 text-center font-bold text-zinc-500 uppercase tracking-widest">Usuário não encontrado</div>;

    const calculations = await getCalculationsByUserIdAction(id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History className="h-8 w-8 text-orange-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                            Histórico de {user.nome}
                        </h1>
                        <p className="text-zinc-500 text-sm font-medium">
                            Visualização administrativa de todos os churrascos calculados.
                        </p>
                    </div>
                </div>
                <Link href="/admin/users">
                    <Button variant="outline" size="icon" className="rounded-lg">
                        <ChevronLeft size={20} />
                    </Button>
                </Link>
            </div>

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
                    <ClientAdminUserCalculations calculations={JSON.parse(JSON.stringify(calculations))} />
                </div>
            </div>
        </div>
    );
}
