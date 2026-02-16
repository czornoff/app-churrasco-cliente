import { PageForm } from "@/components/admin/PageForm";
import connectDB from "@/lib/mongodb";
import { ClientePagina } from "@/models/ClientePagina";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
        redirect('/admin');
    }

    await connectDB();

    // Find schema that contains this page id
    const clientePagina = await ClientePagina.findOne({
        clienteId: session.user.tenantId,
        "paginas._id": id
    }).lean();

    if (!clientePagina) {
        redirect('/admin/pages');
    }

    // Extract the specific page from the array
    const page = clientePagina.paginas.find((p: any) => p._id.toString() === id);

    if (!page) {
        redirect('/admin/pages');
    }

    // Serialize
    const serializedPage = {
        ...page,
        _id: page._id.toString(),
        // @ts-ignore
        cards: page.cards?.map((c: any) => ({ ...c, _id: c._id?.toString() })) || []
    };

    return <PageForm initialData={serializedPage} isEditing={true} />;
}
