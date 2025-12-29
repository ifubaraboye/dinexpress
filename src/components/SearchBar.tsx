import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="px-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

        <Input
          type="text"
          placeholder="What can we get you?"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 bg-card border-border rounded-3xl py-5 shadow-lg text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  )
}
