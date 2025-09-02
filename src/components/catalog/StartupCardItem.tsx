"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ImageOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { StartupCard } from "@/mocks/getStartupCatalogData"
import { startupCardFieldConfig } from "@/components/catalog/startupCardFieldConfig"
import { useEffect, useRef, useState } from 'react'

// Props extended with index to optionally tweak loading strategy (priority for first items)
export function StartupCardItem({ s, index }: { s: StartupCard; index?: number }) {
  // Explicit lazy loading (beyond next/image default): we avoid mounting the Image component until card is near viewport
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    // If already in initial viewport (e.g. first row), mark visible immediately
    if (index !== undefined && index < 3) { // first row in a 3-col layout
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
          break
        }
      }
    }, { rootMargin: '200px 0px 200px 0px', threshold: 0.01 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [index])
  return (
  <Card ref={ref} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
        {s.image_url && visible ? (
          <Image
            src={s.image_url}
            alt={s.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index !== undefined && index < 3}
            placeholder="empty"
            loading={index !== undefined && index < 3 ? 'eager' : 'lazy'}
          />
        ) : !s.image_url ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-xs gap-1">
            <ImageOff className="h-5 w-5" />
            No image
          </div>
        ) : (
          // Reserve space before image loads after intersection
          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">Loading...</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent pointer-events-none" />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{s.sector}</Badge>
          <Badge variant="outline">{s.maturity}</Badge>
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">{s.name}</CardTitle>
        <CardDescription className="text-sm line-clamp-2">{s.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          {startupCardFieldConfig.map(fd => {
            const value = s[fd.key]
            if (value === undefined || value === null) return null
            const text = fd.format ? fd.format(value as never, s) : String(value)
            if (!text) return null
            const Icon = fd.icon
            return (
              <div key={fd.key} className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                <span className={fd.key === 'created_at' ? 'text-xs' : ''}>{fd.key === 'created_at' ? `Created ${text}` : text}</span>
              </div>
            )
          })}
        </div>
        <Button variant="outline" className="w-full group bg-transparent">
          <Link href={`/projects/${s.id}`} className="flex items-center gap-2">
            View Details
            <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
