export interface IClienteMenu {
    _id?: string;
    nome: string;
    url: string;
    idPai: number;
    ativo: boolean;
    clienteId: string;
    createdAt?: Date;
    updatedAt?: Date;
}
