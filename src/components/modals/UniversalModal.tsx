"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Portal } from "@/components/ui/Portal"
import { X } from "lucide-react"
import { cn } from "@/utils/utils"

export interface ModalAction {
  label: string
  onClick: () => void | Promise<void>
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

export interface UniversalModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: React.ReactNode
  actions?: ModalAction[]
  size?: "sm" | "md" | "lg" | "xl" | "full" | "auto"
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-6xl",
  auto: "max-w-2xl min-w-96",
}

export function UniversalModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions = [],
  size = "auto",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  headerClassName,
  contentClassName,
}: UniversalModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // Petit délai pour permettre au DOM de se mettre à jour avant l'animation
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      // Attendre la fin de l'animation avant de démonter
      setTimeout(() => setShouldRender(false), 200)
    }
  }, [isOpen])

  if (!shouldRender) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose()
    }
  }

  const handleActionClick = async (action: ModalAction) => {
    try {
      await action.onClick()
    } catch (error) {
      console.error("Error executing modal action:", error)
    }
  }

  return (
    <Portal>
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-200",
          isAnimating ? "opacity-100" : "opacity-0"
        )} 
        onClick={handleOverlayClick}
      >
        <div
          className={cn(
            "bg-background rounded-lg shadow-lg w-full max-h-[90vh] overflow-hidden transition-all duration-200 transform",
            isAnimating ? "scale-100 translate-y-0" : "scale-95 translate-y-4",
            sizeClasses[size],
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0 shadow-none h-full flex flex-col">
            {(title || description || showCloseButton) && (
              <CardHeader
                className={cn("flex flex-row items-start justify-between space-y-0 pb-4 flex-shrink-0", headerClassName)}
              >
                <div className="space-y-1 flex-1 pr-4">
                  {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
                  {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                {showCloseButton && (
                  <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 flex-shrink-0">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                )}
              </CardHeader>
            )}

            <CardContent className={cn("flex-1 overflow-auto", contentClassName)}>{children}</CardContent>

            {actions.length > 0 && (
              <div className="flex justify-end gap-2 p-6 pt-0 flex-shrink-0">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    onClick={() => handleActionClick(action)}
                    disabled={action.disabled || action.loading}
                    className="flex items-center gap-2"
                  >
                    {action.loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      action.icon
                    )}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Portal>
  )
}
