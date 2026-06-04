import Link from "next/link";
import { UserPlus } from "lucide-react";
import { publicLinks } from "@/src/content/site-links";

export default function LinkStudentsCallout() {
  return (
    <div className="bg-[#a6c8ff]/15 border border-[#00386c]/15 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#00386c] flex items-center justify-center flex-shrink-0">
        <UserPlus className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-headline font-bold text-[#00386c] text-sm">Vincula a tus estudiantes</p>
        <p className="text-[#424750] text-xs mt-1 leading-relaxed">
          Invítalos a registrarse y a seleccionar tu universidad en el perfil candidato.
          Las métricas solo incluyen perfiles verificados con la institución correcta en el catálogo.
        </p>
      </div>
      <Link href={publicLinks.register}
        className="flex-shrink-0 px-4 py-2 bg-[#00386c] text-white rounded-xl text-xs font-bold hover:opacity-90 transition">
        Ir al registro
      </Link>
    </div>
  );
}
