export default function LoadingStartups() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 animate-pulse space-y-4">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_,i)=>(
          <div key={i} className="h-40 border rounded-lg bg-muted/40" />
        ))}
      </div>
    </div>
  )
}
