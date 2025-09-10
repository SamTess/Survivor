"use client"

import type React from "react"
import { UniversalModal, type ModalAction } from "./UniversalModal"
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"

// Modal de confirmation
export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
}: ConfirmModalProps) {
  const actions: ModalAction[] = [
    {
      label: cancelLabel,
      onClick: onClose,
      variant: "outline",
      disabled: loading,
    },
    {
      label: confirmLabel,
      onClick: onConfirm,
      variant: variant === "destructive" ? "destructive" : "default",
      loading,
      icon: variant === "destructive" ? <AlertTriangle className="h-4 w-4" /> : undefined,
    },
  ]

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      actions={actions}
      closeOnOverlayClick={!loading}
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </UniversalModal>
  )
}

// Modal d'alerte
export interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: "info" | "success" | "warning" | "error"
}

export function AlertModal({ isOpen, onClose, title, message, type = "info" }: AlertModalProps) {
  const icons = {
    info: <Info className="h-5 w-5 text-blue-500" />,
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
  }

  const actions: ModalAction[] = [
    {
      label: "OK",
      onClick: onClose,
      variant: "default",
    },
  ]

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} title={title} size="sm" actions={actions}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <p className="text-sm text-muted-foreground flex-1">{message}</p>
      </div>
    </UniversalModal>
  )
}

// Generic form modal
export interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void | Promise<void>
  title: string
  children: React.ReactNode
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
}: FormModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(e)
  }

  const actions: ModalAction[] = [
    {
      label: cancelLabel,
      onClick: onClose,
      variant: "outline",
      disabled: loading,
    },
    {
      label: submitLabel,
      onClick: () => {
        const form = document.querySelector("form[data-modal-form]") as HTMLFormElement
        if (form) {
          form.requestSubmit()
        }
      },
      variant: "default",
      loading,
    },
  ]

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} title={title} actions={actions} closeOnOverlayClick={!loading}>
      <form onSubmit={handleSubmit} data-modal-form>
        <div className="mb-4 text-sm text-muted-foreground">
          Fields marked with <span className="text-red-500">*</span> are required.
        </div>
        {children}
      </form>
    </UniversalModal>
  )
}