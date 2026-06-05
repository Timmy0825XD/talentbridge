"use client";

export default function TalentBridgeLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#f7f9fb] gap-5">

      {/* Spinner ring + logo image */}
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>

        {/* Outer spinning ring */}
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          className="absolute inset-0"
          style={{ animation: "tb-spin 1.6s linear infinite" }}
        >
          <circle
            cx="110" cy="110" r="100"
            fill="none"
            stroke="#00386c"
            strokeWidth="3"
            strokeDasharray="12 6"
            opacity="0.12"
          />
          <circle
            cx="110" cy="110" r="100"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="3.5"
            strokeDasharray="200 452"
            strokeLinecap="round"
            strokeDashoffset="0"
          />
        </svg>

        {/* Inner subtle ring (counter-spin) */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          className="absolute"
          style={{ animation: "tb-spin-reverse 3s linear infinite", top: 20, left: 20 }}
        >
          <circle
            cx="90" cy="90" r="82"
            fill="none"
            stroke="#00386c"
            strokeWidth="1.5"
            strokeDasharray="4 10"
            opacity="0.08"
          />
        </svg>

        {/* Logo image centered */}
        <div
          className="relative z-10 flex items-center justify-center rounded-full bg-white shadow-sm"
          style={{ width: 150, height: 150 }}
        >
          <img
            src="/TalentBridge-logo.jpeg"
            alt="TalentBridge"
            style={{ width: 115, height: 115, objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Three bouncing dots */}
      <div className="flex items-center gap-2">
        <span
          className="inline-block rounded-full bg-[#00386c]"
          style={{ width: 12, height: 12, animation: "tb-dot 1.2s ease-in-out infinite 0s" }}
        />
        <span
          className="inline-block rounded-full bg-[#00386c]"
          style={{ width: 12, height: 12, animation: "tb-dot 1.2s ease-in-out infinite 0.2s" }}
        />
        <span
          className="inline-block rounded-full bg-[#C9A84C]"
          style={{ width: 12, height: 12, animation: "tb-dot 1.2s ease-in-out infinite 0.4s" }}
        />
      </div>

      <style>{`
        @keyframes tb-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes tb-spin-reverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes tb-dot {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
          40%           { opacity: 1;   transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}