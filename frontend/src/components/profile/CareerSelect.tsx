"use client";

import CatalogSelect, { type CatalogOption } from "./CatalogSelect";

export type CareerOption = CatalogOption;

interface CareerSelectProps {
  value: string | null;
  onChange: (id: string | null) => void;
  careers: CareerOption[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function CareerSelect({
  value,
  onChange,
  careers,
  placeholder = "Buscar carrera...",
  className = "",
  required = true,
}: CareerSelectProps) {
  return (
    <CatalogSelect
      value={value}
      onChange={onChange}
      options={careers}
      placeholder={placeholder}
      className={className}
      required={required}
      emptyMessage="No se encontraron carreras en el catálogo."
      hint="Selecciona tu carrera del listado. Si no aparece, contacta al administrador."
    />
  );
}
