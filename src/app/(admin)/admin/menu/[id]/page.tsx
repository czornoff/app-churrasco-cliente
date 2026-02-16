import { MenuForm } from "@/components/admin/MenuForm";
import connectDB from "@/lib/mongodb";
import { ClienteMenu } from "@/models/ClienteMenu";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
        redirect('/admin');
    }

    await connectDB();
    const menu = await ClienteMenu.findOne({ _id: id, clienteId: session.user.tenantId }).lean();

    if (!menu) {
        redirect('/admin/menu');
    }

    // Convert _id and dates to string/number to pass to client component
    const serializedMenu = {
        ...menu,
        _id: menu._id.toString(),
        createdAt: menu.createdAt?.toString(),
        updatedAt: menu.updatedAt?.toString(),
        clienteId: menu.clienteId.toString()
    };

    return <MenuForm initialData={serializedMenu} isEditing={true} />;
}
