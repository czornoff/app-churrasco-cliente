import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token e nova senha são obrigatórios.' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return NextResponse.json({ error: 'Token inválido ou expirado. Solicite um novo link de recuperação.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            $unset: { resetPasswordToken: '', resetPasswordExpires: '' },
        });

        return NextResponse.json({ message: 'Senha redefinida com sucesso! Você já pode fazer login.' });
    } catch (error) {
        console.error('reset-password error:', error);
        return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 });
    }
}
