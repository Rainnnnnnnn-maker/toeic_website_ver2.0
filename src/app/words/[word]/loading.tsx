export default function Loading() {
  return (
    <div className="mt-0 p-5 bg-white/96 rounded-[20px] border border-gray-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)] relative flex flex-col gap-4">
      {/* Title & Subtitle Skeleton */}
      <div className="relative overflow-hidden rounded-full bg-blue-100 w-40 h-[34px] rounded-lg after:content-[''] after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent" />
      <div className="relative overflow-hidden rounded-full bg-blue-100 w-[120px] h-6 rounded-lg after:content-[''] after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent" />

      {/* Meaning Section Skeleton */}
      <div className="mt-6 mb-3">
        <div className="relative overflow-hidden rounded-full bg-blue-100 mt-6 w-[120px] h-5 rounded mb-3 after:content-[''] after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent" />
        <div className="relative overflow-hidden rounded-full bg-blue-100 w-full h-4 rounded mb-2 after:content-[''] after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent" />
        <div className="relative overflow-hidden rounded-full bg-blue-100 w-full h-4 rounded mb-2 w-[60%] after:content-[''] after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent" />
      </div>

      {/* Examples Section Skeleton - Removed to reduce height for visibility of footer disclaimer */}
    </div>
  );
}
