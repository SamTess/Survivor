"use client"

// Project Catalog component now focused on composition only.
import { useStartupCatalog } from "@/hooks/useStartupCatalog"
import { startups } from "@/data/startups"
import { StartupFilters } from "@/components/catalog/StartupFilters"
import { StartupCardItem } from "@/components/catalog/StartupCardItem"
import { Button } from "@/components/ui/button"

const sortOptions = [
  { value: "name", label: "Name (A-Z)" },
  { value: "created-desc", label: "Newest" },
  { value: "created-asc", label: "Oldest" },
]

const initialData = startups

export function ProjectCatalog() {
  const catalog = useStartupCatalog(initialData)
  const { filtered } = catalog

  return (
    <div className="space-y-6">
      <StartupFilters
        search={catalog.search} setSearch={catalog.setSearch}
        sector={catalog.sector} setSector={catalog.setSector} sectors={catalog.sectors}
        maturity={catalog.maturity} setMaturity={catalog.setMaturity} maturities={catalog.maturities}
        address={catalog.address} setAddress={catalog.setAddress} addresses={catalog.addresses}
        sortBy={catalog.sortBy} setSortBy={catalog.setSortBy}
        sortOptions={sortOptions}
        total={initialData.length}
        shown={filtered.length}
        onClear={catalog.clearAll}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filtered.map(s => <StartupCardItem key={s.id} s={s} />)}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">No startups match your criteria</p>
          <Button variant="outline" onClick={catalog.clearAll}>Clear Filters</Button>
        </div>
      )}
    </div>
  )
}
