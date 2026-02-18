export interface ICardapio {
    _id?: string;
    nome: string;
    preco: number;
    imageUrl?: string;
    gramasPorAdulto?: number;
    mlPorAdulto?: number;
    mlEmbalagem?: number;
    gramasEmbalagem?: number;
    ativo: boolean;
    clienteId: string;
    createdAt?: Date;
    updatedAt?: Date;
}
