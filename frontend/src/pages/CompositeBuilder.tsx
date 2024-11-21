import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, ChevronRight, 
  ZoomIn, ZoomOut, RotateCcw,
  ArrowLeft, Search, Filter,
  Save, CheckCircle, Check,
  Maximize2, RotateCw, X, ArrowRight, Loader2
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
import api from '@/lib/api'
import axios from 'axios'
import { useToast } from "@/hooks/use-toast"
import PreviewCanvas from '@/components/Canvas/PreviewCanvas'

interface Feature {
  id: string;
  url: string;
  category: string;
  type: number;
}

type FeatureCategory = 'faceShape' | 'nose' | 'mouth' | 'eyes' | 'eyebrows' | 'ears';

const FeaturePreview = ({ feature, gridZoom }: { feature: Feature; gridZoom: number }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = feature.url;
    img.onload = () => setImage(img);
  }, [feature.url]);

  if (!image) {
    return (
      <div className="w-full h-full bg-muted/50 animate-pulse" />
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      <img 
        src={feature.url}
        alt={feature.category}
        className="absolute w-full h-full object-cover transition-transform duration-200"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          transform: `scale(${gridZoom / 100})`
        }}
      />
    </div>
  );
};

export default function CompositeBuilder() {
  const navigate = useNavigate()
  const [currentFeature, setCurrentFeature] = useState<FeatureCategory>('faceShape')
  const [zoom, setZoom] = useState(300)
  const [showFinishDialog, setShowFinishDialog] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFeatures, setSelectedFeatures] = useState<Record<FeatureCategory, boolean>>({
    faceShape: false,
    eyes: false,
    eyebrows: false,
    nose: false,
    mouth: false,
    ears: false
  })
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [previewFeatures, setPreviewFeatures] = useState<Feature[]>([])
  const [gridZoom, setGridZoom] = useState(150)

  const placeholderFeatures = Array(9).fill(null)
  const featureCategories: FeatureCategory[] = [
    'faceShape', 
    'eyes', 
    'eyebrows', 
    'nose', 
    'mouth', 
    'ears'
  ];

  useEffect(() => {
    const fetchFeatures = async () => {
      setLoading(true);
      console.log('Fetching features for category:', currentFeature);
      try {
        const response = await api.get(`/api/features/${currentFeature}`);
        console.log('API Response:', response.data);
        
        if (response.data?.success && Array.isArray(response.data.data)) {
          if (response.data.data.length === 0) {
            console.warn(`No features found for category: ${currentFeature}`);
            // Show user-friendly message
            // toast.warning(`No ${currentFeature} features available`);
          }
          setFeatures(response.data.data);
        } else {
          console.error('Invalid response structure:', response.data);
          // Show error to user
          // toast.error(`Failed to load ${currentFeature} features`);
          setFeatures([]);
        }
      } catch (error) {
        console.error('Failed to fetch features:', error);
        // Show error to user
        // toast.error(`Error loading features: ${error.message}`);
        setFeatures([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [currentFeature]);

  // Calculate progress based on selected features
  const calculateProgress = () => {
    // This is a placeholder - implement actual progress calculation
    return 60
  }

  const handleFinish = () => {
    console.log('Navigating to editor...')
    navigate('/composite-editor')
  }

  const handleFeatureSelect = (feature: Feature) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [currentFeature]: true
    }))
    
    setPreviewFeatures(prev => {
      if (currentFeature === 'faceShape') {
        // If changing face shape, keep other features but update face shape
        const otherFeatures = prev.filter(f => f.category !== 'faceShape')
        return [
          {
            id: feature.id,
            url: feature.url,
            category: currentFeature,
            type: feature.type
          },
          ...otherFeatures
        ]
      } else {
        // For other features, keep existing behavior
        const filtered = prev.filter(f => f.category !== currentFeature)
        return [...filtered, {
          id: feature.id,
          url: feature.url,
          category: currentFeature,
          type: feature.type
        }]
      }
    })
  }

  const handleRefresh = () => {
    // Frontend only - would normally fetch new set from backend
    setSelectedFeatureId(null)
  }

  const getCategoryDisplay = (category: string) => {
    const mapping: Record<string, string> = {
      faceShape: 'Face Shape',
      eyes: 'Eyes',
      eyebrows: 'Eyebrows',
      nose: 'Nose',
      mouth: 'Mouth',
      ears: 'Ears'
    };
    return mapping[category] || category;
  };

  const handleSaveDraft = useCallback(async () => {
    try {
      // TODO: Implement actual save logic
      await api.post('/api/composites/draft', {
        features: selectedFeatures,
        currentFeature,
        progress
      })
      
      toast({
        title: "Draft saved",
        description: "Your composite has been saved as a draft"
      })
    } catch (error) {
      console.error('Failed to save draft:', error)
      toast({
        variant: "destructive",
        title: "Error saving draft",
        description: "Please try again later"
      })
    }
  }, [selectedFeatures, currentFeature, progress])

  const handleExit = useCallback(() => {
    const hasUnsavedChanges = Object.values(selectedFeatures).some(Boolean)
    
    if (!hasUnsavedChanges) {
      navigate('/dashboard')
      return
    }

    // Show confirmation only if there are changes
    const confirmed = window.confirm("Are you sure you want to exit? Any unsaved changes will be lost.")
    if (confirmed) {
      navigate('/dashboard')
    }
  }, [selectedFeatures, navigate])

  return (
    <div className="h-screen flex bg-background">
      {/* Left Panel - Fixed width */}
      <div className="w-80 flex-shrink-0 border-r bg-muted/5 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">Composite Builder</span>
          </div>
        </div>

        {/* Feature Categories */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {featureCategories.map((feature) => (
              <Button
                key={feature}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  currentFeature === feature 
                    ? "bg-accent text-accent-foreground" 
                    : "text-foreground hover:text-foreground hover:bg-accent"
                )}
                onClick={() => setCurrentFeature(feature)}
              >
                <div className="flex items-center w-full gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    {selectedFeatures[feature] && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <span className="select-none">{getCategoryDisplay(feature)}</span>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="p-4 border-t space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSaveDraft}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleExit}
          >
            <X className="h-4 w-4 mr-2" />
            Exit
          </Button>

          <Button
            className="w-full justify-start"
            onClick={() => setShowFinishDialog(true)}
            disabled={!Object.values(selectedFeatures).some(Boolean)}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Continue to Editor
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Recommended Features</h3>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => setGridZoom(Math.max(100, gridZoom - 20))}
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-8 text-center">
                    {gridZoom}%
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => setGridZoom(Math.min(200, gridZoom + 20))}
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4">
                {loading ? (
                  // Loading placeholders
                  Array(9).fill(null).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-muted/50 animate-pulse"
                    />
                  ))
                ) : features.length > 0 ? (
                  // Actual features
                  features.map((feature) => (
                    <div
                      key={feature.id}
                      className={cn(
                        "relative rounded-lg bg-muted/50 border-2 transition-all cursor-pointer overflow-hidden",
                        "hover:border-primary/50 hover:bg-muted/70",
                        selectedFeatureId === feature.id ? "border-primary" : "border-transparent"
                      )}
                      style={{ aspectRatio: '1' }}
                      onClick={() => {
                        setSelectedFeatureId(feature.id);
                        handleFeatureSelect({
                          id: feature.id,
                          url: feature.url,
                          category: currentFeature,
                          type: feature.type
                        });
                      }}
                    >
                      <FeaturePreview 
                        feature={feature} 
                        gridZoom={gridZoom} 
                      />
                      {selectedFeatureId === feature.id && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center text-muted-foreground py-8">
                    No features found for {getCategoryDisplay(currentFeature)}
                  </div>
                )}
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
          <div className="flex items-center justify-between">
            <span className="font-medium">Preview</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setShowPreviewDialog(true)}
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
          {/* Horizontal Zoom Controls for Preview Panel */}
          <div className="mt-3 flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setZoom(Math.max(75, zoom - 30))}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <div className="flex items-center bg-muted rounded-md px-2 flex-1">
              <Input 
                type="number" 
                value={zoom}
                onChange={(e) => setZoom(Math.min(900, Math.max(75, Number(e.target.value))))}
                className="h-7 text-center border-0 bg-transparent text-sm"
                min={75}
                max={900}
                step={30}
              />
              <span className="text-xs text-muted-foreground ml-1">%</span>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setZoom(Math.min(900, zoom + 30))}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="h-full rounded-lg border-2 border-dashed border-muted bg-muted/5 overflow-hidden">
            {previewFeatures.length > 0 ? (
              <PreviewCanvas
                width={300}
                height={400}
                features={previewFeatures}
                zoom={zoom}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  Select features to preview
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-background rounded-lg border shadow-lg overflow-hidden">
          {/* Header with title */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <DialogTitle>Preview</DialogTitle>
            </div>
          </div>

          {/* Preview Content */}
          <div className="w-full h-[calc(90vh-80px)] overflow-hidden relative">
            {/* Centered Zoom Controls */}
            <div className="absolute left-1/2 bottom-6 -translate-x-1/2 z-10 flex items-center gap-2 bg-background/95 p-2 rounded-lg border shadow-lg">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setZoom(Math.max(75, zoom - 30))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="flex items-center bg-muted rounded-md px-2">
                <Input 
                  type="number" 
                  value={zoom}
                  onChange={(e) => setZoom(Math.min(900, Math.max(75, Number(e.target.value))))}
                  className="h-8 w-16 text-center border-0 bg-transparent"
                  min={75}
                  max={900}
                  step={30}
                />
                <span className="text-sm text-muted-foreground ml-1">%</span>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setZoom(Math.min(900, zoom + 30))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Canvas */}
            <div className="h-full">
              {previewFeatures.length > 0 ? (
                <PreviewCanvas
                  width={window.innerWidth * 0.9}
                  height={window.innerHeight * 0.9 - 80}
                  features={previewFeatures}
                  zoom={zoom}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    Select features to preview
                  </span>
                </div>
              )}
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