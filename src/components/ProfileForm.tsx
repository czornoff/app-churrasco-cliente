'use client'

import { updateProfileAction } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IUser} from "@/interfaces/user";

export function ProfileForm({ initialData }: { initialData: IUser }) {
    return (
        <form action={async (formData) => {
            await updateProfileAction(formData);
            alert("Perfil atualizado com sucesso!");
        }} className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow-sm">
            
            <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input name="nome" defaultValue={initialData?.nome} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input name="whatsApp" placeholder="(11) 99999-9999" defaultValue={initialData?.whatsApp} />
                </div>
                <div className="space-y-2">
                    <Label>Gênero</Label>
                    <select name="genero" className="w-full h-10 border rounded-md px-3 text-sm" defaultValue={initialData?.genero}>
                        <option value="undefined">Prefiro não dizer</option>
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                        <option value="outros">Outros</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 space-y-2">
                    <Label>UF</Label>
                    <Input name="UF" maxLength={2} defaultValue={initialData?.UF} />
                </div>
                <div className="col-span-3 space-y-2">
                    <Label>Cidade</Label>
                    <Input name="cidade" defaultValue={initialData?.cidade} />
                </div>
            </div>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                Salvar Alterações
            </Button>
        </form>
    );
}