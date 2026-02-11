export interface IUser {
    _id: string;
    nome: string;
    email: string;
    password: string;
    googleId: string;
    role: 'SUPERADMIN' | 'TENANT_OWNER' | 'END_USER';
    status: 'active' | 'inactive' | 'banned';
    avatar?: string;
    whatsApp?: string;
    UF?: string;
    cidade?: string;
    genero: 'masculino' | 'feminino' | 'outros' | 'undefined';
    birthday?: string | Date;
    tenantId?: string;
    save(): Promise<void>;
}