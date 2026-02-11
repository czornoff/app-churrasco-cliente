'use client'

import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function CloudinaryUpload({ name, defaultValue }: { name: string; defaultValue?: string }) {
    const [url, setUrl] = useState(defaultValue || "");

    return (
        <div className="space-y-4">
        {/* Input oculto para sua Server Action capturar a URL */}
        <input type="hidden" name={name} value={url} />

        {url ? (
            <div className="relative w-40 h-40 border-2 border-orange-100 rounded-lg overflow-hidden group">
                <Image 
                    src={url} 
                    alt="Logo Preview" 
                    fill 
                    className="object-contain p-2" 
                />
                <button
                    type="button"
                    onClick={() => setUrl("")}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                    <X size={14} />
                </button>
            </div>
        ) : (
            <CldUploadWidget 
                uploadPreset="calcula-churrasco"
                onSuccess={(result: CloudinaryUploadWidgetResults) => {
                    if (result.info && typeof result.info !== 'string') {
                        setUrl(result.info.secure_url);
                    }
                }}
                options={{
                    maxFiles: 1,
                    clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
                    theme: "minimal",
                    language: "pt", // Define o idioma base como português
                    text: {
                        pt: {
                            or: "ou",
                            back: "Voltar",
                            close: "Fechar",
                            menu: {
                                files: "Meus Arquivos",
                                web: "Endereço Web",
                                camera: "Câmera",
                                gdrive: "Google Drive"
                            },
                            local: {
                                browse: "Procurar",
                                dd_title_single: "Arraste sua logo aqui para enviar",
                                dd_title_multi: "Arraste as imagens aqui",
                                drop_title_single: "Solte o arquivo para enviar"
                            },
                            camera: {
                                capture: "Tirar Foto",
                                cancel: "Cancelar",
                                take_photo: "Tirar Foto",
                                explanation: "Certifique-se de que sua câmera está conectada e que você deu permissão de acesso."
                            },
                            queue: {
                                title: "Fila de Upload",
                                title_uploading_with_counter: "Enviando {{count}} arquivo(s)",
                                done: "Concluído",
                                upload_more: "Enviar mais"
                            }
                        }
                    }
                }}
            >
            {({ open }) => (
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => open()}
                    className="border-dashed border-2 h-24 w-40 flex flex-col gap-2 hover:border-orange-500 hover:bg-orange-50"
                >
                    <ImagePlus className="text-slate-400" />
                    <span className="text-xs text-slate-500">Subir Logo</span>
                </Button>
            )}
            </CldUploadWidget>
        )}
        </div>
    );
}