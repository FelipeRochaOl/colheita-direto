import { EnvironmentOutlined } from '@ant-design/icons';
import type { QualityGrade, SearchOffersInput } from '@colheita/contracts';
import { Button, Checkbox, Input, InputNumber, Select } from 'antd';
import { useEffect } from 'react';
import { useCurrentLocation } from '../../signup/hooks/use-current-location';

const GRADE_OPTIONS: Array<{ label: string; value: QualityGrade }> = [
  { label: 'A – padrão', value: 'A' },
  { label: 'B – com desconto', value: 'B' },
  { label: 'C – indústria', value: 'C' },
];

export function OfferFilters({
  filters,
  onChange,
}: {
  filters: SearchOffersInput;
  onChange: (filters: SearchOffersInput) => void;
}) {
  const { location, isLocating, errorMessage, requestLocation } = useCurrentLocation();

  useEffect(() => {
    if (location)
      onChange({ ...filters, ...location, maxDistanceKm: filters.maxDistanceKm ?? 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <Input.Search
        placeholder="Produto (ex.: tomate)"
        allowClear
        className="max-w-xs"
        defaultValue={filters.crop}
        onSearch={(crop) => onChange({ ...filters, crop: crop || undefined })}
      />
      <Checkbox.Group
        options={GRADE_OPTIONS}
        value={filters.grades}
        onChange={(grades) => onChange({ ...filters, grades: grades as QualityGrade[] })}
      />
      <Button icon={<EnvironmentOutlined />} loading={isLocating} onClick={requestLocation}>
        {filters.latitude ? 'Perto de mim ✓' : 'Perto de mim'}
      </Button>
      {filters.latitude !== undefined && (
        <Select
          value={filters.maxDistanceKm ?? 100}
          onChange={(maxDistanceKm) => onChange({ ...filters, maxDistanceKm })}
          options={[30, 50, 100, 200].map((km) => ({ label: `até ${km} km`, value: km }))}
        />
      )}
      <InputNumber
        prefix="R$"
        placeholder="Preço máx./cx"
        className="w-44!"
        min={1}
        value={filters.maxPricePerBox}
        onChange={(maxPricePerBox) =>
          onChange({ ...filters, maxPricePerBox: maxPricePerBox ?? undefined })
        }
      />
      {errorMessage && <span className="text-danger text-sm">{errorMessage}</span>}
    </div>
  );
}
