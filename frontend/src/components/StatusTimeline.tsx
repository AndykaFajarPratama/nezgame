import React from "react";
import { Check, Clock, CreditCard, PackageCheck, AlertCircle } from "lucide-react";

type OrderStatus = "UNPAID" | "PAID" | "SUCCESS" | "FAILED";

interface StatusTimelineProps {
  status: OrderStatus;
}

const steps = [
  { id: "CREATED", label: "Pesanan Dibuat", icon: Clock },
  { id: "UNPAID", label: "Menunggu Pembayaran", icon: CreditCard },
  { id: "PAID", label: "Pembayaran Diterima", icon: PackageCheck },
  { id: "SUCCESS", label: "Pesanan Berhasil", icon: Check },
];

export default function StatusTimeline({ status }: StatusTimelineProps) {
  const getStepIndex = (s: string) => {
    if (s === "UNPAID") return 1;
    if (s === "PAID") return 2;
    if (s === "SUCCESS") return 3;
    if (s === "FAILED") return 3; // Show failed at the end
    return 0;
  };

  const currentIndex = getStepIndex(status);
  const isFailed = status === "FAILED";

  return (
    <div className="w-full py-8">
      <div className="relative flex items-center justify-between">
        {/* Progress Line Background */}
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />
        
        {/* Active Progress Line */}
        <div 
          className={`absolute left-0 top-1/2 h-0.5 -translate-y-1/2 z-0 transition-all duration-1000 ${
            isFailed ? "bg-rose-500" : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          }`}
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isFinal = index === steps.length - 1;

          let iconColor = "text-slate-600";
          let bgColor = "bg-[#0d121b]";
          let borderColor = "border-white/5";

          if (isActive) {
            if (isFailed && isFinal) {
              iconColor = "text-rose-400";
              bgColor = "bg-rose-500/10";
              borderColor = "border-rose-500/30";
            } else {
              iconColor = "text-blue-400";
              bgColor = "bg-blue-500/10";
              borderColor = "border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]";
            }
          }

          if (isCurrent) {
             bgColor += " animate-pulse border-blue-500/50";
          }

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${bgColor} ${borderColor} ${isActive ? "scale-110" : ""}`}
              >
                {isFinal && isFailed ? (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                ) : (
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                )}
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                <p className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-500 ${
                  isActive ? (isFailed && isFinal ? "text-rose-400" : "text-blue-400") : "text-slate-500"
                }`}>
                  {isFinal && isFailed ? "Gagal" : step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
