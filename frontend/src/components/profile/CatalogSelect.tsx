"use client";

import { useEffect, useRef, useState } from "react";
import { X, AlertCircle } from "lucide-react";

export interface CatalogOption {
  id: string;
  name: string;
}

interface CatalogSelectProps {
  value: string | null;
  onChange: (id: string | null) => void;
  options: CatalogOption[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  emptyMessage?: string;
  hint?: string;
}

export default function CatalogSelect({
  value,
  onChange,
  options,
  placeholder = "Buscar...",
  className = "",
  required = false,
  emptyMessage = "No se encontraron opciones en el catálogo.",
  hint = "Debes seleccionar una opción del listado.",
}: CatalogSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.id === value) ?? null;
  const showError = required && touched && !value;

  const filtered = query.trim().length > 0
    ? options.filter(o => o.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : options.slice(0, 8);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function selectOption(opt: CatalogOption) {
    onChange(opt.id);
    setQuery(opt.name);
    setOpen(false);
    setTouched(true);
  }

  function clearSelection() {
    onChange(null);
    setQuery("");
    setOpen(false);
    setTouched(true);
  }

  const inp = `flex-1 bg-[#f2f4f6] border-0 border-b-2 rounded-xl px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#b0b4bc] outline-none transition-all ${
    showError ? "border-[#ba1a1a] focus:border-[#ba1a1a]" : "border-transparent focus:border-[#006d37]"
  }`;

  return (
    <div className={className}>
      <div ref={ref} className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={open ? query : (selected?.name ?? "")}
            onChange={e => {
              setQuery(e.target.value);
              if (selected && e.target.value !== selected.name) onChange(null);
              setOpen(true);
              setTouched(true);
            }}
            onFocus={() => {
              setQuery(selected?.name ?? "");
              setOpen(true);
            }}
            onBlur={() => setTouched(true)}
            placeholder={placeholder}
            className={inp}
            aria-invalid={showError}
          />
          {value && (
            <button type="button" onClick={clearSelection}
              className="px-3 py-2.5 text-[#737781] hover:text-[#191c1e] rounded-xl border border-[#e6e8ea] bg-white transition-colors"
              aria-label="Quitar selección">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {open && filtered.length > 0 && (
          <div className="absolute z-30 mt-1.5 w-full bg-white border border-[#e6e8ea] rounded-2xl shadow-xl overflow-hidden">
            {filtered.map(o => (
              <button key={o.id} type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => selectOption(o)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-[#f7f9fb] transition-colors ${
                  o.id === value ? "bg-[#f2f4f6] font-semibold text-[#191c1e]" : "text-[#191c1e]"
                }`}>
                {o.name}
              </button>
            ))}
          </div>
        )}
        {open && query.trim() && filtered.length === 0 && (
          <div className="absolute z-30 mt-1.5 w-full bg-white border border-[#e6e8ea] rounded-2xl shadow-xl px-4 py-3 text-sm text-[#737781]">
            {emptyMessage}
          </div>
        )}
      </div>
      {showError && (
        <p className="mt-1.5 text-xs text-[#ba1a1a] flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {hint}
        </p>
      )}
    </div>
  );
}
