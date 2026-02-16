import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ClientePagina } from "@/models/ClientePagina";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const clientePagina = await ClientePagina.findOne({ clienteId: session.user.tenantId });
    return NextResponse.json(clientePagina?.paginas || []);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    let clientePagina = await ClientePagina.findOne({ clienteId: session.user.tenantId });

    if (!clientePagina) {
        clientePagina = await ClientePagina.create({
            clienteId: session.user.tenantId,
            paginas: [body]
        });
    } else {
        clientePagina.paginas.push(body);
        await clientePagina.save();
    }

    // Return the last added page (which is the new one)
    const newPage = clientePagina.paginas[clientePagina.paginas.length - 1];
    return NextResponse.json(newPage);
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { _id, ...body } = await req.json();
    await connectDB();

    const clientePagina = await ClientePagina.findOneAndUpdate(
        { clienteId: session.user.tenantId, "paginas._id": _id },
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

    const updatedPage = clientePagina.paginas.find((p: any) => p._id.toString() === _id);
    return NextResponse.json(updatedPage);
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await connectDB();
    const clientePagina = await ClientePagina.findOneAndUpdate(
        { clienteId: session.user.tenantId },
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
