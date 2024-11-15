import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, ChevronRight, 
  ZoomIn, ZoomOut, RotateCcw,
  ArrowLeft, Search, Filter,
  Save, CheckCircle, Check,
  Maximize2, RotateCw, X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPrimitive,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

type FeatureCategory = 'faceShape' | 'nose' | 'mouth' | 'eyes' | 'eyebrows'

export default function CompositeBuilder() {
  const navigate = useNavigate()
  const [currentFeature, setCurrentFeature] = useState<FeatureCategory>('faceShape')
  const [zoom, setZoom] = useState(100)
  const [showFinishDialog, setShowFinishDialog] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFeatures, setSelectedFeatures] = useState<Record<FeatureCategory, boolean>>({
    faceShape: false,
    nose: false,
    mouth: false,
    eyes: false,
    eyebrows: false
  })
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  const placeholderFeatures = Array(9).fill(null)
  const features: FeatureCategory[] = ['faceShape', 'nose', 'mouth', 'eyes', 'eyebrows']

  // Calculate progress based on selected features
  const calculateProgress = () => {
    // This is a placeholder - implement actual progress calculation
    return 60
  }

  const handleFinish = () => {
    console.log('Navigating to editor...')
    navigate('/composite-editor')
  }

  const handleFeatureSelect = () => {
    setSelectedFeatures(prev => ({
      ...prev,
      [currentFeature]: true
    }))
  }

  const handleRefresh = () => {
    // Frontend only - would normally fetch new set from backend
    setSelectedFeatureId(null)
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Left Panel - Fixed width */}
      <div className="w-72 flex-shrink-0 border-r bg-muted/5 flex flex-col">
        {/* Back Navigation */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold">Feature Selection</h1>
          </div>
        </div>

        {/* Feature Categories - Vertical Buttons */}
        <div className="flex-1 p-4">
          <div className="space-y-4">
            <div className="text-sm text-foreground/70">
              Select initial features for each category before proceeding to the detailed editor.
            </div>
            <div className="space-y-1">
              {features.map((feature) => (
                <Button
                  key={feature}
                  variant={currentFeature === feature ? "default" : "ghost"}
                  onClick={() => setCurrentFeature(feature)}
                  className={cn(
                    "w-full justify-start h-9 px-3 text-sm group",
                    currentFeature === feature 
                      ? "bg-primary/10 text-primary hover:text-primary" 
                      : "text-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <div className="flex items-center w-full gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      {selectedFeatures[feature] && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <span className="select-none">{feature.charAt(0).toUpperCase() + feature.slice(1)}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t space-y-2">
          <Button 
            className="w-full"
            onClick={() => setShowFinishDialog(true)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Continue to Editor
          </Button>
          <Button variant="outline" className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Selection
          </Button>
        </div>
      </div>

      {/* Main Content Area - Zoomable */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search features..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Separator orientation="vertical" className="h-8" />
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Recommended Features</h3>
              <div className="grid grid-cols-3 gap-6">
                {placeholderFeatures.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative rounded-lg bg-muted/50 border-2 transition-all cursor-pointer",
                      "hover:border-primary/50 hover:bg-muted/70",
                      selectedFeatureId === i ? "border-primary" : "border-transparent"
                    )}
                    style={{ aspectRatio: '1' }}
                    onClick={() => {
                      setSelectedFeatureId(i)
                      handleFeatureSelect()
                    }}
                  >
                    {selectedFeatureId === i && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {searchQuery && (
              <div>
                <h3 className="text-sm font-medium mb-3">Search Results</h3>
                <div className="grid grid-cols-3 gap-6">
                  {/* Search results would go here - using placeholder for now */}
                  {Array(3).fill(null).map((_, i) => (
                    <div
                      key={`search-${i}`}
                      className="relative rounded-lg bg-muted/50 border-2 border-transparent hover:border-primary/50 hover:bg-muted/70 transition-all cursor-pointer"
                      style={{ aspectRatio: '1' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Fixed width */}
      <div className="w-80 flex-shrink-0 border-l bg-muted/5 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Preview</span>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => setShowPreviewDialog(true)}
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <div className="flex-1">
              <Input 
                type="number" 
                value={zoom}
                onChange={(e) => setZoom(Math.min(150, Math.max(50, Number(e.target.value))))}
                className="h-7 text-center"
                min={50}
                max={150}
                step={10}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setZoom(Math.min(150, zoom + 10))}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 p-4">
          <div 
            className="h-full rounded-lg border-2 border-dashed border-muted bg-muted/5 overflow-hidden"
          >
            <div 
              className="w-full h-full flex items-center justify-center transform-gpu"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
              }}
            >
              <span className="text-sm text-muted-foreground">Basic Preview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[90vw] max-h-[90vh] p-0 bg-background rounded-lg border shadow-lg overflow-hidden">
          {/* Header with controls */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <DialogTitle>Preview</DialogTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="flex items-center bg-muted rounded-md px-2">
                  <Input 
                    type="number" 
                    value={zoom}
                    onChange={(e) => setZoom(Math.min(150, Math.max(50, Number(e.target.value))))}
                    className="h-8 w-16 text-center border-0 bg-transparent"
                    min={50}
                    max={150}
                    step={10}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setZoom(Math.min(150, zoom + 10))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <div 
              className="absolute inset-0 flex items-center justify-center bg-muted/5"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
                minHeight: `${100 / (zoom / 100)}%`,
                minWidth: `${100 / (zoom / 100)}%`,
              }}
            >
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-muted m-4 rounded-lg">
                <span className="text-sm text-muted-foreground">Basic Preview</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Continue Dialog */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Continue to Editor</AlertDialogTitle>
            <AlertDialogDescription>
              Proceed to the detailed composite editor? You can still modify your initial selections there.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay Here</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinish}>
              Continue to Editor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 