import { Layers } from "lucide-react"

export default function Templates() {
  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">
          Access pre-configured templates for different scenarios
        </p>
      </div>

      <div className="rounded-lg border bg-card p-8 text-center">
        <Layers className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Templates Coming Soon</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We're building a library of templates for you
        </p>
      </div>
    </div>
  )
} 