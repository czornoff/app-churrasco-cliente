export interface ITenant {
    _id: string; // No frontend, tratamos o ID do Mongo geralmente como string
    name: string;
    slug: string;
    nomeApp?: string;
    slogan?: string;
    email?: string;
    whatsApp?: string;
    instagram?: string;
    address?: string;
    logoUrl?: string;
    colorPrimary?: string;
    active: boolean;
    limiteConsulta: number;
    grCarnePessoa?: number;
    grAcompanhamentoPessoa?: number;
    mlBebidaPessoa?: number;
    grSobremesaPessoa?: number;
    versao?: string;
    createdAt?: string;
    updatedAt?: string;
}
