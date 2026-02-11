'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"

export function ColorPicker({ defaultValue, name }: { defaultValue: string, name: string }) {
    const [color, setColor] = useState(defaultValue || '#e53935')

    return (
        <div className="flex gap-2">
                {/* Botão Visual / Picker Nativo */}
        <div className="relative w-20 h-10 shrink-0 overflow-hidden rounded border shadow-inner">
            <input 
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                // Aumentei o w-[300%] para garantir cobertura total no scroll do picker
                className="absolute -inset-2 w-[300%] h-[150%] cursor-pointer border-none p-0"
            />
        </div>

        {/* Input de Texto (O que envia para o banco) */}
        <Input
            type="text" 
            name={name} 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            className="uppercase w-30"
        />
        </div>
    )
}