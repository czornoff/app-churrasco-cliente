import { ReactNode } from "react";
import { Providers } from "@/components/Providers";

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
    // Este layout envolve TUDO que está dentro de (admin), 
    // incluindo a página de login e as páginas internas.
    return (
        <Providers>
            {children}
        </Providers>
    );
}