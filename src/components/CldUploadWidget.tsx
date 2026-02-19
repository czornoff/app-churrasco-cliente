'use client'

import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Camera } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function CloudinaryUpload({
    name,
    defaultValue,
    isAvatar = false,
    fallbackUrl
}: {
    name: string;
    defaultValue?: string;
    isAvatar?: boolean;
    fallbackUrl?: string;
}) {
    const isCustomUrl = (val?: string) => val && !val.includes('ui-avatars.com') && !val.includes('mandebem.com') && !val.includes('placeholder');

    // Se o valor inicial for um fallback (UI-Avatar ou placeholder antigo), tratamos como vazio
    // para que o componente use o fallbackUrl dinâmico (que muda com o nome).
    const filteredDefaultValue = isCustomUrl(defaultValue) ? defaultValue : "";
    const [url, setUrl] = useState(filteredDefaultValue || "");

    const getTransformedUrl = (originalUrl: string) => {
        if (!originalUrl.includes("res.cloudinary.com")) return originalUrl;
        // Estratégia de transformação em cadeia:
        // 1. c_crop,g_custom: Aplica o recorte exato feito pelo usuário no widget
        // 2. c_fill,ar_1:1,w_500: Garante que o resultado seja 500x500 preenchendo o espaço
        return originalUrl.replace("/upload/", "/upload/c_crop,g_custom/c_fill,ar_1:1,w_500/");
    };

    const displayUrl = url || fallbackUrl;

    return (
        <div className="space-y-4">
            {/* Input oculto para sua Server Action capturar a URL. 
                Se for "", a action do servidor vai gerar o fallback final com o nome atual. */}
            <input type="hidden" name={name} value={url} />

            <div className="flex items-center gap-4">
                {displayUrl ? (
                    <div className="relative group">
                        {/* Container da Imagem com overflow hidden para manter o formato redondo/quadrado */}
                        <div className={`relative shrink-0 ${isAvatar ? 'w-24 h-24 rounded-full min-w-24 min-h-24' : 'w-40 h-40 rounded-lg min-w-40 min-h-40'} border-2 border-orange-100 overflow-hidden bg-white shadow-sm flex items-center justify-center`}>
                            <Image
                                unoptimized
                                src={displayUrl.trim()}
                                alt={isAvatar ? "Avatar Preview" : "Logo Preview"}
                                width={isAvatar ? 96 : 160}
                                height={isAvatar ? 96 : 160}
                                className={`${isAvatar ? 'object-cover w-full h-full' : 'object-contain p-2'}`}
                            />

                            {/* Overlay de Câmera para troca de imagem */}
                            <CldUploadWidget
                                uploadPreset="calcula-churrasco"
                                onSuccess={(result: CloudinaryUploadWidgetResults) => {
                                    if (result.info && typeof result.info !== 'string') {
                                        setUrl(getTransformedUrl(result.info.secure_url));
                                    }
                                }}
                                options={{
                                    maxFiles: 1,
                                    multiple: false,
                                    clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
                                    theme: "minimal",
                                    language: "pt",
                                    styles: {
                                        zIndex: 100000
                                    },
                                    cropping: true,
                                    croppingAspectRatio: 1,
                                    showSkipCropButton: false
                                }}
                            >
                                {({ open }) => (
                                    <button
                                        type="button"
                                        onClick={() => open()}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white z-10"
                                    >
                                        <Camera size={20} />
                                    </button>
                                )}
                            </CldUploadWidget>
                        </div>

                        {/* O botão de remover (X) agora fora do container clipped para não ser cortado */}
                        {isCustomUrl(url) && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setUrl("");
                                }}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-20 hover:bg-red-600 border-2 border-white flex items-center justify-center"
                                title="Remover imagem e usar padrão"
                            >
                                <X size={10} />
                            </button>
                        )}
                    </div>
                ) : (
                    <CldUploadWidget
                        uploadPreset="calcula-churrasco"
                        onSuccess={(result: CloudinaryUploadWidgetResults) => {
                            if (result.info && typeof result.info !== 'string') {
                                setUrl(getTransformedUrl(result.info.secure_url));
                            }
                        }}
                        options={{
                            maxFiles: 1,
                            multiple: false,
                            clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
                            theme: "minimal",
                            language: "pt",
                            styles: {
                                zIndex: 100000
                            },
                            cropping: true,
                            croppingAspectRatio: 1,
                            showSkipCropButton: false,
                            text: {
                                pt: {
                                    or: "ou",
                                    back: "Voltar",
                                    close: "Fechar",
                                    menu: { files: "Meus Arquivos", web: "Endereço Web", camera: "Câmera", gdrive: "Google Drive" },
                                    local: { browse: "Procurar", dd_title_single: `Arraste sua ${isAvatar ? "foto" : "logo"} aqui`, dd_title_multi: "Arraste as imagens aqui", drop_title_single: "Solte o arquivo para enviar" },
                                }
                            }
                        }}
                    >
                        {({ open }) => (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => open()}
                                className={`border-dashed border-2 ${isAvatar ? 'h-24 w-24 rounded-full' : 'h-24 w-40'} flex flex-col gap-2 hover:border-orange-500 hover:bg-orange-50 text-center`}
                            >
                                <ImagePlus className="text-zinc-400" />
                                <span className="text-[10px] text-zinc-500 leading-tight">{isAvatar ? "Subir Foto" : "Subir Logo"}</span>
                            </Button>
                        )}
                    </CldUploadWidget>
                )}

                {isAvatar && !url && fallbackUrl && (
                    <p className="text-[10px] text-zinc-600 dark:text-zinc-400 italic max-w-37.5">
                        Mostrando avatar gerado. Clique no círculo para enviar uma foto personalizada.
                    </p>
                )}
            </div>
        </div>
    );
}