import connectDB from "../lib/mongodb";
import { Tenant } from "../models/Schemas";

async function seed() {
    console.log("Iniciando seed de parâmetros de cálculo...");
    await connectDB();

    const result = await Tenant.updateMany(
        { grCarnePessoa: { $exists: false } },
        {
            $set: {
                grCarnePessoa: 400,
                grAcompanhamentoPessoa: 250,
                mlBebidaPessoa: 1200,
                grSobremesaPessoa: 100
            }
        }
    );

    console.log(`${result.modifiedCount} estabelecimentos atualizados.`);
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
