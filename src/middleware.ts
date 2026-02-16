import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

// Para usar o token no middleware do NextAuth com o wrapper withAuth
export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const token = req.nextauth.token;
        const { pathname } = req.nextUrl;

        // 1. Ignorar arquivos públicos e Next.js interno
        if (
            pathname.startsWith('/_next') ||
            pathname.startsWith('/api') ||
            pathname.startsWith('/static') ||
            PUBLIC_FILE.test(pathname)
        ) {
            return NextResponse.next();
        }

        // 2. Redirecionar usuário logado para fora do /login
        if (pathname === "/login" && token) {
            return NextResponse.redirect(new URL("/admin", req.url));
        }

        // 3. Lógica do seu Proxy (Tenant Slug) - Opcional se não houver conflito
        const segments = pathname.split('/').filter(Boolean);
        const tenantSlug = segments[0];
        const reservedPaths = ['admin', 'login', 'register', 'dashboard', 'api'];

        if (!tenantSlug || reservedPaths.includes(tenantSlug)) {
            return NextResponse.next();
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Rotas públicas (não precisam de token)
                const publicPaths = ["/login", "/register", "/"];
                if (publicPaths.includes(pathname)) return true;

                // Protege administradores
                if (pathname.startsWith("/admin")) {
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