import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
    const session = await getServerSession(authOptions);
    
    // Se está logado, redirecionar para admin ou para públicos
    if (session?.user) {
        if (session.user.role === 'SUPERADMIN' || session.user.role === 'TENANT_OWNER') {
            redirect('/admin');
        }
        // END_USER é redirecionado apenas por páginas específicas, não aqui
    }
    
    // Não logado - ir para login
    redirect("/login");
}
