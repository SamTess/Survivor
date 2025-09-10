import * as React from "react"
import { cn } from "@/utils/utils"

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, checked, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false)

    React.useEffect(() => {
      setIsChecked(checked || false)
    }, [checked])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked
      setIsChecked(newChecked)
      onCheckedChange?.(newChecked)
      props.onChange?.(e)
    }

    return (
      <label className={cn("inline-flex items-center cursor-pointer", className)}>
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          checked={isChecked}
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out",
            isChecked ? "bg-primary" : "bg-gray-200"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out",
              isChecked ? "translate-x-6" : "translate-x-1"
            )}
          />
        </div>
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
