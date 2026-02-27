import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import { sendEmail, buildPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email: email.toLowerCase() });

        // Sempre retornar sucesso para não revelar se o e-mail existe
        if (!user) {
            return NextResponse.json({ message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.' });
        }

        // Gerar token seguro
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await User.findByIdAndUpdate(user._id, {
            resetPasswordToken: token,
            resetPasswordExpires: expires,
        });

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        await sendEmail({
            to: user.email,
            subject: 'Redefinir sua senha — MandeBem',
            html: buildPasswordResetEmail(user.nome || 'Usuário', resetUrl),
        });

        return NextResponse.json({ message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.' });
    } catch (error) {
        console.error('forgot-password error:', error);
        return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 });
    }
}
