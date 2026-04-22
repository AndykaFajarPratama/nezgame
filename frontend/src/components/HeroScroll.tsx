import { ContainerScroll } from "./ui/container-scroll-animation";

export default function HeroScroll() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-heading font-extrabold text-white tracking-tighter uppercase">
              Pengalaman Top-Up <br />
              <span className="text-4xl md:text-[6rem] font-black mt-1 leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400">
                Masa Depan
              </span>
            </h1>
          </>
        }
      >
        <div className="relative h-full w-full bg-[#05070a] flex items-center justify-center overflow-hidden">
           {/* Mockup Dashboard / UI */}
           <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-emerald-600/20"></div>
           <div className="z-10 w-full h-full p-4 md:p-8">
              <div className="w-full h-full rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col">
                 <div className="h-8 border-b border-white/5 bg-white/5 flex items-center px-4 gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                 </div>
                 <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                       <div className="h-40 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 animate-pulse"></div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="h-24 rounded-xl bg-white/5 border border-white/10"></div>
                          <div className="h-24 rounded-xl bg-white/5 border border-white/10"></div>
                       </div>
                       <div className="h-32 rounded-xl bg-white/5 border border-white/10"></div>
                    </div>
                    <div className="space-y-4">
                       <div className="h-10 rounded-lg bg-blue-500/20 border border-blue-500/30"></div>
                       {Array.from({length: 5}).map((_, i) => (
                          <div key={i} className="h-12 rounded-lg bg-white/5 border border-white/10 flex items-center px-4 justify-between">
                             <div className="w-8 h-8 rounded bg-white/10"></div>
                             <div className="w-20 h-2 bg-white/10 rounded"></div>
                             <div className="w-12 h-4 bg-emerald-500/20 rounded border border-emerald-500/30"></div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
