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
  Eye, ZoomIn, ZoomOut, X, Check, User2, UserSquare2, Users, ClipboardCheck,
  RotateCw, Settings, Loader2, AlertTriangle, Pin
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
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [compositeToDelete, setCompositeToDelete] = useState<string | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    fileType: 'png',
    quality: 1
  })
  const [showBatchExportDialog, setShowBatchExportDialog] = useState(false)
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false)
  const [showProcessingDialog, setShowProcessingDialog] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<{
    total: number;
    current: number;
    completed: string[];
  }>({
    total: 0,
    current: 0,
    completed: []
  })
  const [isCancelling, setIsCancelling] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [operationStatus, setOperationStatus] = useState<{
    type: 'success' | 'error' | 'cancelled'
    operation: 'export' | 'delete'
    message: string
    itemCount?: number
  }>({
    type: 'success',
    operation: 'export',
    message: '',
  })
  const [pinnedItems, setPinnedItems] = useState<string[]>([]);
  
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
      // First sort by pinned status
      const isPinnedA = pinnedItems.includes(a.id);
      const isPinnedB = pinnedItems.includes(b.id);
      if (isPinnedA !== isPinnedB) return isPinnedB ? 1 : -1;
      
      // Then apply existing sort
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

  const handleSelectAll = () => {
    if (selectedItems.length === filteredComposites.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredComposites.map(c => c.id))
    }
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleBatchDelete = () => {
    setShowBatchDeleteDialog(true)
  }

  const handleBatchExport = () => {
    setShowBatchExportDialog(true)
  }

  const handleRefresh = () => {
    console.log('Refresh composite list')
  }

  const handlePreviewClick = (composite: typeof composites[0]) => {
    setSelectedComposite(composite)
    setPreviewOpen(true)
  }

  const handleEditImage = (compositeId: string) => {
    navigate(`/composite-editor/${compositeId}`)
  }

  const handleExportComposite = async (compositeId: string) => {
    setShowExportDialog(false)
    setShowProcessingDialog(true)
    setProcessingStatus({
      total: 1,
      current: 0,
      completed: []
    })

    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      setProcessingStatus(prev => ({
        ...prev,
        current: 1,
        completed: [compositeId]
      }))

      // Close dialog after delay
      await new Promise(resolve => setTimeout(resolve, 800))
      setShowProcessingDialog(false)
      
    } catch (error) {
      console.error('Failed to export:', error)
      setShowProcessingDialog(false)
    }
  }

  const handleDeselectAll = () => {
    setSelectedItems([])
  }

  const handleDeleteComposite = (compositeId: string) => {
    setCompositeToDelete(compositeId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!compositeToDelete) return
    
    // Close confirmation dialog and show processing dialog
    setDeleteDialogOpen(false)
    setShowProcessingDialog(true)
    setProcessingStatus({
      total: 1,
      current: 0,
      completed: []
    })

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Update progress
      setProcessingStatus(prev => ({
        ...prev,
        current: 1,
        completed: [compositeToDelete]
      }))

      // Close dialog after short delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setShowProcessingDialog(false)
      setCompositeToDelete(null)
      
    } catch (error) {
      console.error('Failed to delete:', error)
      // Handle error - could show error toast here
      setShowProcessingDialog(false)
      setCompositeToDelete(null)
    }
  }

  const handleConfirmBatchDelete = async () => {
    setShowBatchDeleteDialog(false)
    setShowProcessingDialog(true)
    setIsCancelling(false)
    setProcessingStatus({
      total: selectedItems.length,
      current: 0,
      completed: []
    })

    try {
      for (let i = 0; i < selectedItems.length; i++) {
        if (isCancelling) break;
        
        const id = selectedItems[i]
        await new Promise(resolve => setTimeout(resolve, 800))
        
        setProcessingStatus(prev => ({
          ...prev,
          current: i + 1,
          completed: [...prev.completed, id]
        }))
      }

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 500))
      setShowProcessingDialog(false)

      if (!isCancelling) {
        // Show success dialog
        setShowStatusDialog(true)
        setOperationStatus({
          type: 'success',
          operation: 'delete',
          message: 'Files were successfully deleted',
          itemCount: processingStatus.completed.length
        })
        setSelectedItems([])
      } else {
        // Show cancelled dialog
        setShowStatusDialog(true)
        setOperationStatus({
          type: 'cancelled',
          operation: 'delete',
          message: 'Delete operation was cancelled',
          itemCount: processingStatus.completed.length
        })
      }
    } catch (error) {
      setShowProcessingDialog(false)
      // Show error dialog
      setShowStatusDialog(true)
      setOperationStatus({
        type: 'error',
        operation: 'delete',
        message: 'An error occurred while deleting files',
        itemCount: processingStatus.completed.length
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const handleConfirmBatchExport = async () => {
    setShowBatchExportDialog(false)
    setShowProcessingDialog(true)
    setIsCancelling(false)
    setProcessingStatus({
      total: selectedItems.length,
      current: 0,
      completed: []
    })

    try {
      for (let i = 0; i < selectedItems.length; i++) {
        if (isCancelling) break;
        
        const id = selectedItems[i]
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setProcessingStatus(prev => ({
          ...prev,
          current: i + 1,
          completed: [...prev.completed, id]
        }))
      }

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 500))
      setShowProcessingDialog(false)

      if (!isCancelling) {
        // Show success dialog
        setShowStatusDialog(true)
        setOperationStatus({
          type: 'success',
          operation: 'export',
          message: 'Files were successfully exported',
          itemCount: processingStatus.completed.length
        })
      } else {
        // Show cancelled dialog
        setShowStatusDialog(true)
        setOperationStatus({
          type: 'cancelled',
          operation: 'export',
          message: 'Export operation was cancelled',
          itemCount: processingStatus.completed.length
        })
      }
    } catch (error) {
      setShowProcessingDialog(false)
      // Show error dialog
      setShowStatusDialog(true)
      setOperationStatus({
        type: 'error',
        operation: 'export',
        message: 'An error occurred while exporting files',
        itemCount: processingStatus.completed.length
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const handlePinItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    setPinnedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const renderListView = (composites: typeof composites[0][]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={selectedItems.length === filteredComposites.length}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
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
            <TableRow 
              key={composite.id}
              className={cn(
                "group",
                selectedItems.includes(composite.id) && "bg-accent/50"
              )}
            >
              <TableCell>
                <Checkbox 
                  checked={selectedItems.includes(composite.id)}
                  onCheckedChange={() => handleSelectItem(composite.id)}
                />
              </TableCell>
              <TableCell>
                <div className="relative w-32 h-40 rounded-md bg-muted/30 flex items-center justify-center group-hover:ring-2 ring-primary/20 transition-all">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <div className="absolute inset-0 border border-dashed border-muted-foreground/20 rounded-md" />
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
                    <DropdownMenuItem 
                      className="text-destructive gap-2 cursor-pointer"
                      onClick={() => handleDeleteComposite(composite.id)}
                      disabled={compositeToDelete === composite.id}
                    >
                      {compositeToDelete === composite.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" /> 
                          Delete Case
                        </>
                      )}
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
            className={cn(
              "group relative flex-grow basis-[300px] min-w-[300px] max-w-[400px] flex flex-col bg-card rounded-xl border transition-all duration-200",
              selectedItems.includes(composite.id) && "ring-2 ring-primary bg-accent/5",
              "hover:bg-accent/5"
            )}
          >
            {/* Checkbox - Make it more visible and accessible */}
            <div className="absolute top-3 left-3 z-20">
              <Checkbox 
                checked={selectedItems.includes(composite.id)}
                onCheckedChange={() => handleSelectItem(composite.id)}
                className={cn(
                  "h-5 w-5 bg-background/50 backdrop-blur-sm transition-opacity cursor-pointer",
                  "opacity-100" // Always visible
                )}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    handleSelectItem(composite.id)
                  }
                }}
              />
            </div>

            {/* Preview Section with Hover Actions */}
            <div className="relative aspect-[3/4] rounded-t-xl bg-muted/50 overflow-hidden">
              {/* Pin Button - Top Right */}
              <Button 
                variant="ghost" 
                size="icon"
                className={cn(
                  "absolute top-2 right-2 z-20 h-8 w-8 transition-all",
                  pinnedItems.includes(composite.id) 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-background/20"
                )}
                onClick={(e) => handlePinItem(composite.id, e)}
                aria-label={pinnedItems.includes(composite.id) ? "Unpin composite" : "Pin composite"}
              >
                <Pin className={cn(
                  "h-4 w-4 transition-transform",
                  pinnedItems.includes(composite.id) && "fill-current"
                )} />
              </Button>

              {/* ID and Case Info - Bottom Left Overlay */}
              <div className="absolute bottom-3 left-3 z-10">
                <div className="flex flex-col gap-1 text-xs text-white/90">
                  <span className="font-medium">{composite.id}</span>
                  <span>Case #{composite.caseId}</span>
                </div>
              </div>

              {/* Status Badge - Bottom Right */}
              <div className="absolute bottom-3 right-3 z-10">
                <Badge 
                  variant={composite.status === "Active" ? "default" : "secondary"}
                  className="text-[10px] px-1.5 py-0"
                >
                  {composite.status}
                </Badge>
              </div>

              {/* Preview Content */}
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground p-6">
                <div className="text-center space-y-3">
                  <div className="relative w-24 h-32 mx-auto rounded-md bg-muted/30 flex items-center justify-center backdrop-blur-sm">
                    <FileText className="h-12 w-12 opacity-50" />
                    <div className="absolute inset-0 border-2 border-dashed border-muted-foreground/20 rounded-md animate-pulse" />
                  </div>
                  <span className="text-sm font-medium inline-block">Composite Preview</span>
                </div>
              </div>

              {/* Hover Actions - Stop propagation to prevent selection */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/50 to-transparent opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col gap-2 z-30">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="shadow-lg hover:shadow-xl transition-all w-32"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePreviewClick(composite)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" /> View Details
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="shadow-lg hover:shadow-xl transition-all w-32"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditImage(composite.id)
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit Image
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="shadow-lg hover:shadow-xl transition-all w-32"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExportComposite(composite.id)
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                  
                  {/* Add Separator */}
                  <Separator className="w-24 mx-auto opacity-50" />
                  
                  {/* Delete Button */}
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className={cn(
                      "shadow-lg hover:shadow-xl transition-all w-32 hover:bg-destructive hover:text-destructive-foreground",
                      compositeToDelete === composite.id && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteComposite(composite.id)
                    }}
                    disabled={compositeToDelete === composite.id}
                  >
                    {compositeToDelete === composite.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" /> 
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <CardContent className="p-4 flex-1 flex flex-col">
              {/* Title Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base truncate">
                    {composite.name}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <div className="mt-3 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {composite.description}
                </p>
              </div>

              {/* Subject Details */}
              <div className="mt-4 pt-3 border-t space-y-2">
                {/* Demographics */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary/70" />
                      <span className="font-medium">{composite.gender}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{composite.ageRange}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary/70" />
                    <span className="font-medium">{composite.ethnicity}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Enhanced Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search and Filters Group */}
        <div className="flex flex-1 items-center gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search composites..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
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

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[160px]">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {sortOrder === "newest" && <Clock className="h-4 w-4" />}
                  {sortOrder === "oldest" && <Clock className="h-4 w-4 rotate-180" />}
                  {sortOrder === "name" && <SortAsc className="h-4 w-4" />}
                  {sortOrder === "name-desc" && <SortDesc className="h-4 w-4" />}
                  <span>{sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1)}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Newest First</span>
                </div>
              </SelectItem>
              <SelectItem value="oldest">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 rotate-180" />
                  <span>Oldest First</span>
                </div>
              </SelectItem>
              <SelectItem value="name">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4" />
                  <span>Name (A-Z)</span>
                </div>
              </SelectItem>
              <SelectItem value="name-desc">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-4 w-4" />
                  <span>Name (Z-A)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Controls and Actions */}
        <div className="flex items-center gap-2">
          {/* Selection Controls - Show only when items are selected */}
          {selectedItems.length > 0 ? (
            <div className="flex items-center gap-2 mr-2 animate-in fade-in slide-in-from-left-5">
              <span className="text-sm text-muted-foreground">
                {selectedItems.length} selected
              </span>
              <Separator orientation="vertical" className="h-6" />
              
              {/* Select/Deselect All Buttons */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-9 w-9"
                      onClick={handleSelectAll}
                    >
                      <Checkbox 
                        checked={selectedItems.length === filteredComposites.length}
                        className="h-4 w-4"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {selectedItems.length === filteredComposites.length ? 'Deselect all' : 'Select all'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Batch Actions */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-9 w-9"
                      onClick={handleBatchDelete}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete selected</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-9 w-9"
                      onClick={handleBatchExport}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export selected</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <div className="flex items-center gap-2 mr-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-9 w-9"
                      onClick={handleRefresh}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh list</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* View Toggle Group */}
          <div className="bg-muted/50 rounded-lg p-1 flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid view</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List view</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button 
            onClick={() => setDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Composite
          </Button>
        </div>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this composite? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Composite
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Options</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label>File Type</label>
              <Select
                value={exportSettings.fileType}
                onValueChange={(value) => setExportSettings(prev => ({ ...prev, fileType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (Lossless)</SelectItem>
                  <SelectItem value="jpg">JPG (Smaller size)</SelectItem>
                  <SelectItem value="webp">WebP (Modern format)</SelectItem>
                  <SelectItem value="pdf">PDF (Document)</SelectItem>
                  <SelectItem value="psd">PSD (Adobe Photoshop)</SelectItem>
                  <SelectItem value="ai">AI (Adobe Illustrator)</SelectItem>
                  <SelectItem value="eps">EPS (Vector format)</SelectItem>
                  <SelectItem value="tiff">TIFF (Print quality)</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {exportSettings.fileType === 'psd' && "Adobe Photoshop format with layers preserved"}
                {exportSettings.fileType === 'ai' && "Adobe Illustrator vector format"}
                {exportSettings.fileType === 'eps' && "Encapsulated PostScript for vector graphics"}
                {exportSettings.fileType === 'tiff' && "High-quality format for print"}
              </span>
            </div>

            {/* Show quality slider only for formats that support it */}
            {(exportSettings.fileType === 'jpg' || exportSettings.fileType === 'webp') && (
              <div className="grid gap-2">
                <label>Quality</label>
                <Slider
                  value={[exportSettings.quality * 100]}
                  onValueChange={([value]) => setExportSettings(prev => ({ ...prev, quality: value / 100 }))}
                  min={1}
                  max={100}
                  step={1}
                />
                <span className="text-sm text-muted-foreground">{Math.round(exportSettings.quality * 100)}%</span>
              </div>
            )}

            {/* Add warning for Adobe formats */}
            {(['psd', 'ai', 'eps'].includes(exportSettings.fileType)) && (
              <div className="bg-yellow-500/15 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm p-3 rounded-md">
                {exportSettings.fileType === 'psd' && 
                  "Note: Will export as PNG with .psd extension. Open in Photoshop for further editing."
                }
                {exportSettings.fileType === 'ai' && 
                  "Note: Will export as SVG with .ai extension. Open in Illustrator for vector editing."
                }
                {exportSettings.fileType === 'eps' && 
                  "Note: Will export as SVG with .eps extension. Compatible with vector editing software."
                }
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleExportComposite}>
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBatchDeleteDialog} onOpenChange={setShowBatchDeleteDialog}>
        <DialogContent className="max-w-[800px] max-h-[85vh] p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete {selectedItems.length} Composites
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. These composites will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-8 overflow-hidden">
            {/* Left Side - Selected Items */}
            <div className="w-[300px] border-r pr-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Selected Items</label>
                <Badge variant="destructive" className="font-normal">
                  {selectedItems.length} to delete
                </Badge>
              </div>
              
              <ScrollArea className="h-[400px] -mx-2 px-2">
                <div className="space-y-2 pr-2">
                  {filteredComposites
                    .filter(composite => selectedItems.includes(composite.id))
                    .map(composite => (
                      <div 
                        key={composite.id} 
                        className="group flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-destructive/50 transition-colors"
                      >
                        <div className="w-10 h-14 bg-muted rounded flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {composite.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{composite.id}</span>
                            <span>•</span>
                            <span>Case #{composite.caseId}</span>
                          </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleSelectItem(composite.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </ScrollArea>

              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Tip: Click X to remove items from selection
                </p>
              </div>
            </div>

            {/* Right Side - Warning and Confirmation */}
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <div className="bg-destructive/10 dark:bg-destructive/5 border-l-4 border-destructive p-4 rounded-r-lg">
                  <h4 className="font-medium text-destructive mb-2">Warning</h4>
                  <ul className="space-y-2 text-sm text-destructive/90">
                    <li className="flex items-start gap-2">
                      <span className="rounded-full h-1.5 w-1.5 bg-destructive mt-1.5 shrink-0" />
                      All selected composites will be permanently deleted
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full h-1.5 w-1.5 bg-destructive mt-1.5 shrink-0" />
                      Associated case data and files will also be removed
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full h-1.5 w-1.5 bg-destructive mt-1.5 shrink-0" />
                      This action cannot be reversed
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Confirmation</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="confirmDelete" />
                    <Label htmlFor="confirmDelete" className="text-sm font-normal">
                      I understand that this action is permanent and cannot be undone
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowBatchDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              className="gap-2 min-w-[140px]"
              onClick={handleConfirmBatchDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete {selectedItems.length} Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBatchExportDialog} onOpenChange={setShowBatchExportDialog}>
        <DialogContent className="max-w-[800px] max-h-[85vh] p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>Export {selectedItems.length} Composites</DialogTitle>
            <DialogDescription>
              Choose export format and configure settings
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-8 overflow-hidden">
            {/* Left Side - Selected Items */}
            <div className="w-[300px] border-r pr-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Selected Items</label>
                <Badge variant="secondary" className="font-normal">
                  {selectedItems.length} selected
                </Badge>
              </div>
              
              <ScrollArea className="h-[400px] -mx-2 px-2">
                <div className="space-y-2 pr-2">
                  {filteredComposites
                    .filter(composite => selectedItems.includes(composite.id))
                    .map(composite => (
                      <div 
                        key={composite.id} 
                        className="group flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="w-10 h-14 bg-muted rounded flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {composite.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{composite.id}</span>
                            <span>•</span>
                            <span>Case #{composite.caseId}</span>
                          </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleSelectItem(composite.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </ScrollArea>

              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Tip: Click X to remove items from selection
                </p>
              </div>
            </div>

            {/* Right Side - Export Settings */}
            <div className="flex-1 space-y-6">
              {/* Export Format Selection */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Export Format</label>
                <RadioGroup defaultValue="individual" className="grid grid-cols-2 gap-2">
                  <div className="flex items-start space-x-3 space-y-0">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="font-normal">
                      <span className="block text-sm font-medium mb-1">Individual Files</span>
                      <span className="block text-xs text-muted-foreground">
                        Export each composite as a separate file
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 space-y-0">
                    <RadioGroupItem value="zip" id="zip" />
                    <Label htmlFor="zip" className="font-normal">
                      <span className="block text-sm font-medium mb-1">ZIP Archive</span>
                      <span className="block text-xs text-muted-foreground">
                        Package all files into a single ZIP
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* File Settings */}
              <div className="space-y-4">
                <label className="text-sm font-medium">File Settings</label>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>File Type</Label>
                    <Select
                      value={exportSettings.fileType}
                      onValueChange={(value) => setExportSettings(prev => ({ ...prev, fileType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG (Lossless)</SelectItem>
                        <SelectItem value="jpg">JPG (Smaller size)</SelectItem>
                        <SelectItem value="webp">WebP (Modern format)</SelectItem>
                        <SelectItem value="pdf">PDF (Document)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(exportSettings.fileType === 'jpg' || exportSettings.fileType === 'webp') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label>Quality</Label>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(exportSettings.quality * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[exportSettings.quality * 100]}
                        onValueChange={([value]) => setExportSettings(prev => ({ ...prev, quality: value / 100 }))}
                        min={1}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Additional Options */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Additional Options</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="includeMetadata" />
                    <Label htmlFor="includeMetadata" className="text-sm font-normal">
                      Include case metadata
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="includePreview" defaultChecked />
                    <Label htmlFor="includePreview" className="text-sm font-normal">
                      Include preview images
                    </Label>
                  </div>
                </div>
              </div>

              {/* Save Location */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Save Location</Label>
                <div className="flex gap-2">
                  <Input 
                    value="/downloads/composites/"
                    readOnly
                    className="flex-1 bg-muted text-sm font-mono"
                  />
                  <Button variant="outline" size="sm">
                    Browse
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowBatchExportDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="gap-2 min-w-[140px]"
              onClick={handleConfirmBatchExport}
            >
              <Download className="h-4 w-4" />
              Export Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showProcessingDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-6 w-6 animate-spin">
                <Loader2 className="h-6 w-6" />
              </div>
              {isCancelling ? 'Cancelling Process' : 
                processingStatus.total > 1 ? 'Exporting Composites' : 'Exporting Composite'
              }
            </DialogTitle>
            <DialogDescription>
              {isCancelling ? 
                'Stopping the current operation...' :
                `Please wait while ${processingStatus.total > 1 ? 'your files are' : 'your file is'} being exported...`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="text-muted-foreground">
                  {isCancelling ? 
                    'Cancelling...' :
                    `${processingStatus.current} of ${processingStatus.total} files`
                  }
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    isCancelling ? "bg-yellow-500" : "bg-primary"
                  )}
                  style={{ 
                    width: `${(processingStatus.current / processingStatus.total) * 100}%` 
                  }} 
                />
              </div>
            </div>

            {/* Files List */}
            <div className="space-y-2">
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  {selectedItems.map(id => {
                    const composite = filteredComposites.find(c => c.id === id)
                    const isCompleted = processingStatus.completed.includes(id)
                    const isProcessing = !isCompleted && 
                      processingStatus.completed.length === selectedItems.indexOf(id)
                    const isCancelled = isCancelling && !isCompleted
                    
                    return (
                      <div 
                        key={id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg border bg-card transition-colors",
                          isCompleted && "border-muted bg-muted/50",
                          isCancelled && "border-yellow-500/20 bg-yellow-500/5"
                        )}
                      >
                        {/* Status Icon */}
                        <div className="h-5 w-5 flex items-center justify-center">
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : isCompleted ? (
                            <Check className="h-4 w-4 text-primary animate-in zoom-in" />
                          ) : isCancelled ? (
                            <X className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <div className="h-4 w-4" />
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "text-sm truncate transition-colors",
                            isCompleted && "text-muted-foreground",
                            isCancelled && "text-yellow-500/80"
                          )}>
                            {composite?.name}
                            {isCancelled && " (Cancelled)"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {composite?.id}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCancelling(true)}
              disabled={isCancelling}
              className="gap-2"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {operationStatus.type === 'success' && (
                <>
                  <Check className="h-5 w-5 text-primary" />
                  {operationStatus.operation === 'export' ? 'Export Complete' : 'Delete Complete'}
                </>
              )}
              {operationStatus.type === 'error' && (
                <>
                  <X className="h-5 w-5 text-destructive" />
                  {operationStatus.operation === 'export' ? 'Export Failed' : 'Delete Failed'}
                </>
              )}
              {operationStatus.type === 'cancelled' && (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Operation Cancelled
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {operationStatus.message}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {operationStatus.itemCount !== undefined && (
              <div className={cn(
                "p-4 rounded-lg",
                operationStatus.type === 'success' && "bg-primary/10 text-primary",
                operationStatus.type === 'error' && "bg-destructive/10 text-destructive",
                operationStatus.type === 'cancelled' && "bg-yellow-500/10 text-yellow-500"
              )}>
                <div className="text-sm font-medium">Operation Summary</div>
                <div className="text-sm mt-1">
                  {operationStatus.type === 'success' && (
                    `Successfully ${operationStatus.operation}ed ${operationStatus.itemCount} files`
                  )}
                  {operationStatus.type === 'error' && (
                    `${operationStatus.itemCount} files were processed before the error occurred`
                  )}
                  {operationStatus.type === 'cancelled' && (
                    `${operationStatus.itemCount} files were processed before cancellation`
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant={operationStatus.type === 'error' ? 'destructive' : 'default'}
              onClick={() => setShowStatusDialog(false)}
            >
              {operationStatus.type === 'error' ? 'Close' : 'Done'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 