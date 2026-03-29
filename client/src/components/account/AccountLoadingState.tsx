import { Skeleton } from "@/components/ui/skeleton";

type AccountContentVariant = "cards" | "detail" | "form" | "table";

function SidebarSkeleton() {
  return (
    <div className="w-full md:w-[280px] shrink-0">
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-12 w-full rounded-md bg-neutral-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AccountContentLoadingState({
  variant = "cards",
}: {
  variant?: AccountContentVariant;
}) {
  if (variant === "table") {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-9 w-48 bg-neutral-200" />
          <Skeleton className="h-5 w-72 bg-neutral-100" />
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <Skeleton className="h-14 w-full rounded-none bg-neutral-100" />
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-12 w-full bg-neutral-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md bg-neutral-200" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-56 bg-neutral-200" />
            <Skeleton className="h-4 w-40 bg-neutral-100" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border border-neutral-200 p-6">
              <Skeleton className="mb-4 h-6 w-32 bg-neutral-200" />
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-20 w-full bg-neutral-100" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-lg border border-neutral-200 p-6">
                <Skeleton className="mb-4 h-6 w-28 bg-neutral-200" />
                <div className="space-y-3">
                  {[1, 2, 3].map((row) => (
                    <Skeleton key={row} className="h-4 w-full bg-neutral-100" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className="space-y-12">
        <div className="space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-9 w-56 bg-neutral-200" />
            <Skeleton className="h-5 w-72 bg-neutral-100" />
          </div>
          <div className="max-w-xl space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Skeleton className="h-11 w-full bg-neutral-100" />
              <Skeleton className="h-11 w-full bg-neutral-100" />
            </div>
            <Skeleton className="h-11 w-full bg-neutral-100" />
            <Skeleton className="h-11 w-full bg-neutral-100" />
            <Skeleton className="h-11 w-40 bg-neutral-200" />
          </div>
        </div>
        <div className="space-y-8 border-t border-neutral-200 pt-12">
          <div className="space-y-3">
            <Skeleton className="h-8 w-40 bg-neutral-200" />
            <Skeleton className="h-5 w-64 bg-neutral-100" />
          </div>
          <div className="max-w-xl space-y-6">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-11 w-full bg-neutral-100" />
            ))}
            <Skeleton className="h-5 w-32 bg-neutral-100" />
            <Skeleton className="h-11 w-44 bg-neutral-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-9 w-48 bg-neutral-200" />
          <Skeleton className="h-5 w-72 bg-neutral-100" />
        </div>
        <Skeleton className="h-11 w-40 bg-neutral-200" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[1, 2].map((item) => (
          <div key={item} className="rounded-lg border border-neutral-200 p-6">
            <Skeleton className="mb-4 h-6 w-32 bg-neutral-200" />
            <div className="space-y-3">
              {[1, 2, 3].map((row) => (
                <Skeleton key={row} className="h-4 w-full bg-neutral-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountLayoutLoadingState() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="container-custom">
        <div className="flex flex-col gap-10 md:flex-row">
          <SidebarSkeleton />
          <div className="flex-1 min-w-0">
            <AccountContentLoadingState variant="cards" />
          </div>
        </div>
      </div>
    </div>
  );
}
