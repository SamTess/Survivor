export default function LoadingStartupDetail() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6 animate-pulse">
      <div className="h-5 w-40 bg-muted rounded" />
      <div className="h-10 w-2/3 bg-muted rounded" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 5 }).map((_,i)=>(
          <div key={i} className="h-16 bg-muted rounded" />
        ))}
      </div>
    </div>
  )
}
