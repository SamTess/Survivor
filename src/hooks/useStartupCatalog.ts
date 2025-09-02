"use client"

// Hook encapsulating filtering, sorting & derived option lists for startup catalog
import { useMemo, useState } from "react"
import type { StartupCard } from "@/mocks/getStartupCatalogData"

export type SortOptionValue = "name" | "created-desc" | "created-asc"

export function useStartupCatalog(initial: StartupCard[]) {
  const [search, setSearch] = useState("")
  const [sector, setSector] = useState("All")
  const [maturity, setMaturity] = useState("All")
  const [address, setAddress] = useState("All")
  const [legalStatus, setLegalStatus] = useState("All")
  const [sortBy, setSortBy] = useState<SortOptionValue>("name")

  const sectors = useMemo(() => ["All", ...Array.from(new Set(initial.map(s => s.sector)))], [initial])
  const maturities = useMemo(() => ["All", ...Array.from(new Set(initial.map(s => s.maturity)))], [initial])
  const addresses = useMemo(() => ["All", ...Array.from(new Set(initial.map(s => s.address)))], [initial])
  const legalStatuses = useMemo(() => ["All", ...Array.from(new Set(initial.map(s => s.legal_status)))], [initial])

  const filtered = useMemo(() => {
    const list = initial.filter(s => {
      const q = search.toLowerCase()
      const matchesSearch = !q || [
        s.name,
        s.description,
        s.sector,
        s.email,
        s.legal_status,
        s.address,
        s.phone,
        s.maturity,
      ].some(field => field?.toLowerCase().includes(q))
      const matchesSector = sector === "All" || s.sector === sector
      const matchesMaturity = maturity === "All" || s.maturity === maturity
      const matchesAddress = address === "All" || s.address === address
      const matchesLegal = legalStatus === "All" || s.legal_status === legalStatus
      return matchesSearch && matchesSector && matchesMaturity && matchesAddress && matchesLegal
    })
    list.sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name)
        case "created-desc": return (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0)
        case "created-asc": return (a.created_at?.getTime() || 0) - (b.created_at?.getTime() || 0)
        default: return 0
      }
    })
    return list
  }, [initial, search, sector, maturity, address, legalStatus, sortBy])

  const clearAll = () => {
    setSearch("")
    setSector("All")
    setMaturity("All")
  setAddress("All")
  setLegalStatus("All")
    setSortBy("name")
  }

  return {
    // state
  search, sector, maturity, address, legalStatus, sortBy,
    // setters
  setSearch, setSector, setMaturity, setAddress, setLegalStatus, setSortBy,
    // derived
  sectors, maturities, addresses, legalStatuses, filtered,
    // helpers
    clearAll,
  }
}
