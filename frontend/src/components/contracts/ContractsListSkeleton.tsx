export function ContractsListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-[#e6e8ea] p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f2f4f6]" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-[#f2f4f6] rounded-lg w-2/3" />
              <div className="h-4 bg-[#f2f4f6] rounded-lg w-1/2" />
            </div>
            <div className="h-6 w-20 rounded-full bg-[#f2f4f6]" style={{ opacity: 0.6 }} />
          </div>
        </div>
      ))}
      <p className="text-center text-xs text-[#737781] pt-2">Cargando contratos...</p>
    </div>
  );
}
