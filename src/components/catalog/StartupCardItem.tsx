"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import type { Startup } from "@/domain/entities/Startup"
import Image from 'next/image'
import { startupCardFieldConfig } from "@/components/catalog/startupCardFieldConfig"
import { useRef } from 'react'
import { computeStartupImageSrc } from '@/application/services/startups/imageSrc'

export function StartupCardItem({ s }: { s: Startup }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const imageSrc = computeStartupImageSrc(s as Startup & { image_url?: string })

  return (
  <Card ref={ref} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
  {imageSrc ? (
          <Image
            src={imageSrc}
            alt={s.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            unoptimized={imageSrc.startsWith('data:')}
          />
        ) : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
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
