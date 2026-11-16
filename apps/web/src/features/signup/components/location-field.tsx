import { EnvironmentOutlined } from '@ant-design/icons';
import type { GeoPoint } from '@colheita/contracts';
import { Button } from 'antd';
import { useEffect } from 'react';
import { useCurrentLocation } from '../hooks/use-current-location';

/** Campo de formulário (antd) que guarda a localização do navegador. */
export function LocationField({ value, onChange, label }: { value?: GeoPoint; onChange?: (location: GeoPoint) => void; label: string }) {
  const { location, errorMessage, isLocating, requestLocation } = useCurrentLocation();

  useEffect(() => {
    if (location) onChange?.(location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <div>
      <Button icon={<EnvironmentOutlined />} loading={isLocating} onClick={requestLocation}>
        {value ? `${label} ✓` : label}
      </Button>
      {value && (
        <span className="ml-3 text-sm text-border-active">
          {value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
        </span>
      )}
      {errorMessage && <div className="text-danger text-sm mt-1">{errorMessage}</div>}
    </div>
  );
}
