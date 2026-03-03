'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calculator, Calendar, Users, Flame, Info, Mail, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { sendCalculationEmailAction } from "@/lib/actions/email";

interface CalculationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    calculation: any;
}

export function CalculationDetailModal({ isOpen, onClose, calculation }: CalculationDetailModalProps) {
    const [emailDestino, setEmailDestino] = useState('');
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    if (!calculation) return null;

    const totalPessoas = calculation.totalPeople.men + calculation.totalPeople.women + calculation.totalPeople.children;

    const handleShareWhatsApp = () => {
        let text = `*🔥 Detalhes do Churrasco*\n`;
        text += `Data: ${new Date(calculation.createdAt).toLocaleDateString('pt-BR')}\n\n`;
        text += `*👥 Convidados:*\n`;
        text += `Homens: ${calculation.totalPeople.men}\n`;
        text += `Mulheres: ${calculation.totalPeople.women}\n`;
        text += `Crianças: ${calculation.totalPeople.children}\n`;
        text += `*Total:* ${totalPessoas} pessoas\n\n`;

        text += `*🥩 Lista de Compras:*\n`;
        calculation.items.forEach((item: any) => {
            text += `- ${item.nome}: ${item.quantidadeEmbalagem} emb.`;
            if (item.tamanhoEmbalagem > 0) {
                text += ` (${item.tamanhoEmbalagem}${item.unidade})`;
            }
            text += ` - R$ ${item.totalPreco.toFixed(2)}\n`;
        });

        text += `\n*💰 Estimativa de Custo:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculation.totalPrice)}`;

        const encodedText = encodeURIComponent(text);
        window.open(`https://api.whatsapp.com/send/?text=${encodedText}`, '_blank');
    };

    const handleSendEmail = async () => {
        if (!emailDestino) {
            toast.error('Informe um e-mail para receber o detalhamento');
            return;
        }

        setIsSendingEmail(true);
        try {
            const res = await sendCalculationEmailAction({
                calculationId: calculation._id.toString(),
                tenantId: calculation.tenantId.toString(),
                userEmail: emailDestino,
            });

            if (res.success) {
                toast.success('Detalhamento enviado com sucesso!');
                setEmailDestino('');
            } else {
                toast.error(res.error || 'Falha ao enviar e-mail');
            }
        } catch (error) {
            toast.error('Erro ao enviar e-mail');
        } finally {
            setIsSendingEmail(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border-none shadow-2xl bg-zinc-50 dark:bg-zinc-950 p-0">
                <div className="bg-orange-600 p-8 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold flex items-start gap-3">
                            <Flame size={36} />
                            <div className="flex flex-col">
                                Detalhes do Churrasco
                                <p className="mt-0 text-orange-100 text-sm font-normal opacity-90">
                                    {new Date(calculation.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-8">
                    {/* Resumo de Pessoas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg space-y-6 bg-white dark:bg-zinc-800 p-4">
                            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Total</p>
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-orange-600" />
                                <span className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{totalPessoas}</span>
                            </div>
                        </div>
                        <div className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg space-y-6 bg-white dark:bg-zinc-800 p-4">
                            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Homens</p>
                            <span className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{calculation.totalPeople.men}</span>
                        </div>
                        <div className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg space-y-6 bg-white dark:bg-zinc-800 p-4">
                            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Mulheres</p>
                            <span className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{calculation.totalPeople.women}</span>
                        </div>
                        <div className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg space-y-6 bg-white dark:bg-zinc-800 p-4">
                            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Crianças</p>
                            <span className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{calculation.totalPeople.children}</span>
                        </div>
                    </div>

                    {/* Itens Calculados */}
                    <div>
                        <h3 className="text-sm font-black text-zinc-500 mb-4 flex items-center gap-2">
                            <Calculator size={16} />
                            Quantidades Sugeridas
                        </h3>
                        <div className="space-y-2">
                            {calculation.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between px-2 py-1 border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg space-y-6 bg-white dark:bg-zinc-800">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.nome}</span>
                                        <span className="text-[10px] uppercase font-bold text-zinc-400">{item.categoria}</span>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-lg font-black text-orange-600">
                                            {item.quantidade} <span className="text-xs uppercase text-zinc-400">
                                                {item.unidade || (item.categoria === 'bebidas' ? 'ml' : (item.categoria === 'suprimentos' ? '' : 'g'))}
                                            </span>
                                        </span>
                                        {item.quantidadeEmbalagem > 0 && (
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">
                                                {item.quantidadeEmbalagem} emb.
                                                {item.tamanhoEmbalagem > 0 && ` (${item.tamanhoEmbalagem}${item.unidade || (item.categoria === 'bebidas' ? 'ml' : 'g')})`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator className="bg-zinc-200 dark:bg-zinc-800" />

                    {/* Total e Info */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg text-orange-800 dark:text-orange-400">
                            <Info size={20} />
                            <p className="text-xs font-bold leading-tight">
                                Valores baseados nas <br /> médias de consumo.
                            </p>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-[10px] font-black text-zinc-400 mb-1">Estimativa de Custo</p>
                            <p className="text-4xl font-black text-zinc-900 dark:text-white">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculation.totalPrice)}
                            </p>
                        </div>
                    </div>

                    {/* Compartilhar */}
                    <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                        <h4 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm flex items-center gap-2">
                            <Mail size={16} className="text-orange-600" />
                            Compartilhar Cálculo
                        </h4>

                        <div className="space-y-4">
                            <Button
                                onClick={handleShareWhatsApp}
                                variant="outline"
                                className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                            >
                                <MessageCircle size={16} className="mr-2" />
                                Compartilhar via WhatsApp
                            </Button>

                            <div className="flex gap-3">
                                <Input
                                    type="email"
                                    placeholder="Ou envie para um e-mail"
                                    value={emailDestino}
                                    onChange={(e) => setEmailDestino(e.target.value)}
                                    className="flex-1 bg-white dark:bg-zinc-800"
                                    disabled={isSendingEmail}
                                />
                                <Button
                                    onClick={handleSendEmail}
                                    disabled={isSendingEmail || !emailDestino}
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                    {isSendingEmail ? 'Enviando...' : 'Reenviar E-mail'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
