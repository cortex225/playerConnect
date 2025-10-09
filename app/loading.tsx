import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Loader2 className="size-10 animate-spin text-muted-foreground" />
    </div>
  );
}
