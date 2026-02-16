import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ClienteMenu } from "@/models/ClienteMenu";
import { Tenant } from "@/models/Schemas";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const tenantSlug = searchParams.get("slug");
    const tenantId = searchParams.get("tenantId");

    await connectDB();

    let id = tenantId;

    if (!id && tenantSlug) {
        const tenant = await Tenant.findOne({ slug: tenantSlug, active: true }).select("_id");
        if (tenant) id = tenant._id;
    }

    if (!id) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const menus = await ClienteMenu.find({ clienteId: id, ativo: true }).sort({ createdAt: 1 });
    return NextResponse.json(menus);
}
