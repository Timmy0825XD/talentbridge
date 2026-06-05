"use client";

import CatalogSelect, { type CatalogOption } from "./CatalogSelect";

export type UniversityOption = CatalogOption;

interface UniversitySelectProps {
  value: string | null;
  onChange: (id: string | null) => void;
  universities: UniversityOption[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function UniversitySelect({
  value,
  onChange,
  universities,
  placeholder = "Buscar universidad...",
  className = "",
  required = true,
}: UniversitySelectProps) {
  return (
    <CatalogSelect
      value={value}
      onChange={onChange}
      options={universities}
      placeholder={placeholder}
      className={className}
      required={required}
      emptyMessage="No se encontraron universidades en el catálogo."
      hint="Selecciona tu universidad del listado. Si no aparece, contacta al administrador."
    />
  );
}
