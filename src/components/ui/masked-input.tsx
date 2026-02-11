'use client'

import { useState } from "react"
import { Input } from "./input"

export function MaskedInput({ 
  defaultValue, 
  name, 
  type = "text", 
  maskType 
}: { 
  defaultValue?: string, 
  name: string, 
  type?: string,
  maskType: 'whatsapp' | 'instagram' | 'email'
}) {
  const [value, setValue] = useState(defaultValue || "")

  const formatValue = (val: string) => {
    if (maskType === 'whatsapp') {
      // Remove tudo que não é número
      const numbers = val.replace(/\D/g, "")
      // Aplica a máscara (11) 99999-9999
      return numbers
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .substring(0, 15)
    }

    if (maskType === 'instagram') {
      // Garante que comece com @ e remove espaços
      let insta = val.replace(/\s/g, "")
      if (insta && !insta.startsWith('https://instagram.com/')) insta = 'https://instagram.com/' + insta
      return insta.toLowerCase()
    }

    return val // Email não costuma usar máscara, apenas validação
  }

  return (
    <Input
      name={name}
      type={type}
      value={value}
      onChange={(e) => setValue(formatValue(e.target.value))}
      placeholder={
        maskType === 'whatsapp' ? '(00) 00000-0000' : 
        maskType === 'instagram' ? 'https://instagram.com/' : 'exemplo@email.com'
      }
    />
  )
}