export default function Loading() {
  return (
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 max-w-5xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="flex justify-between items-center mb-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-white/5 rounded-lg"></div>
          <div className="h-4 w-48 bg-white/5 rounded-lg"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-white/5 rounded-xl"></div>
          <div className="h-10 w-24 bg-white/5 rounded-xl"></div>
        </div>
      </div>
      
      <div className="h-[600px] w-full bg-white/5 rounded-3xl animate-pulse"></div>
    </div>
  );
}
