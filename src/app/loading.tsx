export default function Loading() {
  return (
    <div className="flex flex-col w-full h-full space-y-8 max-w-5xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-white/5 rounded-lg"></div>
        <div className="h-4 w-64 bg-white/5 rounded-lg"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-32 bg-white/5 rounded-3xl animate-pulse"></div>
        <div className="h-32 bg-white/5 rounded-3xl animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[400px] bg-white/5 rounded-3xl animate-pulse"></div>
        <div className="h-[400px] bg-white/5 rounded-3xl animate-pulse"></div>
      </div>
    </div>
  );
}
