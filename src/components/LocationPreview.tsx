'use client'

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface LocationPreviewProps {
  address: string;
  name?: string;
}

export function LocationPreview({ address, name = 'Estabelecimento' }: LocationPreviewProps) {
  const [apiKey, setApiKey] = useState<string>('');

  const mapUrl = useMemo(() => {
    if (address.trim()) {
      const encodedAddress = encodeURIComponent(address);
      return `https://www.google.com/maps/search/${encodedAddress}`;
    }
    return '';
  }, [address]);

  useEffect(() => {
    // Buscar API Key do backend
    const fetchApiKey = async () => {
      try {
        const response = await fetch('/api/config/maps');
        const data = await response.json();
        setApiKey(data.apiKey || '');
      } catch (error) {
        console.error('Erro ao buscar API Key:', error);
      }
    };
    fetchApiKey();
  }, []);

  if (!address.trim()) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Pré-visualização do Mapa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Endereço configurado</Label>
          <p className="text-sm p-3 bg-zinc-100 rounded-md border border-zinc-200 dark:text-zinc-50 dark:bg-zinc-800 dark:border-zinc-700">{address}</p>
        </div>

        <div className="space-y-2">
          <Label>Visualização</Label>
          <div className="bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 h-[300px]">
            {apiKey ? (
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}`}
              ></iframe>
            ) : (
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?output=embed&q=${encodeURIComponent(address)}`}
              ></iframe>
            )}
          </div>
        </div>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-orange-600 hover:text-orange-700 underline inline-block mt-2"
        >
          Abrir em Google Maps →
        </a>
      </CardContent>
    </Card>
  );
}
