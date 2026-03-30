import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ClienteMenu } from "@/models/ClienteMenu";
import type { Session } from "next-auth";

// Helper check permissions
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
        return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    await connectDB();
    const menus = await ClienteMenu.find({ tenantId: targetTenantId }).sort({ ordem: 1, createdAt: 1 });
    return NextResponse.json(menus);
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

    const menu = await ClienteMenu.create({
        ...body,
        tenantId: targetTenantId
    });

    return NextResponse.json(menu);
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

    const menu = await ClienteMenu.findOneAndUpdate(
        { _id, tenantId: targetTenantId },
        body,
        { new: true }
    );

    if (!menu) {
        return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu);
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, tenantId } = await req.json();
    const targetTenantId = getTargetTenantId(session, tenantId);

    if (!targetTenantId) {
        return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    if (!Array.isArray(items)) {
        return NextResponse.json({ error: "Items array required" }, { status: 400 });
    }

    await connectDB();

    const updatePromises = items.map(item => 
        ClienteMenu.findOneAndUpdate(
            { _id: item._id, tenantId: targetTenantId },
            { ordem: item.ordem },
            { new: true }
        )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ message: "Orders updated successfully" });
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
    const menu = await ClienteMenu.findOneAndDelete({ _id: id, tenantId: targetTenantId });

    if (!menu) {
        return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
}
