export default function Loading() {
  return (
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 max-w-3xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="mb-8 animate-pulse">
        <div className="h-10 w-48 bg-white/5 rounded-lg mb-2"></div>
        <div className="h-4 w-64 bg-white/5 rounded-lg"></div>
      </div>

      <div className="flex gap-4 border-b border-border mb-8 pb-2 overflow-x-auto scrollbar-hide">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-6 w-20 bg-white/5 rounded-lg animate-pulse shrink-0"></div>
        ))}
      </div>

      <div className="h-[500px] w-full bg-white/5 rounded-3xl animate-pulse"></div>
    </div>
  );
}
