function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="rounded border border-gray-200 bg-white p-5">
      <Pulse className="h-3.5 w-24 mb-3" />
      <Pulse className="h-8 w-16 mb-2" />
      <Pulse className="h-3 w-32" />
    </div>
  );
}

function NotifRowSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Pulse className="h-10 w-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-3.5 w-3/4" />
        <Pulse className="h-2.5 w-1/3" />
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="flex gap-6 bg-gray-50 h-[calc(100vh-115px)]">
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between rounded border border-gray-200 bg-white p-6">
          <Pulse className="h-7 w-32" />
          <Pulse className="h-8 w-8 rounded-lg" />
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>

        {/* Chart card */}
        <div className="rounded border border-gray-200 bg-white p-6">
          {/* Chart tabs + period selector */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-6 border-b border-gray-200 pb-3">
              <Pulse className="h-4 w-20" />
              <Pulse className="h-4 w-24" />
            </div>
            <div className="flex gap-4">
              <Pulse className="h-4 w-20" />
              <Pulse className="h-4 w-20" />
            </div>
          </div>
          {/* Chart area */}
          <div className="h-96 flex flex-col justify-between">
            <div className="flex-1 flex items-end gap-3 pb-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div
                    className="w-full rounded-t bg-gray-200 animate-pulse"
                    style={{ height: `${20 + Math.sin(i * 0.8) * 40 + 40}px` }}
                  />
                </div>
              ))}
            </div>
            {/* X-axis labels */}
            <div className="flex gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Pulse key={i} className="flex-1 h-3" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-80 flex flex-col gap-5">
        <div className="rounded border border-gray-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <Pulse className="h-4 w-28" />
          </div>
          <div className="p-4 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => <NotifRowSkeleton key={i} />)}
          </div>
        </div>

        <div className="rounded border border-gray-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <Pulse className="h-4 w-16" />
          </div>
          <div className="p-4 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => <NotifRowSkeleton key={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
