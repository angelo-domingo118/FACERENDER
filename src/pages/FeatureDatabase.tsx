import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, Search, Filter, UploadCloud, 
  Grid2x2, LayoutList, Download, Tags,
  MoreHorizontal, Eye, Pencil, Trash2,
  ImageIcon
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

export default function FeatureDatabase() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const features = [
    {
      id: "FT-001",
      name: "Narrow Eyes",
      category: "Eyes",
      tags: ["Asian", "Slim", "Natural"],
      dateAdded: "2024-03-01",
      usageCount: 45
    },
    {
      id: "FT-002",
      name: "Broad Nose",
      category: "Nose",
      tags: ["Wide", "African", "Distinctive"],
      dateAdded: "2024-03-05",
      usageCount: 32
    },
    // Add more features for testing
  ]

  const categories = [
    "All Features",
    "Eyes",
    "Nose",
    "Mouth",
    "Face Shape",
    "Eyebrows",
    "Hair",
    "Facial Hair",
    "Accessories"
  ]

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Database</h1>
          <p className="text-muted-foreground">
            Browse and manage facial features
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UploadCloud className="mr-2 h-4 w-4" />
              Import Features
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === "All Features" ? "default" : "outline"}
            className="rounded-full"
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search features..." className="pl-9" />
        </div>
        <Select defaultValue="recent">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Added</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="usage">Most Used</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-8" />
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          {viewMode === 'grid' ? (
            <LayoutList className="h-4 w-4" />
          ) : (
            <Grid2x2 className="h-4 w-4" />
          )}
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.id} className="group">
            <CardContent className="p-0">
              {/* Feature Image Placeholder */}
              <div className="relative aspect-square bg-muted rounded-t-lg flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Feature Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{feature.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{feature.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Used {feature.usageCount} times
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Feature</DropdownMenuItem>
                      <DropdownMenuItem>Download</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tags className="h-4 w-4" />
                {feature.tags.join(", ")}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 