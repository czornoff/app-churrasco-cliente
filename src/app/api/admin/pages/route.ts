import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ClientePagina } from "@/models/ClientePagina";
import type { Session } from "next-auth";
import type { IPagina } from "@/models/ClientePagina";



// Helper check permissions (Duplicated logic, ideally should be a lib function but keeping inline for simplicity)
const getTargetTenantId = (session: Session | null, requestedTenantId?: string | null) => {
    if (!session?.user) return null;
    if (requestedTenantId && (session.user.role === 'ADMIN' || session.user.role === 'SUPERADMIN')) {
        return requestedTenantId;
    }
    return session.user.tenantId;
};

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get("tenantId");
    const targetTenantId = getTargetTenantId(session, tenantIdParam);

    if (!targetTenantId) {
        return NextResponse.json([], { status: 200 }); // Return empty if no tenant ID
    }

    await connectDB();
    const clientePagina = await ClientePagina.findOne({ clienteId: targetTenantId });
    return NextResponse.json(clientePagina?.paginas || []);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const targetTenantId = getTargetTenantId(session, body.tenantId);

    if (!targetTenantId) {
        return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    await connectDB();

    let clientePagina = await ClientePagina.findOne({ clienteId: targetTenantId });

    // Remove tenantId from the page object itself to avoid cluttering subdoc
    const { tenantId, ...pageData } = body;

    if (!clientePagina) {
        clientePagina = await ClientePagina.create({
            clienteId: targetTenantId,
            paginas: [pageData]
        });
    } else {
        clientePagina.paginas.push(pageData);
        await clientePagina.save();
    }

    // Return the last added page (which is the new one)
    const newPage = clientePagina.paginas[clientePagina.paginas.length - 1];
    return NextResponse.json(newPage);
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { _id, tenantId, ...body } = await req.json();
    const targetTenantId = getTargetTenantId(session, tenantId);

    if (!targetTenantId) {
        return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    await connectDB();

    const clientePagina = await ClientePagina.findOneAndUpdate(
        { clienteId: targetTenantId, "paginas._id": _id },
        {
            $set: {
                "paginas.$": { ...body, _id }
            }
        },
        { new: true }
    );

    if (!clientePagina) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const updatedPage = clientePagina.paginas.find((p: IPagina) => p._id.toString() === _id);
    return NextResponse.json(updatedPage);
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const tenantIdParam = searchParams.get("tenantId");

    const targetTenantId = getTargetTenantId(session, tenantIdParam);

    if (!targetTenantId) {
        return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    await connectDB();
    const clientePagina = await ClientePagina.findOneAndUpdate(
        { clienteId: targetTenantId },
        {
            $pull: { paginas: { _id: id } }
        },
        { new: true }
    );

    if (!clientePagina) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
}
