'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapPin, AlertCircle } from 'lucide-react';

interface LocationMapProps {
  address?: string;
  name?: string;
}

export function LocationMap({ address = '', name = 'Estabelecimento' }: LocationMapProps) {
  const [mapUrl, setMapUrl] = useState('');
  const [apiKey, setApiKey] = useState<string>('');

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

  const hasApiKey = apiKey && apiKey.trim().length > 0;

  useEffect(() => {
    if (address.trim()) {
      const encodedAddress = encodeURIComponent(address);
      setMapUrl(`https://www.google.com/maps/search/${encodedAddress}`);
    }
  }, [address]);

  if (!address.trim()) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Localização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-zinc-600">Endereço</Label>
          <p className="text-sm text-zinc-800 p-3 bg-zinc-50 rounded-md border border-zinc-200">{address}</p>
        </div>

        <div className="space-y-2">
          <Label>Mapa</Label>
          <div className="bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 h-[300px]">
            {hasApiKey ? (
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
          className="text-sm text-orange-600 hover:text-orange-700 underline"
        >
          Abrir em Google Maps →
        </a>

        {!hasApiKey && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2 mt-2">
            <AlertCircle className="w-4 h-4 text-yellow-700 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              Mapa em modo básico. Para versão com mais recursos, configure uma API Key.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
