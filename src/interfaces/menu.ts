export interface IClienteMenu {
    _id?: string;
    nome: string;
    url: string;
    idPai: number;
    ativo: boolean;
    tenantId: string;
    createdAt?: Date;
    updatedAt?: Date;
}
