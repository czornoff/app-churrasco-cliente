import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

export default withAuth(
    function middleware(request: NextRequest) {
        const { pathname } = request.nextUrl;

        // 1. Ignorar arquivos públicos e Next.js interno
        if (
            pathname.startsWith('/_next') ||
            pathname.startsWith('/api') ||
            pathname.startsWith('/static') ||
            PUBLIC_FILE.test(pathname)
        ) {
            return NextResponse.next();
        }

        // 2. Lógica do seu Proxy (Tenant Slug)
        const segments = pathname.split('/').filter(Boolean);
        const tenantSlug = segments[0];

        const reservedPaths = ['admin', 'login', 'register', 'dashboard', 'api'];
        
        // Se não tem slug ou se o primeiro segmento é uma rota reservada, segue o fluxo normal
        if (!tenantSlug || reservedPaths.includes(tenantSlug)) {
            return NextResponse.next();
        }

        // Se chegou aqui, é um Slug de Cliente (Ex: /minha-loja)
        // Você pode adicionar lógicas de rewrite aqui se necessário
        return NextResponse.next();
    },
    {
        callbacks: {
        // O middleware do NextAuth só vai agir se o matcher (lá embaixo) bater 
        // e o retorno aqui for true.
        authorized: ({ token, req }) => {
            const { pathname } = req.nextUrl;
            
            // Bloqueia qualquer rota que comece com /admin (exceto se for exatamente a raiz do admin ou login)
            // Isso protege /admin/users, /admin/tenants, /admin/perfil automaticamente
            if (pathname.startsWith("/admin") && pathname !== "/admin") {
                return !!token;
            }
            
            return true;
        },
        },
    }
);

export const config = {
  // Esse matcher intercepta TUDO, exceto o que você excluir explicitamente
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};