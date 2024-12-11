import { useState, useEffect, useCallback, useRef } from "react"
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
import { analyzeSkinTone, blendFeatures } from '@/lib/colorMatching';
import { 
  FaceIcon, 
  EyeOpenIcon, 
  PersonIcon,
  Cross2Icon,
  DotFilledIcon,
  MixerHorizontalIcon
} from "@radix-ui/react-icons"

interface Feature {
  id: string;
  url: string;
  category: string;
  type: number;
}

type FeatureCategory = 'faceShape' | 'nose' | 'mouth' | 'eyes' | 'eyebrows' | 'ears';

interface SelectedFeatureIds {
  faceShape?: string;
  eyes?: string;
  eyebrows?: string;
  nose?: string;
  mouth?: string;
  ears?: string;
}

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
  const [zoom, setZoom] = useState(250)
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
  const [dialogSize, setDialogSize] = useState({ width: 0, height: 0 });
  const previewContentRef = useRef<HTMLDivElement>(null);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<SelectedFeatureIds>({});
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [showSaveDraftDialog, setShowSaveDraftDialog] = useState(false)

  const placeholderFeatures = Array(9).fill(null)
  const featureCategories: FeatureCategory[] = [
    'faceShape', 
    'eyes', 
    'eyebrows', 
    'nose', 
    'mouth', 
    'ears'
  ];

  const featureIcons: Record<string, React.ReactNode> = {
    faceShape: <FaceIcon className="h-4 w-4" />,
    eyes: <EyeOpenIcon className="h-4 w-4" />,
    eyebrows: <MixerHorizontalIcon className="h-4 w-4" />,
    nose: <DotFilledIcon className="h-4 w-4" />,
    mouth: <Cross2Icon className="h-4 w-4 rotate-45" />,
    ears: <PersonIcon className="h-4 w-4" />
  };

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
    const selectedCount = Object.values(selectedFeatures).filter(Boolean).length;
    return (selectedCount / featureCategories.length) * 100;
  };

  const handleFinish = () => {
    console.log('Navigating to editor with features:', previewFeatures)
    navigate('/composite-editor', { 
      state: { 
        features: previewFeatures,
        zoom: zoom
      } 
    })
  }

  const handleFeatureSelect = async (feature: Feature) => {
    console.log('Feature selected:', { feature, currentFeature });
    
    setSelectedFeatureIds(prev => ({
      ...prev,
      [currentFeature]: feature.id
    }));

    setSelectedFeatures(prev => ({
      ...prev,
      [currentFeature]: true
    }));
    
    try {
      setPreviewFeatures(prev => {
        console.log('Current preview features:', prev);
        
        if (currentFeature === 'faceShape') {
          const otherFeatures = prev.filter(f => f.category !== 'faceShape');
          const newFeatures = [
            {
              ...feature,
              isBase: true
            },
            ...otherFeatures
          ];
          console.log('Updated features with face shape:', newFeatures);
          return newFeatures;
        } else {
          const faceShape = prev.find(f => f.category === 'faceShape');
          if (!faceShape) {
            toast({
              title: "Face shape required",
              description: "Please select a face shape first",
              variant: "destructive"
            });
            return prev;
          }

          const filtered = prev.filter(f => f.category !== currentFeature);
          const newFeatures = [...filtered, {
            ...feature,
            needsBlending: true,
            blendSettings: {
              category: currentFeature
            }
          }];
          console.log('Updated features with new component:', newFeatures);
          return newFeatures;
        }
      });
    } catch (error) {
      console.error('Error processing feature:', error);
      toast({
        title: "Error processing feature",
        description: "Failed to analyze and blend feature colors",
        variant: "destructive"
      });
    }
  };

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

    setShowExitDialog(true)
  }, [selectedFeatures])

  useEffect(() => {
    if (!previewContentRef.current) return;

    const updateSize = () => {
      const element = previewContentRef.current;
      if (element) {
        setDialogSize({
          width: element.clientWidth,
          height: element.clientHeight
        });
      }
    };

    // Initial size
    updateSize();

    // Create resize observer
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(previewContentRef.current);

    return () => {
      if (previewContentRef.current) {
        resizeObserver.unobserve(previewContentRef.current);
      }
    };
  }, [showPreviewDialog]);

  return (
    <div className="h-screen flex bg-background">
      {/* Left Panel - Fixed width */}
      <div className="w-64 flex-shrink-0 border-r bg-muted/5 flex flex-col">
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
          <div className="p-3 space-y-1">
            <div className="mb-4">
              <h2 className="px-2 mb-2 text-lg font-semibold tracking-tight">
                Features
              </h2>
              <p className="px-2 text-sm text-muted-foreground mb-4">
                Select features to build your composite
              </p>
              <Progress value={calculateProgress()} className="h-2 mb-2" />
              <p className="px-2 text-xs text-muted-foreground">
                {Object.values(selectedFeatures).filter(Boolean).length} of {featureCategories.length} features selected
              </p>
            </div>

            {featureCategories.map((feature) => (
              <Button
                key={feature}
                variant={currentFeature === feature ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-between px-2 py-4 h-auto",
                  currentFeature === feature && "bg-accent",
                  !selectedFeatures[feature] && "text-muted-foreground"
                )}
                onClick={() => setCurrentFeature(feature)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center",
                    currentFeature === feature ? "bg-primary/10" : "bg-muted",
                  )}>
                    {featureIcons[feature]}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {getCategoryDisplay(feature)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {selectedFeatures[feature] ? "Selected" : "Not selected"}
                    </span>
                  </div>
                </div>
                {selectedFeatures[feature] && (
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="p-4 border-t space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowSaveDraftDialog(true)}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowExitDialog(true)}
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
                        selectedFeatureIds[currentFeature] === feature.id ? "border-primary" : "border-transparent"
                      )}
                      style={{ aspectRatio: '1' }}
                      onClick={() => handleFeatureSelect(feature)}
                    >
                      <FeaturePreview 
                        feature={feature} 
                        gridZoom={gridZoom} 
                      />
                      {selectedFeatureIds[currentFeature] === feature.id && (
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
      <div className="w-96 flex-shrink-0 border-l bg-muted/5 flex flex-col">
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
                className="h-7 text-center border-0 bg-transparent text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          <div className="h-full rounded-lg border-2 border-dashed border-muted bg-muted/5 overflow-hidden relative">
            {previewFeatures.length > 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <PreviewCanvas
                  width={384}
                  height={512}
                  features={previewFeatures}
                  zoom={zoom}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
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
          {/* Header with title and zoom controls */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="w-24">Preview</DialogTitle>
              <div className="flex-1 flex items-center justify-center gap-2">
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
                    className="h-8 w-16 text-center border-0 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
              <div className="w-24"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Preview Content */}
          <div 
            ref={previewContentRef}
            className="w-full h-[calc(90vh-80px)] overflow-hidden relative"
          >
            {/* Canvas */}
            <div className="h-full">
              {previewFeatures.length > 0 ? (
                <PreviewCanvas
                  width={dialogSize.width}
                  height={dialogSize.height}
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

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Composite Builder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit? Any unsaved changes will be lost and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              variant="destructive"
              onClick={() => {
                setShowExitDialog(false)
                navigate('/dashboard')
              }}
            >
              Exit Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Draft Dialog */}
      <AlertDialog open={showSaveDraftDialog} onOpenChange={setShowSaveDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to save your current progress as a draft? You can continue working on it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                handleSaveDraft();
                setShowSaveDraftDialog(false);
              }}
            >
              Save Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 