import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ClientePagina } from "@/models/ClientePagina";
import { Tenant } from "@/models/Schemas";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const tenantSlug = searchParams.get("tenantSlug");
    const pageSlug = searchParams.get("pageSlug");

    if (!tenantSlug || !pageSlug) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    await connectDB();

    const tenant = await Tenant.findOne({ slug: tenantSlug, active: true }).select("_id");
    if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const clientePagina = await ClientePagina.findOne({
        clienteId: tenant._id,
        "paginas.slug": pageSlug,
        "paginas.ativo": true
    });

    if (!clientePagina) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const page = clientePagina.paginas.find((p: any) => p.slug === pageSlug && p.ativo);

    if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
}
