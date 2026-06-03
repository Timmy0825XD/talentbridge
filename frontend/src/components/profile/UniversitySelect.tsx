"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export interface UniversityOption {
  id: string;
  name: string;
}

interface UniversitySelectProps {
  value: string | null;
  onChange: (id: string | null) => void;
  universities: UniversityOption[];
  placeholder?: string;
  className?: string;
}

export default function UniversitySelect({
  value,
  onChange,
  universities,
  placeholder = "Buscar universidad...",
  className = "",
}: UniversitySelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = universities.find(u => u.id === value) ?? null;
  const inputValue = open ? query : selected?.name ?? query;

  const filtered = inputValue.trim().length > 0
    ? universities.filter(u => u.name.toLowerCase().includes(inputValue.toLowerCase())).slice(0, 7)
    : universities.slice(0, 7);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function selectUniversity(uni: UniversityOption) {
    onChange(uni.id);
    setQuery(uni.name);
    setOpen(false);
  }

  function clearSelection() {
    onChange(null);
    setQuery("");
    setOpen(false);
  }

  const inp = "flex-1 bg-[#f2f4f6] border-0 border-b-2 border-transparent focus:border-[#006d37] focus:ring-0 rounded-xl px-4 py-3 text-sm text-[#191c1e] placeholder:text-[#b0b4bc] outline-none transition-all";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => {
            setQuery(e.target.value);
            if (selected && e.target.value !== selected.name) onChange(null);
            setOpen(true);
          }}
          onFocus={() => {
            setQuery(selected?.name ?? "");
            setOpen(true);
          }}
          placeholder={placeholder}
          className={inp}
        />
        {value && (
          <button type="button" onClick={clearSelection}
            className="px-3 py-2.5 text-[#737781] hover:text-[#191c1e] rounded-xl border border-[#e6e8ea] bg-white transition-colors"
            aria-label="Quitar universidad">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-[#e6e8ea] rounded-2xl shadow-xl overflow-hidden">
          {filtered.map(u => (
            <button key={u.id} type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => selectUniversity(u)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-[#f7f9fb] transition-colors ${
                u.id === value ? "bg-[#f2f4f6] font-semibold text-[#191c1e]" : "text-[#191c1e]"
              }`}>
              {u.name}
            </button>
          ))}
        </div>
      )}
      {open && inputValue.trim() && filtered.length === 0 && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-[#e6e8ea] rounded-2xl shadow-xl px-4 py-3 text-sm text-[#737781]">
          No se encontraron universidades en el catálogo.
        </div>
      )}
    </div>
  );
}
