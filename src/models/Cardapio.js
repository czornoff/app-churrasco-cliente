import mongoose, { Schema } from 'mongoose';

// Schema para Itens Individuais (Carne, Bebida, etc)
const ItemSchema = new Schema(
    {
        ativo: { type: Boolean, default: true },
        nome: { type: String, required: true, trim: true },
        descricao: { type: String },
        imageUrl: { type: String },
        subcategoria: { type: String },
        
        // Transformamos Preço em Number para cálculos
        preco: { type: Number, default: 0 },
        
        // Campos de cálculo (usamos Number para podermos multiplicar no código)
        gramasPorAdulto: { type: Number, default: 0 },  // Para carnes/acompanhamentos
        gramasEmbalagem: { type: Number, default: 0 },  // Para carnes/acompanhamentos
        mlPorAdulto: { type: Number, default: 0 },      // Para bebidas
        mlEmbalagem: { type: Number, default: 0 },      // Para bebidas
        qtdePorAdulto: { type: Number, default: 0 },    // Para adicionais
        pesoRelativo: { type: Number, default: 0 },     // Se for usado em %
        
        // Para Utensílios
        base: { type: Number, default: 1 },
        fator: { type: Number, default: 1 },
        unidade: { type: String },

        // Imagem do Cloudinary que configuramos
        imageUrl: { type: String }
    },
    { timestamps: true }
);

const CardapioSchema = new Schema(
    {
        tenantId: { // Mudando de clienteId para tenantId para manter o padrão que usamos
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true
        },
        configuracoes: {
            gramasCarneAdulto: { type: Number, default: 400 },
            gramasOutrosAdulto: { type: Number, default: 200 },
            mlBebidaAdulto: { type: Number, default: 1200 }
        },
        // Categorias como arrays de Itens
        carnes: [ItemSchema],
        bebidas: [ItemSchema],
        acompanhamentos: [ItemSchema],
        adicionais: [ItemSchema],
        utensilios: [ItemSchema],
        sobremesas: [ItemSchema],
        
        // Flags de ativação por categoria
        categoriasAtivas: {
            carnes: { type: Boolean, default: true },
            bebidas: { type: Boolean, default: true },
            acompanhamentos: { type: Boolean, default: true },
            adicionais: { type: Boolean, default: true },
            utensilios: { type: Boolean, default: true },
            sobremesas: { type: Boolean, default: true }
        }
    },
    { timestamps: true }
);

export const Cardapio = mongoose.models.Cardapio || mongoose.model('Cardapio', CardapioSchema);