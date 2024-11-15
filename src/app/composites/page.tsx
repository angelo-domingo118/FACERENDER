"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NewCompositeDialog } from "@/components/dialogs/NewCompositeDialog"

export default function CompositesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setDialogOpen(true)}>
        New Composite
      </Button>

      <NewCompositeDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      />
      
      {/* Rest of your composites list/cards */}
    </div>
  )
} 