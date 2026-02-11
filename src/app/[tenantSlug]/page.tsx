import connectDB from '@/lib/mongodb';
import { Tenant } from '@/models/Schemas';
import Image from "next/image";
// import CalculatorWrapper from '@/components/CalculatorWrapper';

function formatWhatsAppLink(url: string) {
  // 1. Remove o prefixo da URL se existir para isolar os números
  // 2. Remove tudo que não for número (\D)
  const numbers = url.replace("https://wa.me/", "").replace(/\D/g, "");
  
  // 3. Se o número não começar com 55, adicionamos
  const formatted = numbers.startsWith("55") ? numbers : `55${numbers}`;
  
  return `https://wa.me/+${formatted}`;
}

export default async function TenantPublicPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
    const { tenantSlug } = await params;
    await connectDB();
    const tenant = await Tenant.findOne({ slug: tenantSlug }).lean();

    if ( !tenant || tenant.active === false ) return <div>Cliente não encontrado</div>;

    const whatsappLimpo = tenant.whatsApp ? formatWhatsAppLink(tenant.whatsApp) : "#";

    return (
        <main className="min-h-screen" style={{ borderTop: `8px solid ${tenant.colorPrimary}` }}>
        <header className="p-10 text-center">
            <div className="relative mx-auto w-32 h-32 mb-4">
                <Image 
                    src={tenant.logoUrl || "/placeholder-logo.png"} // Fallback caso a URL seja nula
                    alt={`Logo de ${tenant.name}`}
                    fill
                    className="object-contain" // Mantém a proporção sem cortar a imagem
                    sizes="128px" // Ajuda o Next.js a otimizar o tamanho do arquivo
                    priority // Carrega a logo mais rápido por ser um elemento de destaque
                />
            </div>
            <h1 className="text-3xl font-bold">{tenant.nomeApp}</h1>
            <p className="text-slate-500">{tenant.slogan}</p>
        </header>
        <div className="bg-white border-b py-12 px-4 shadow-sm">
            <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter md:text-6xl">
                {tenant.name}
            </h1>
            <p className="mt-4 text-slate-500 text-lg md:text-xl">
                Calculadora de Churrasco Profissional
            </p>
            </div>
        </div>

        <div className="max-w-4xl mx-auto py-12 px-4">
            {/* Passamos os produtos para a calculadora interativa */}
            {/* <CalculatorWrapper products={serializedProducts} /> */}
        </div>

        <footer className="py-8 text-center text-slate-400 text-sm">
            Potencializado por <span className="font-bold text-orange-600">MandeBem Churrasco</span>
        </footer>

        {/* Botão de WhatsApp flutuante dinâmico */}
        <a 
            href={whatsappLimpo}
            target="_blank"
            className="bg-green-900 fixed bottom-5 right-5 p-4 rounded-full text-white shadow-lg"
            style={{ backgroundColor: tenant.colorPrimary }}
        >
            Falar com a Loja
        </a>
        </main>
    );
}