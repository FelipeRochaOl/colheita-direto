import type { GeoPoint } from '@colheita/contracts';
import { useCallback, useState } from 'react';

/** Pede a localização do navegador (com permissão do usuário). Usada para achar ofertas e rotas próximas. */
export function useCurrentLocation() {
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMessage('Seu navegador não informa a localização.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setErrorMessage(null);
        setIsLocating(false);
      },
      () => {
        setErrorMessage('Não foi possível pegar a localização. Permita o acesso e tente de novo.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  return { location, errorMessage, isLocating, requestLocation };
}
