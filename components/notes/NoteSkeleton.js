export default function NoteSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-[24px] p-6 animate-pulse">
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-2xl bg-white/5" />
        <div className="w-20 h-6 bg-white/5 rounded-full" />
      </div>
      <div className="w-3/4 h-6 bg-white/5 rounded-lg mb-3" />
      <div className="w-full h-4 bg-white/5 rounded-lg mb-2" />
      <div className="w-5/6 h-4 bg-white/5 rounded-lg mb-6" />
      
      <div className="pt-5 border-t border-white/5 flex justify-between">
        <div className="w-24 h-4 bg-white/5 rounded-lg" />
        <div className="w-16 h-4 bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}
