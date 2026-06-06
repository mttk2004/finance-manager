export function DashboardSkeleton() {
  return (
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 space-y-8 md:space-y-12 max-w-5xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      {/* Header Skeleton */}
      <section className="space-y-6">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse"></div>
            <div className="h-4 w-64 bg-white/5 rounded-lg animate-pulse"></div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 h-32 md:h-40 bg-white/5 rounded-3xl animate-pulse"></div>
          <div className="h-32 md:h-40 bg-white/5 rounded-3xl animate-pulse"></div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Transaction Form Skeleton */}
          <section className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-8">
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-white/5 rounded-full animate-pulse"></div>
                <div className="h-8 w-20 bg-white/5 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="h-24 md:h-32 bg-white/5 rounded-2xl animate-pulse"></div>
            <div className="h-16 bg-white/5 rounded-2xl animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-14 bg-white/5 rounded-2xl animate-pulse"></div>
              <div className="h-14 bg-white/5 rounded-2xl animate-pulse"></div>
            </div>
          </section>

          {/* Financial Insights Skeleton */}
          <section className="space-y-4">
            <div className="h-4 w-32 bg-white/5 rounded animate-pulse ml-2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-40 bg-white/5 rounded-3xl animate-pulse"></div>
              <div className="h-40 bg-white/5 rounded-3xl animate-pulse"></div>
              <div className="h-40 bg-white/5 rounded-3xl animate-pulse"></div>
            </div>
          </section>

          {/* Category Budgets Skeleton */}
          <section className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6">
            <div className="h-4 w-48 bg-white/5 rounded animate-pulse"></div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-white/5 rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-white/5 rounded animate-pulse"></div>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Recent Transactions Skeleton */}
        <section className="lg:pl-4 space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-4 w-32 bg-white/5 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-white/5 rounded animate-pulse"></div>
          </div>
          <div className="space-y-8">
            {[1, 2].map(group => (
              <div key={group} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse"></div>
                  <div className="h-[1px] flex-1 bg-white/[0.03]"></div>
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 rounded-3xl bg-card border border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-white/5 rounded animate-pulse"></div>
                        <div className="h-3 w-20 bg-white/5 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-4 w-16 bg-white/5 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
