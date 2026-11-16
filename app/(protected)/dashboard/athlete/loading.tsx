import { Skeleton } from "@/components/ui/skeleton";

export default function AthleteDashboardLoading() {
  return (
    <div className="space-y-10 px-4 pt-2 md:px-0" aria-busy="true" aria-label="Chargement de ta fiche">
      <div className="flex items-center gap-5 border-b pb-8">
        <Skeleton className="size-20 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
