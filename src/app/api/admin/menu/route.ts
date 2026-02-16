import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ClienteMenu } from "@/models/ClienteMenu";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const menus = await ClienteMenu.find({ clienteId: session.user.tenantId }).sort({ createdAt: 1 });
    return NextResponse.json(menus);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    const menu = await ClienteMenu.create({
        ...body,
        clienteId: session.user.tenantId
    });

    return NextResponse.json(menu);
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { _id, ...body } = await req.json();
    await connectDB();

    const menu = await ClienteMenu.findOneAndUpdate(
        { _id, clienteId: session.user.tenantId },
        body,
        { new: true }
    );

    if (!menu) {
        return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu);
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await connectDB();
    const menu = await ClienteMenu.findOneAndDelete({ _id: id, clienteId: session.user.tenantId });

    if (!menu) {
        return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
}
