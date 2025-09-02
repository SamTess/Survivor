"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search, X } from "lucide-react"

interface Props {
  search: string; setSearch: (v: string) => void
  sector: string; setSector: (v: string) => void; sectors: string[]
  maturity: string; setMaturity: (v: string) => void; maturities: string[]
  address: string; setAddress: (v: string) => void; addresses: string[]
  sortBy: string; setSortBy: (v: "name" | "created-desc" | "created-asc") => void
  sortOptions: { value: string; label: string }[]
  total: number; shown: number
  onClear: () => void
}

export function StartupFilters(props: Props) {
  const { search, setSearch, sector, setSector, sectors, maturity, setMaturity, maturities, address, setAddress, addresses, sortBy, setSortBy, sortOptions, total, shown, onClear } = props
  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Search & Filter</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search startups..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger><SelectValue placeholder="Sector" /></SelectTrigger>
          <SelectContent>
            {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={maturity} onValueChange={setMaturity}>
          <SelectTrigger><SelectValue placeholder="Maturity" /></SelectTrigger>
          <SelectContent>
            {maturities.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={address} onValueChange={setAddress}>
          <SelectTrigger><SelectValue placeholder="Address" /></SelectTrigger>
          <SelectContent>
            {addresses.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-muted-foreground">Showing {shown} of {total} startups</p>
  <Select value={sortBy} onValueChange={(v) => setSortBy(v as "name" | "created-desc" | "created-asc") }>
          <SelectTrigger className="w-40"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            {sortOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
