function SkeletonBlock({ className }) {
  return <div className={`bg-[#F0EFEA] rounded-2xl animate-pulse ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="px-8 py-10 max-w-3xl mx-auto">
      <SkeletonBlock className="h-9 w-72 mb-2" />
      <SkeletonBlock className="h-4 w-56 mb-6" />
      <SkeletonBlock className="h-16 w-full mb-6" />
      <SkeletonBlock className="h-32 w-full mb-6" />
      <div className="flex gap-3 mb-12">
        <SkeletonBlock className="h-20 flex-1" />
        <SkeletonBlock className="h-20 flex-1" />
        <SkeletonBlock className="h-20 flex-1" />
      </div>
      <SkeletonBlock className="h-24 w-full mb-8" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}

export default DashboardSkeleton;