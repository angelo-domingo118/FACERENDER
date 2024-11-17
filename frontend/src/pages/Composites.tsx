import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table"
import { 
  Plus, Search, Filter, ArrowUpDown, MoreHorizontal,
  Download, Pencil, Trash2, LayoutGrid, LayoutList,
  Clock, User, Globe, FileText, SortAsc, SortDesc
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { NewCompositeDialog } from "@/components/dialogs/NewCompositeDialog"

export default function Composites() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  
  const composites = [
    {
      id: "COM-123",
      name: "Robbery Suspect #1",
      status: "Active",
      caseId: "CASE-456",
      createdAt: "2024-03-10",
      updatedAt: "2024-03-15",
      thumbnail: "path/to/image.jpg",
      ageRange: "20-30",
      gender: "Male",
      ethnicity: "Caucasian",
      description: "Suspect in downtown robbery case"
    },
    {
      id: "COM-124",
      name: "Assault Case Suspect",
      status: "Active",
      caseId: "CASE-457",
      createdAt: "2024-03-12",
      updatedAt: "2024-03-14",
      thumbnail: "path/to/image.jpg",
      ageRange: "30-40",
      gender: "Female",
      ethnicity: "Asian",
      description: "Person of interest in assault case"
    },
    {
      id: "COM-125",
      name: "Missing Person Case",
      status: "Closed",
      caseId: "CASE-458",
      createdAt: "2024-03-08",
      updatedAt: "2024-03-13",
      thumbnail: "path/to/image.jpg",
      ageRange: "25-35",
      gender: "Male",
      ethnicity: "African American",
      description: "Missing person last seen downtown"
    },
    {
      id: "COM-126",
      name: "Theft Suspect",
      status: "Active",
      caseId: "CASE-459",
      createdAt: "2024-03-15",
      updatedAt: "2024-03-15",
      thumbnail: "path/to/image.jpg",
      ageRange: "40-50",
      gender: "Male",
      ethnicity: "Hispanic",
      description: "Suspect in retail theft"
    },
    {
      id: "COM-127",
      name: "Burglary Investigation",
      status: "Active",
      caseId: "CASE-460",
      createdAt: "2024-03-16",
      updatedAt: "2024-03-16",
      thumbnail: "path/to/image.jpg",
      ageRange: "35-45",
      gender: "Male",
      ethnicity: "Middle Eastern",
      description: "Suspect in residential burglary, last seen wearing dark clothing"
    },
    {
      id: "COM-128",
      name: "Witness Statement Case",
      status: "Closed",
      caseId: "CASE-461",
      createdAt: "2024-03-07",
      updatedAt: "2024-03-12",
      thumbnail: "path/to/image.jpg",
      ageRange: "25-35",
      gender: "Female",
      ethnicity: "South Asian",
      description: "Key witness in ongoing investigation, potential lead in fraud case"
    }
  ]

  const renderListView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Case ID</TableHead>
            <TableHead>Age Range</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Ethnicity</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {composites.map((composite) => (
            <TableRow key={composite.id}>
              <TableCell className="font-medium">{composite.id}</TableCell>
              <TableCell>{composite.name}</TableCell>
              <TableCell>
                <Badge variant={composite.status === "Active" ? "default" : "secondary"}>
                  {composite.status}
                </Badge>
              </TableCell>
              <TableCell>{composite.caseId}</TableCell>
              <TableCell>{composite.ageRange}</TableCell>
              <TableCell>{composite.gender}</TableCell>
              <TableCell>{composite.ethnicity}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {composites.map((composite) => (
        <Card key={composite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative aspect-[4/3] border-b bg-muted group">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <span className="text-sm">Composite Preview</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button variant="secondary" size="sm">
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold truncate">{composite.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{composite.id}</Badge>
                    <Badge variant={composite.status === "Active" ? "default" : "secondary"}>
                      {composite.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {composite.description}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{composite.gender}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{composite.ageRange}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{composite.ethnicity}</span>
                </div>
              </div>
            </div>
          </CardContent>

          <div className="border-t px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Case #{composite.caseId}</span>
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(composite.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" /> Export
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Composites</h1>
          <p className="text-muted-foreground">
            Manage and organize your facial composites
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Composite
        </Button>
      </div>

      <NewCompositeDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Filters, Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search composites..." className="pl-9" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Badge variant="outline" className="mr-2">Active</Badge>
              Status: Active
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Badge variant="outline" className="mr-2">Closed</Badge>
              Status: Closed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {sortBy === 'newest' && 'Newest First'}
              {sortBy === 'oldest' && 'Oldest First'}
              {sortBy === 'name' && 'Name A-Z'}
              {sortBy === 'name-desc' && 'Name Z-A'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setSortBy('newest')}>
              <SortDesc className="mr-2 h-4 w-4" />
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('oldest')}>
              <SortAsc className="mr-2 h-4 w-4" />
              Oldest First
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortBy('name')}>
              <SortAsc className="mr-2 h-4 w-4" />
              Name A-Z
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('name-desc')}>
              <SortDesc className="mr-2 h-4 w-4" />
              Name Z-A
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="h-8" />
        <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
          {viewMode === 'list' ? (
            <LayoutGrid className="h-4 w-4" />
          ) : (
            <LayoutList className="h-4 w-4" />
          )}
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Content */}
      {viewMode === 'list' ? renderListView() : renderGridView()}
    </div>
  )
} 