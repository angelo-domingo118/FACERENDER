import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table"
import { 
  Plus, Search, Filter, ArrowUpDown, MoreHorizontal,
  Download, Pencil, Trash2, LayoutGrid, LayoutList,
  Clock, User, Globe, FileText, SortAsc, SortDesc,
  Eye, ZoomIn, ZoomOut, X, Check, User2, UserSquare2, Users, ClipboardCheck
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

export default function Composites() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedComposite, setSelectedComposite] = useState<typeof composites[0] | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">("all")
  const [sortOrder, setSortOrder] = useState("newest")
  
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
    },
    {
      id: "COM-129",
      name: "Armed Robbery Case",
      status: "Active",
      caseId: "CASE-462",
      createdAt: "2024-03-17",
      updatedAt: "2024-03-17",
      thumbnail: "path/to/image.jpg",
      ageRange: "30-35",
      gender: "Male",
      ethnicity: "Hispanic",
      description: "Armed suspect involved in bank robbery, wearing dark hoodie and mask"
    },
    {
      id: "COM-130",
      name: "Missing Student",
      status: "Active",
      caseId: "CASE-463",
      createdAt: "2024-03-16",
      updatedAt: "2024-03-17",
      thumbnail: "path/to/image.jpg",
      ageRange: "18-22",
      gender: "Female",
      ethnicity: "Asian",
      description: "University student missing after late-night study session at library"
    },
    {
      id: "COM-131",
      name: "Carjacking Incident",
      status: "Active",
      caseId: "CASE-464",
      createdAt: "2024-03-15",
      updatedAt: "2024-03-16",
      thumbnail: "path/to/image.jpg",
      ageRange: "25-30",
      gender: "Male",
      ethnicity: "African American",
      description: "Suspect in vehicle theft at gunpoint in shopping center parking lot"
    },
    {
      id: "COM-132",
      name: "Store Break-in",
      status: "Closed",
      caseId: "CASE-465",
      createdAt: "2024-03-14",
      updatedAt: "2024-03-15",
      thumbnail: "path/to/image.jpg",
      ageRange: "20-25",
      gender: "Male",
      ethnicity: "Caucasian",
      description: "Suspect caught on CCTV during convenience store burglary"
    },
    {
      id: "COM-133",
      name: "Park Assault Case",
      status: "Active",
      caseId: "CASE-466",
      createdAt: "2024-03-13",
      updatedAt: "2024-03-14",
      thumbnail: "path/to/image.jpg",
      ageRange: "30-40",
      gender: "Male",
      ethnicity: "Middle Eastern",
      description: "Suspect in evening assault at city park, witness description provided"
    },
    {
      id: "COM-134",
      name: "Identity Theft Suspect",
      status: "Active",
      caseId: "CASE-467",
      createdAt: "2024-03-12",
      updatedAt: "2024-03-13",
      thumbnail: "path/to/image.jpg",
      ageRange: "35-45",
      gender: "Female",
      ethnicity: "East Asian",
      description: "Suspect in multiple identity theft cases at local banks"
    },
    {
      id: "COM-135",
      name: "Mall Pickpocket",
      status: "Closed",
      caseId: "CASE-468",
      createdAt: "2024-03-11",
      updatedAt: "2024-03-12",
      thumbnail: "path/to/image.jpg",
      ageRange: "20-30",
      gender: "Male",
      ethnicity: "South Asian",
      description: "Serial pickpocket operating in shopping malls, multiple victims"
    },
    {
      id: "COM-136",
      name: "Drug Trafficking Case",
      status: "Active",
      caseId: "CASE-469",
      createdAt: "2024-03-10",
      updatedAt: "2024-03-11",
      thumbnail: "path/to/image.jpg",
      ageRange: "25-35",
      gender: "Male",
      ethnicity: "Latino",
      description: "Key suspect in ongoing narcotics investigation"
    }
  ]

  const filteredComposites = composites
    // Filter by search query
    .filter(composite => {
      if (!searchQuery) return true
      const searchLower = searchQuery.toLowerCase()
      return (
        composite.name.toLowerCase().includes(searchLower) ||
        composite.id.toLowerCase().includes(searchLower) ||
        composite.caseId.toLowerCase().includes(searchLower) ||
        composite.description.toLowerCase().includes(searchLower)
      )
    })
    // Filter by status
    .filter(composite => {
      if (statusFilter === "all") return true
      return statusFilter === "active" 
        ? composite.status === "Active"
        : composite.status === "Closed"
    })
    // Sort
    .sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "oldest":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        case "name":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })

  const renderListView = (composites: typeof composites[0][]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Preview</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Case ID</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {composites.map((composite) => (
            <TableRow key={composite.id} className="group">
              <TableCell>
                <div className="relative w-32 h-40 rounded-md bg-muted/30 flex items-center justify-center group-hover:ring-2 ring-primary/20 transition-all">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <div className="absolute inset-0 border border-dashed border-muted-foreground/20 rounded-md" />
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <div className="flex flex-col gap-1.5">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-24"
                        onClick={() => handlePreviewClick(composite)}
                      >
                        <Eye className="h-3 w-3 mr-1" /> Details
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-24"
                        onClick={() => handleEditImage(composite.id)}
                      >
                        <Pencil className="h-3 w-3 mr-1" /> Image
                      </Button>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">{composite.id}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{composite.name}</span>
                  <p className="text-xs text-muted-foreground line-clamp-2 max-w-[300px]">
                    {composite.description}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={composite.status === "Active" ? "default" : "secondary"}>
                  {composite.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span>{composite.caseId}</span>
                  <span className="text-xs text-muted-foreground">
                    Updated {new Date(composite.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-primary" />
                    <span>{composite.gender}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{composite.ageRange}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-primary" />
                    <span>{composite.ethnicity}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="hover:bg-background/80 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer"
                      onClick={() => handlePreviewClick(composite)}
                    >
                      <Eye className="h-4 w-4" /> View Case Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer"
                      onClick={() => handleEditImage(composite.id)}
                    >
                      <Pencil className="h-4 w-4" /> Edit Composite Image
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Download className="h-4 w-4" /> Export Composite
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive gap-2 cursor-pointer">
                      <Trash2 className="h-4 w-4" /> Delete Case
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

  const renderGridView = (composites: typeof composites[0][]) => (
    <div className="p-4">
      <div className="flex flex-wrap gap-4">
        {composites.map((composite) => (
          <div 
            key={composite.id} 
            className="group flex-grow basis-[300px] min-w-[300px] max-w-[400px] flex flex-col bg-card rounded-xl border hover:border-primary/20 hover:shadow-md transition-all duration-200"
          >
            <div className="relative aspect-[3/4] rounded-t-xl bg-muted/50 overflow-hidden">
              <div className="absolute top-3 right-3 z-10">
                <Badge 
                  variant={composite.status === "Active" ? "default" : "secondary"}
                  className="shadow-sm"
                >
                  {composite.status}
                </Badge>
              </div>

              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground p-6">
                <div className="text-center space-y-3">
                  <div className="relative w-24 h-32 mx-auto rounded-md bg-muted/30 flex items-center justify-center backdrop-blur-sm">
                    <FileText className="h-12 w-12 opacity-50" />
                    <div className="absolute inset-0 border-2 border-dashed border-muted-foreground/20 rounded-md animate-pulse" />
                  </div>
                  <span className="text-sm font-medium inline-block">Composite Preview</span>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="shadow-lg hover:shadow-xl transition-all w-32"
                    onClick={() => handlePreviewClick(composite)}
                  >
                    <Eye className="h-4 w-4 mr-2" /> View Details
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="shadow-lg hover:shadow-xl transition-all w-32"
                    onClick={() => handleEditImage(composite.id)}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit Image
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="shadow-lg hover:shadow-xl transition-all w-32"
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
              </div>
            </div>

            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base truncate">
                      {composite.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {composite.id}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        Case #{composite.caseId}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {composite.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs mt-auto bg-muted/50 p-2 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{composite.gender}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{composite.ageRange}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{composite.ethnicity}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="border-t px-3 py-2 bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(composite.updatedAt).toLocaleDateString()}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer"
                      onClick={() => handlePreviewClick(composite)}
                    >
                      <Eye className="h-4 w-4" /> View Case Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer"
                      onClick={() => handleEditImage(composite.id)}
                    >
                      <Pencil className="h-4 w-4" /> Edit Composite Image
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Download className="h-4 w-4" /> Export Composite
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive gap-2 cursor-pointer">
                      <Trash2 className="h-4 w-4" /> Delete Case
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const handlePreviewClick = (composite: typeof composites[0]) => {
    setSelectedComposite(composite)
    setPreviewOpen(true)
  }

  const handleEditImage = (compositeId: string) => {
    navigate(`/composite-editor/${compositeId}`)
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Filters, Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search composites..." 
            className="pl-9" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              <Badge variant="outline" className="mr-2">All</Badge>
              Show All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("active")}>
              <Badge variant="default" className="mr-2">Active</Badge>
              Active Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("closed")}>
              <Badge variant="secondary" className="mr-2">Closed</Badge>
              Closed Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === 'newest' && 'Newest First'}
              {sortOrder === 'oldest' && 'Oldest First'}
              {sortOrder === 'name' && 'Name A-Z'}
              {sortOrder === 'name-desc' && 'Name Z-A'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setSortOrder('newest')}>
              <SortDesc className="mr-2 h-4 w-4" />
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder('oldest')}>
              <SortAsc className="mr-2 h-4 w-4" />
              Oldest First
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortOrder('name')}>
              <SortAsc className="mr-2 h-4 w-4" />
              Name A-Z
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder('name-desc')}>
              <SortDesc className="mr-2 h-4 w-4" />
              Name Z-A
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-8" />

        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
        >
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

        <Button onClick={() => setDialogOpen(true)} className="ml-auto">
          <Plus className="mr-2 h-4 w-4" /> New Composite
        </Button>
      </div>

      <NewCompositeDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Content */}
      {viewMode === 'list' 
        ? renderListView(filteredComposites) 
        : renderGridView(filteredComposites)
      }

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[1000px] p-0 gap-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Composite Preview
                <Badge variant="outline" className="ml-2">
                  {selectedComposite?.id}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                View detailed composite information
              </DialogDescription>
            </div>
            <Badge 
              variant={selectedComposite?.status === "Active" ? "default" : "secondary"}
              className="text-sm"
            >
              {selectedComposite?.status}
            </Badge>
          </div>

          {selectedComposite && (
            <div className="grid grid-cols-[400px,1fr]">
              {/* Left Column - Preview */}
              <div className="border-r flex flex-col">
                <div className="flex-1 aspect-[3/4] relative bg-muted/50">
                  {/* Zoom Controls */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setImagePreviewOpen(true)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Preview Content */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="w-full h-full flex items-center justify-center">
                      <div 
                        className="relative w-full h-full max-w-[320px] max-h-[420px] rounded-md bg-muted/30 flex items-center justify-center backdrop-blur-sm transition-transform duration-200"
                        style={{ transform: `scale(${zoomLevel})` }}
                      >
                        <FileText className="w-1/4 h-1/4 opacity-50" />
                        <div className="absolute inset-0 border-2 border-dashed border-muted-foreground/20 rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto relative">
                {/* Edit Mode Header */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Select 
                        defaultValue={selectedComposite.status}
                        onValueChange={(value) => {
                          // Add your status update logic here
                          console.log('Status updated:', value)
                        }}
                      >
                        <SelectTrigger className="w-[120px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">
                            <div className="flex items-center gap-2">
                              <Badge variant="default">Active</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="Closed">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Closed</Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          // Add your save logic here
                          setIsEditing(false)
                        }}
                      >
                        <Check className="mr-2 h-4 w-4" /> Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  )}
                </div>

                {/* Case Information */}
                <div className={cn(
                  "space-y-6 pr-24 transition-all duration-200",
                  isEditing && "bg-muted/50 rounded-lg p-4"
                )}>
                  <div className="space-y-4">
                    <div>
                      <Label className={cn(
                        "text-muted-foreground mb-2",
                        isEditing && "block"
                      )}>
                        Case Name
                      </Label>
                      {isEditing ? (
                        <Input 
                          defaultValue={selectedComposite.name}
                          className="text-lg font-semibold bg-background"
                          placeholder="Enter case name"
                        />
                      ) : (
                        <h3 className="font-semibold text-lg">{selectedComposite.name}</h3>
                      )}
                    </div>

                    <div>
                      <Label className={cn(
                        "text-muted-foreground mb-2",
                        isEditing && "block"
                      )}>
                        Description
                      </Label>
                      {isEditing ? (
                        <Textarea 
                          defaultValue={selectedComposite.description}
                          className="bg-background resize-none"
                          placeholder="Enter case description"
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {selectedComposite.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground block mb-2">Case ID</Label>
                        {isEditing ? (
                          <Input 
                            defaultValue={selectedComposite.caseId}
                            className="bg-background"
                            placeholder="Enter case ID"
                          />
                        ) : (
                          <p className="font-medium">{selectedComposite.caseId}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-muted-foreground block mb-2">Last Updated</Label>
                        <p className="font-medium">
                          {new Date(selectedComposite.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Subject Details */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <User2 className="h-4 w-4" /> Subject Details
                  </h4>
                  <div className={cn(
                    "grid gap-4 p-4 rounded-lg",
                    isEditing ? "bg-muted" : "bg-muted/50"
                  )}>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground block">Gender</Label>
                        {isEditing ? (
                          <Select defaultValue={selectedComposite.gender}>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="font-medium">{selectedComposite.gender}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground block">Age Range</Label>
                        {isEditing ? (
                          <Select defaultValue={selectedComposite.ageRange}>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select age range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="18-25">18-25</SelectItem>
                              <SelectItem value="26-35">26-35</SelectItem>
                              <SelectItem value="36-45">36-45</SelectItem>
                              <SelectItem value="46-55">46-55</SelectItem>
                              <SelectItem value="56+">56+</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="font-medium">{selectedComposite.ageRange}</p>
                        )}
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label className="text-muted-foreground block">Ethnicity</Label>
                        {isEditing ? (
                          <Select defaultValue={selectedComposite.ethnicity}>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select ethnicity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Caucasian">Caucasian</SelectItem>
                              <SelectItem value="African American">African American</SelectItem>
                              <SelectItem value="Asian">Asian</SelectItem>
                              <SelectItem value="Hispanic">Hispanic</SelectItem>
                              <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="font-medium">{selectedComposite.ethnicity}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Operator Details */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <UserSquare2 className="h-4 w-4" /> Operator Details
                  </h4>
                  <div className={cn(
                    "grid gap-4 p-4 rounded-lg",
                    isEditing ? "bg-muted" : "bg-muted/50"
                  )}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground block">Rank</Label>
                        {isEditing ? (
                          <Select defaultValue={selectedComposite.operatorRank}>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select rank" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="po1">PO1</SelectItem>
                              <SelectItem value="po2">PO2</SelectItem>
                              <SelectItem value="po3">PO3</SelectItem>
                              <SelectItem value="spo1">SPO1</SelectItem>
                              <SelectItem value="spo2">SPO2</SelectItem>
                              <SelectItem value="spo3">SPO3</SelectItem>
                              <SelectItem value="spo4">SPO4</SelectItem>
                              <SelectItem value="inspector">Inspector</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="font-medium">{selectedComposite.operatorRank || 'Not specified'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground block">Badge Number</Label>
                        {isEditing ? (
                          <Input 
                            defaultValue={selectedComposite.operatorBadgeNumber}
                            className="bg-background"
                            placeholder="Enter badge number"
                          />
                        ) : (
                          <p className="font-medium">{selectedComposite.operatorBadgeNumber || 'Not specified'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Witness Details */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" /> Witness Details
                  </h4>
                  <div className={cn(
                    "grid gap-4 p-4 rounded-lg",
                    isEditing ? "bg-muted" : "bg-muted/50"
                  )}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground block">Name</Label>
                        {isEditing ? (
                          <Input 
                            defaultValue={selectedComposite.witnessName}
                            className="bg-background"
                            placeholder="Enter witness name"
                          />
                        ) : (
                          <p className="font-medium">{selectedComposite.witnessName || 'Not specified'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground block">Contact</Label>
                        {isEditing ? (
                          <Input 
                            defaultValue={selectedComposite.witnessContact}
                            className="bg-background"
                            placeholder="Enter contact number"
                          />
                        ) : (
                          <p className="font-medium">{selectedComposite.witnessContact || 'Not specified'}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground block">Address</Label>
                      {isEditing ? (
                        <Textarea 
                          defaultValue={selectedComposite.witnessAddress}
                          className="bg-background resize-none"
                          placeholder="Enter witness address"
                          rows={2}
                        />
                      ) : (
                        <p className="font-medium">{selectedComposite.witnessAddress || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Verification Details */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" /> Verification
                  </h4>
                  <div className={cn(
                    "grid gap-4 p-4 rounded-lg",
                    isEditing ? "bg-muted" : "bg-muted/50"
                  )}>
                    <div className="grid gap-3">
                      {[
                        { label: 'Witness Consent', key: 'witnessConsent' },
                        { label: 'Initial Statement Recorded', key: 'initialStatementRecorded' },
                        { label: 'Witness Sobriety', key: 'witnessSobriety' },
                        { label: 'Case Assigned', key: 'caseAssigned' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <Label className="text-muted-foreground">{item.label}</Label>
                          {isEditing ? (
                            <Select defaultValue={selectedComposite[item.key] || 'no'}>
                              <SelectTrigger className="w-[100px] bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant={selectedComposite[item.key] === 'yes' ? 'default' : 'secondary'}>
                              {selectedComposite[item.key] === 'yes' ? 'Yes' : 'No'}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="max-w-[600px] p-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Composite Image
              <Badge variant="outline" className="ml-2">
                {selectedComposite?.id}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="aspect-[3/4] relative bg-muted/50 rounded-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="relative w-full h-full max-w-[400px] rounded-md bg-muted/30 flex items-center justify-center backdrop-blur-sm">
                  <FileText className="w-1/4 h-1/4 opacity-50" />
                  <div className="absolute inset-0 border-2 border-dashed border-muted-foreground/20 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 