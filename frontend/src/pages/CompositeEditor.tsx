import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { 
  FileIcon, Save, Download, Undo, Redo,
  Layers, Sliders, Move, 
  ImageIcon, 
  ArrowDownUp, PanelLeftClose, PanelLeftOpen,
  Eye, EyeOff, Trash2, Import, ArrowUpDown,
  GripVertical, Plus,
  ArrowUp, ArrowRight, ArrowDown, ArrowLeft,
  RotateCcw, RotateCw,
  StretchHorizontal, StretchVertical,
  ArrowUpLeft, ArrowDownLeft, ArrowUpRight, ArrowDownRight,
  Maximize2, Minimize2,
  ChevronsUpDown, ChevronsLeftRight,
  Search, Filter, X, Check,
  MoveHorizontal, MoveVertical,
  ArrowLeftRight,
  CircleDot, SmilePlus, HeadphonesIcon, Minus, CircleUser,
  ZoomOut, ZoomIn,
  Printer,
  Brush, Eraser,
  Loader2,
  ArrowLeftCircle,
  AlertTriangle,
  Share2, 
  History, 
  HelpCircle, 
  Settings2,
  Keyboard,
  Grid,
  Magnet,
  MousePointer,
  Zap,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import api from '@/lib/api'
import Canvas from '@/components/Canvas/Canvas'
import { createFeatherMask, analyzeAndBlendFeature } from '@/lib/colorBlending';
import { useLocation } from "react-router-dom"
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DraggableLayer } from "@/components/DraggableLayer"
import { toast } from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { analyzeFacialSkin } from '@/lib/skinAnalysis';
import { debounce } from 'lodash';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import jsPDF from 'jspdf';
import { Stage, Layer, Line } from 'react-konva'
import { NewCompositeDialog } from "@/components/dialogs/NewCompositeDialog"
import Konva from 'konva';
import { useNavigate } from "react-router-dom"
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
import { Switch } from "@/components/ui/switch"

interface TransformSettings {
  face: {
    shape: { oval: number, round: number, triangular: number, square: number, angular: number },
    features: { fleshiness: number },
    jaw: { oval: number, rounded: number, pointed: number, square: number, angular: number, dimpled: number }
  },
  lips: {
    thickness: { upper: number, lower: number },
    shape: { bow: number, upturned: number, straight: number, downturned: number }
  },
  eyes: {
    shape: { squint: number, oval: number, round: number, narrow: number }
  }
}

interface FeatureItem {
  id: string
  url: string
  category: string
  type: number
  name: string
  tags: string[]
  ethnicity?: string[]
  age?: string[]
}

interface CanvasRef {
  addFeature: (feature: any) => void
  moveFeature: (featureType: string, deltaX: number, deltaY: number) => void
  rotateFeature: (featureType: string, angle: number) => void
  scaleFeature: (featureType: string, scaleX: number, scaleY: number) => void
  flipFeature: (featureType: string, direction: 'horizontal' | 'vertical') => void
  adjustContrast: (value: number) => void
  adjustSharpness: (value: number) => void
  resetAllFilters: () => void;
  adjustPoliceSketchEffect: (value: number) => void;
  adjustLineWeight: (value: number) => void;
  adjustTextureIntensity: (value: number) => void;
  adjustSkinTone: (value: number, analysis: any, feature?: string) => Promise<void>;
}

interface CompositeState {
  features: Feature[]
  zoom: number
  layers: Layer[]
  attributes: {
    skinTone: number
    contrast: number
    sharpness: number
  }
  selectedFeatureId: string | null
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  feature: Feature;
  zIndex: number;
}

// Add new interface for movement settings
interface MovementSettings {
  stepSize: number;
}

// Add these to your existing interfaces
interface FeatureCategory {
  label: string
  value: string
  icon: JSX.Element
  hasSubFeatures?: boolean
  subFeatures?: {
    label: string
    value: string
    icon: JSX.Element
  }[]
}

// Add this interface at the top with other interfaces
interface Feature {
  id: string;
  category: string;
  url: string;
  isBase?: boolean;
  needsBlending?: boolean;
  blendSettings?: {
    category: string;
  };
}

// Add this interface for the preview dialog
interface PreviewDialogProps {
  feature: Feature;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExportSettings {
  fileType: string;
  quality: number;
}

// Add these color constants at the top of your component
const SKIN_TONE_COLORS = [
  '#FFDFC4', // Very light
  '#F0C8A0', // Light
  '#DEB887', // Medium light
  '#C69C6D', // Medium
  '#A67B5B', // Medium dark
  '#8B4513', // Dark
];

export default function CompositeEditor() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTool, setActiveTool] = useState<string | null>(null)

  // Dummy layers data
  const [layers, setLayers] = useState<Layer[]>([])

  // Update attributes state - remove symmetry
  const [attributes, setAttributes] = useState({
    skinTone: 50,
    contrast: 50,
    sharpness: 50
  })

  const [selectedFeature, setSelectedFeature] = useState<string>('faceShape');
  const [transformSettings, setTransformSettings] = useState<TransformSettings>({
    face: {
      shape: { oval: 0, round: 0, triangular: 0, square: 0, angular: 0 },
      features: { fleshiness: 0 },
      jaw: { oval: 0, rounded: 0, pointed: 0, square: 0, angular: 0, dimpled: 0 }
    },
    lips: {
      thickness: { upper: 0, lower: 0 },
      shape: { bow: 0, upturned: 0, straight: 0, downturned: 0 }
    },
    eyes: {
      shape: { squint: 0, oval: 0, round: 0, narrow: 0 }
    }
  })

  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)

  const canvasRef = useRef<CanvasRef>(null)
  const stageRef = useRef<Konva.Stage>(null)

  const location = useLocation()
  const [initialFeatures, setInitialFeatures] = useState<Feature[]>([])

  const [zoom, setZoom] = useState(190)

  const handleZoom = (newZoom: number) => {
    const clampedZoom = Math.min(300, Math.max(100, newZoom))
    setZoom(clampedZoom)
  }

  // Add useEffect to fetch features when category changes
  useEffect(() => {
    const fetchFeatures = async () => {
      if (!selectedFeature) return;
      
      setLoading(true);
      console.log('Fetching features for category:', selectedFeature);
      try {
        const response = await api.get(`/api/features/${selectedFeature}`);
        console.log('API Response:', response.data);
        
        if (response.data?.success && Array.isArray(response.data.data)) {
          setFeatures(response.data.data);
        } else {
          console.error('Invalid response structure:', response.data);
          setFeatures([]);
        }
      } catch (error) {
        console.error('Failed to fetch features:', error);
        setFeatures([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [selectedFeature]);

  const dummyFeatures: FeatureItem[] = [
    {
      id: "1",
      name: "Almond Eyes",
      url: "https://res.cloudinary.com/daeayoeiq/image/upload/v1731910795/eyes_type_2_ml0aw3.png",
      category: "Eyes",
      type: 1,
      tags: ["Natural", "Common"],
      ethnicity: ["Asian", "Caucasian"],
      age: ["Young", "Middle"]
    },
    {
      id: "2",
      name: "Round Eyes",
      url: "",
      category: "Eyes",
      type: 2,
      tags: ["Wide", "Expressive"],
      ethnicity: ["Caucasian"],
      age: ["Young"]
    },
    // Add more dummy features...
  ]

  const moveLayer = (dragIndex: number, hoverIndex: number) => {
    setLayers((prevLayers) => {
      const newLayers = [...prevLayers]
      const draggedLayer = newLayers[dragIndex]
      
      // Remove the dragged item
      newLayers.splice(dragIndex, 1)
      // Insert it at the new position
      newLayers.splice(hoverIndex, 0, draggedLayer)
      
      // Update zIndex - higher index = lower layer
      return newLayers.map((layer, idx) => ({
        ...layer,
        zIndex: idx // Bottom layer starts at 0
      }))
    })
  }

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ))
  }

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId
        ? { ...layer, opacity }
        : layer
    ))
  }

  const deleteLayer = (layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId))
  }

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Your existing save logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
    } finally {
      setIsSaving(false);
    }
  };

  const renderToolPanel = () => {
    if (!activeTool) return null;

    if (activeTool === "Feature Selection") {
      return (
        <div className="w-[320px] border-l flex flex-col bg-background">
          <div className="p-4 border-b">
            <div className="space-y-4">
              {/* Feature Categories */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'faceShape', label: 'Face', icon: <CircleUser className="h-4 w-4" /> },
                  { value: 'eyes', label: 'Eyes', icon: <Eye className="h-4 w-4" /> },
                  { value: 'nose', label: 'Nose', icon: <CircleDot className="h-4 w-4" /> },
                  { value: 'mouth', label: 'Mouth', icon: <SmilePlus className="h-4 w-4" /> },
                  { value: 'ears', label: 'Ears', icon: <HeadphonesIcon className="h-4 w-4" /> },
                  { value: 'eyebrows', label: 'Brows', icon: <Minus className="h-4 w-4" /> }
                ].map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedFeature === category.value ? "secondary" : "ghost"}
                    className="flex flex-col items-center gap-1 h-auto py-2"
                    onClick={() => handleCategorySelect(category.value)}
                  >
                    {category.icon}
                    <span className="text-xs">{category.label}</span>
                  </Button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search features..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {loading ? (
                  Array(4).fill(null).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-muted animate-pulse"
                    />
                  ))
                ) : features.length > 0 ? (
                  features.map((feature) => (
                    <FeaturePreviewCard
                      key={feature.id}
                      feature={feature}
                      isSelected={selectedFeatureId === feature.id}
                      onSelect={() => handleFeatureSelect(feature)}
                      gridZoom={gridZoom}
                    />
                  ))
                ) : (
                  <div className="col-span-2 text-center text-muted-foreground py-4">
                    No features found
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      );
    }

    if (activeTool === "Artistic Effects") {
      return (
        <div className="w-[320px] border-l flex flex-col bg-background">
          <div className="p-4 border-b">
            <span className="font-medium">Artistic Effects</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Style Presets - Removed charcoal and lineDrawing */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Style Presets</span>
                {[
                  { value: 'original', label: 'Original' },
                  { value: 'policeSketch', label: 'Police Sketch' }
                ].map((style) => (
                  <Button
                    key={style.value}
                    variant={selectedStyle === style.value ? "secondary" : "outline"}
                    className="w-full justify-start h-9"
                    onClick={() => handleStyleChange(style.value)}
                  >
                    <span className="text-sm">{style.label}</span>
                  </Button>
                ))}
              </div>

              {/* Effect Controls - Modified show condition */}
              {selectedStyle !== 'original' && (
                <>
                  <div className="space-y-4">
                    <span className="text-sm font-medium">Effect Controls</span>
                    {[
                      { 
                        key: 'effectStrength', 
                        label: 'Effect Strength',
                        min: 0,
                        max: 100
                      },
                      { 
                        key: 'lineWeight', 
                        label: 'Line Weight',
                        min: 0,
                        max: 100,
                        show: selectedStyle === 'policeSketch' // Modified to only show for police sketch
                      },
                      { 
                        key: 'textureIntensity', 
                        label: 'Texture Intensity',
                        min: 0,
                        max: 100
                      }
                    ].map((control) => (
                      control.show !== false && (
                        <div key={control.key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{control.label}</span>
                            <span className="text-xs text-muted-foreground w-8 text-right">
                              {effectControls[control.key]}%
                            </span>
                          </div>
                          <Slider
                            value={[effectControls[control.key]]}
                            min={control.min}
                            max={control.max}
                            step={1}
                            onValueChange={([value]) => handleEffectControlChange(control.key, value)}
                          />
                        </div>
                      )
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      );
    }

    return (
      <div className="w-[320px] border-l flex flex-col bg-background">
        {activeTool === "Layers" && (
          <>
            <div className="p-4 border-b flex justify-between items-center">
              <span className="font-medium">Layers</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setLayers([])}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {[...layers].reverse().map((layer, index) => (
                  <DraggableLayer
                    key={layer.id}
                    id={layer.id}
                    index={layers.length - 1 - index}
                    layer={layer}
                    moveLayer={moveLayer}
                    toggleVisibility={toggleLayerVisibility}
                    updateOpacity={updateLayerOpacity}
                    deleteLayer={deleteLayer}
                  />
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {activeTool === "Attributes" && (
          <>
            <div className="p-4 border-b">
              <span className="font-medium">Attributes</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Feature Selection for Attributes */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">Apply to:</span>
                  <Select
                    value={selectedAttributeFeature}
                    onValueChange={(value: typeof selectedAttributeFeature) => 
                      setSelectedAttributeFeature(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select feature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Features</SelectItem>
                      <SelectItem value="face">Face</SelectItem>
                      <SelectItem value="eyes">Eyes</SelectItem>
                      <SelectItem value="eyebrows">Eyebrows</SelectItem>
                      <SelectItem value="nose">Nose</SelectItem>
                      <SelectItem value="mouth">Mouth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Attributes Controls */}
                <div className="space-y-4">
                  {[
                    {
                      key: 'skinTone',
                      label: 'Skin Tone',
                      description: 'Adjust the overall skin tone',
                      onChange: handleSkinToneChange,
                      showFor: ['all', 'face', 'eyes', 'eyebrows', 'nose', 'mouth'],
                      render: (value: number, onChange: (value: number) => void, props: { label: string; description: string }) => (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm">{props.label}</span>
                              <p className="text-xs text-muted-foreground">
                                {props.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {originalSkinTones[selectedAttributeFeature] !== undefined && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs flex items-center gap-1"
                                  onClick={() => {
                                    // Get target layers
                                    const targetLayers = selectedAttributeFeature === 'all' 
                                      ? layers 
                                      : layers.filter(layer => {
                                          const layerCategory = layer.feature.category.toLowerCase();
                                          return layerCategory === selectedAttributeFeature.toLowerCase() || 
                                                 (selectedAttributeFeature === 'face' && layerCategory === 'faceshape');
                                        });

                                    // Remove all filters from target layers
                                    targetLayers.forEach(layer => {
                                      if (canvasRef.current) {
                                        // Reset filters for this layer
                                        canvasRef.current.resetFilters(layer.id);
                                      }
                                    });

                                    // Get the original value for this feature
                                    const originalValue = originalSkinTones[selectedAttributeFeature];
                                    
                                    // Update UI without applying filters
                                    onChange(originalValue);
                                    setAttributes(prev => ({
                                      ...prev,
                                      skinTone: originalValue
                                    }));

                                    // Set a flag to prevent handleSkinToneChange from being triggered
                                    setIsResettingToOriginal(true);
                                    
                                    // Clear the flag after a short delay
                                    setTimeout(() => {
                                      setIsResettingToOriginal(false);
                                    }, 100);
                                  }}
                                >
                                  <div 
                                    className="w-2 h-2 rounded-full"
                                    style={{ 
                                      backgroundColor: SKIN_TONE_COLORS[Math.floor(originalSkinTones[selectedAttributeFeature] / (100 / (SKIN_TONE_COLORS.length - 1)))]
                                    }} 
                                  />
                                  Original
                                </Button>
                              )}
                              <span className="text-xs text-muted-foreground w-8 text-right">
                                {value}%
                              </span>
                            </div>
                          </div>
                          <div className="relative">
                            {/* Background gradient */}
                            <div 
                              className="absolute inset-0 rounded-md pointer-events-none"
                              style={{
                                background: `linear-gradient(to right, ${SKIN_TONE_COLORS.join(', ')})`,
                                opacity: 0.5
                              }}
                            />
                            
                            {/* Slider */}
                            <Slider
                              value={[value]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={([newValue]) => onChange(newValue)}
                              className={cn(
                                "w-full [&_[role=slider]]:bg-background",
                                "[&_[role=slider]]:border-2",
                                "[&_[role=slider]]:w-4",
                                "[&_[role=slider]]:h-4",
                                "[&_[role=slider]]:hover:border-primary",
                                "[&_[role=slider]]:relative",
                                "[&_[role=slider]]:z-20"
                              )}
                            />
                          </div>

                          {/* Color swatches */}
                          <div className="flex justify-between mt-3">
                            {SKIN_TONE_COLORS.map((color, index) => {
                              const percentage = (index / (SKIN_TONE_COLORS.length - 1)) * 100;
                              const isOriginal = originalSkinTones[selectedAttributeFeature] !== undefined && 
                                Math.abs(percentage - originalSkinTones[selectedAttributeFeature]) < 10;
                              const isCurrent = Math.abs(percentage - value) < 10;
                              
                              return (
                                <div
                                  key={color}
                                  className={cn(
                                    "group relative w-6 h-6 rounded-full border shadow-sm cursor-pointer hover:scale-110 transition-transform",
                                    isOriginal && "ring-2 ring-primary ring-offset-1",
                                    isCurrent && "ring-2 ring-primary/50"
                                  )}
                                  style={{ backgroundColor: color }}
                                  onClick={() => onChange(percentage)}
                                >
                                  {isOriginal && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                      Original
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    },
                    {
                      key: 'contrast',
                      label: 'Contrast',
                      description: 'Adjust the contrast level',
                      onChange: handleContrastChange,
                      showFor: ['all', 'face', 'eyes', 'eyebrows', 'nose', 'mouth']
                    },
                    {
                      key: 'sharpness',
                      label: 'Sharpness',
                      description: 'Control feature clarity',
                      onChange: handleSharpnessChange,
                      showFor: ['all', 'face', 'eyes', 'eyebrows', 'nose', 'mouth']
                    }
                  ].map((attr) => {
                    // Only show controls that are relevant for the selected feature
                    if (!attr.showFor.includes(selectedAttributeFeature)) {
                      return null;
                    }

                    return (
                      <div key={attr.key} className="space-y-2">
                        {attr.render ? (
                          attr.render(
                            attributes[attr.key as keyof typeof attributes],
                            (value) => {
                              console.log(`${attr.key} slider value changed:`, value);
                              if (attr.onChange) {
                                attr.onChange(value, selectedAttributeFeature);
                              } else {
                                setAttributes(prev => ({
                                  ...prev,
                                  [attr.key]: value
                                }));
                              }
                            },
                            { label: attr.label, description: attr.description } // Pass the properties here
                          )
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm">{attr.label}</span>
                                <p className="text-xs text-muted-foreground">
                                  {attr.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => {
                                    // Get target layers
                                    const targetLayers = selectedAttributeFeature === 'all' 
                                      ? layers 
                                      : layers.filter(layer => {
                                          const layerCategory = layer.feature.category.toLowerCase();
                                          return layerCategory === selectedAttributeFeature.toLowerCase() || 
                                                 (selectedAttributeFeature === 'face' && layerCategory === 'faceshape');
                                        });

                                    // Reset filters for target layers
                                    targetLayers.forEach(layer => {
                                      if (canvasRef.current) {
                                        canvasRef.current.resetFilters(layer.id);
                                      }
                                    });

                                    // Reset the slider to neutral (50)
                                    setAttributes(prev => ({
                                      ...prev,
                                      [attr.key]: 50
                                    }));
                                  }}
                                >
                                  Reset
                                </Button>
                                <span className="text-xs text-muted-foreground w-8 text-right">
                                  {attributes[attr.key as keyof typeof attributes]}%
                                </span>
                              </div>
                            </div>
                            <Slider
                              value={[attributes[attr.key as keyof typeof attributes]]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={([value]) => {
                                console.log(`${attr.key} slider value changed:`, value);
                                if (attr.onChange) {
                                  attr.onChange(value, selectedAttributeFeature);
                                } else {
                                  setAttributes(prev => ({
                                    ...prev,
                                    [attr.key]: value
                                  }));
                                }
                              }}
                              className="w-full"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </>
        )}

        {activeTool === "Feature Adjustment" && (
          <>
            <div className="p-4 border-b">
              <span className="font-medium">Feature Controls</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Feature Selection - Enhanced Layout */}
                <div className="space-y-4">
                  <span className="text-sm font-medium">Select Feature</span>
                  
                  {/* Primary Features */}
                  <div className="space-y-2">
                    {/* Eyes and Ears Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={selectedFeatureForMovement === "eyes" ? "secondary" : "outline"}
                        className="h-10 justify-start gap-2"
                        onClick={() => handleFeatureSelectionForMovement("eyes")}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">Eyes</span>
                      </Button>
                      <Button
                        variant={selectedFeatureForMovement === "ears" ? "secondary" : "outline"}
                        className="h-10 justify-start gap-2"
                        onClick={() => handleFeatureSelectionForMovement("ears")}
                      >
                        <HeadphonesIcon className="h-4 w-4" />
                        <span className="text-sm">Ears</span>
                      </Button>
                    </div>

                    {/* Eyebrows and Face Shape Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={selectedFeatureForMovement === "eyebrows" ? "secondary" : "outline"}
                        className="h-10 justify-start gap-2"
                        onClick={() => handleFeatureSelectionForMovement("eyebrows")}
                      >
                        <Minus className="h-4 w-4" />
                        <span className="text-sm">Brows</span>
                      </Button>
                      <Button
                        variant={selectedFeatureForMovement === "faceShape" ? "secondary" : "outline"}
                        className="h-10 justify-start gap-2"
                        onClick={() => handleFeatureSelectionForMovement("faceShape")}
                      >
                        <CircleUser className="h-4 w-4" />
                        <span className="text-sm">Face</span>
                      </Button>
                    </div>

                    {/* Nose and Mouth Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={selectedFeatureForMovement === "nose" ? "secondary" : "outline"}
                        className="h-10 justify-start gap-2"
                        onClick={() => handleFeatureSelectionForMovement("nose")}
                      >
                        <CircleDot className="h-4 w-4" />
                        <span className="text-sm">Nose</span>
                      </Button>
                      <Button
                        variant={selectedFeatureForMovement === "mouth" ? "secondary" : "outline"}
                        className="h-10 justify-start gap-2"
                        onClick={() => handleFeatureSelectionForMovement("mouth")}
                      >
                        <SmilePlus className="h-4 w-4" />
                        <span className="text-sm">Mouth</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Movement Controls - Existing code */}
                <div className="space-y-3">
                  <span className="text-sm font-medium">Movement</span>
                  <div className="space-y-4">
                    {/* Step Size Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Step Size</span>
                        <span className="text-xs text-muted-foreground">{movementStepSize}px</span>
                      </div>
                      <Slider
                        value={[movementStepSize]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={([value]) => setMovementStepSize(value)}
                      />
                    </div>

                    {/* Movement Grid - Improved UI with better center alignment */}
                    <div className="bg-muted/40 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-2 place-items-center">
                        {/* Top Row */}
                        <Button 
                          variant="outline"
                          size="icon" 
                          className="h-10 w-10 aspect-square"
                          onClick={() => handleFeatureMovement('upLeft')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowUpLeft className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="outline"
                          size="icon" 
                          className="h-10 w-10 aspect-square"
                          onClick={() => handleFeatureMovement('up')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowUp className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="outline"
                          size="icon" 
                          className="h-10 w-10 aspect-square"
                          onClick={() => handleFeatureMovement('upRight')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowUpRight className="h-5 w-5" />
                        </Button>

                        {/* Middle Row */}
                        <Button 
                          variant="outline"
                          size="icon" 
                          className="h-10 w-10 aspect-square"
                          onClick={() => handleFeatureMovement('left')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        {/* Center Position - Improved */}
                        <div className="relative h-10 w-10">
                          <div className="absolute inset-0 rounded-lg border-2 border-dashed border-muted-foreground/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                          </div>
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full h-[1px] bg-muted-foreground/10" />
                          </div>
                          <div className="absolute inset-0 flex justify-center">
                            <div className="h-full w-[1px] bg-muted-foreground/10" />
                          </div>
                        </div>
                        <Button 
                          variant="outline"
                          size="icon" 
                          className="h-10 w-10 aspect-square"
                          onClick={() => handleFeatureMovement('right')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </Button>

                        {/* Bottom Row */}
                        <Button 
                          variant="outline"
                          size="icon" 
                          className="h-10 w-10 aspect-square"
                          onClick={() => handleFeatureMovement('downLeft')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowDownLeft className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="outline"
                          size="icon" 
                          className="h-10 w-10 aspect-square"
                          onClick={() => handleFeatureMovement('down')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowDown className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="outline"
                          size="icon" 
                          className="h-10 w-10 aspect-square"
                          onClick={() => handleFeatureMovement('downRight')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowDownRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Rotation Controls */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rotation Angle</span>
                        <span className="text-xs text-muted-foreground">{rotationAngle}°</span>
                      </div>
                      <Slider
                        value={[rotationAngle]}
                        min={1}
                        max={45}
                        step={1}
                        onValueChange={([value]) => setRotationAngle(value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleFeatureRotation('counterclockwise')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Rotate Left
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleFeatureRotation('clockwise')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <RotateCw className="h-4 w-4 mr-2" />
                          Rotate Right
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Size Controls */}
                <div className="space-y-3">
                  <span className="text-sm font-medium">Size Adjustment</span>
                  <div className="space-y-4">
                    {/* Size Step Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Size Step</span>
                        <span className="text-xs text-muted-foreground">{sizeStepSize}%</span>
                      </div>
                      <Slider
                        value={[sizeStepSize]}
                        min={1}
                        max={20}
                        step={1}
                        onValueChange={([value]) => setSizeStepSize(value)}
                      />
                    </div>

                    {/* Size Control Buttons - Updated UI */}
                    <div className="space-y-4">
                      {/* Uniform Scaling */}
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground">Uniform Scale</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 h-9"
                            onClick={() => handleFeatureSize('increase', 'both')}
                            disabled={!selectedFeatureForMovement}
                          >
                            <Maximize2 className="h-4 w-4 mr-2" />
                            Scale Up
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 h-9"
                            onClick={() => handleFeatureSize('decrease', 'both')}
                            disabled={!selectedFeatureForMovement}
                          >
                            <Minimize2 className="h-4 w-4 mr-2" />
                            Scale Down
                          </Button>
                        </div>
                      </div>

                      {/* Horizontal Scaling */}
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground">Horizontal Scale</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 h-9"
                            onClick={() => handleFeatureSize('increase', 'horizontal')}
                            disabled={!selectedFeatureForMovement}
                          >
                            <ChevronsLeftRight className="h-4 w-4 mr-2" />
                            Widen
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 h-9"
                            onClick={() => handleFeatureSize('decrease', 'horizontal')}
                            disabled={!selectedFeatureForMovement}
                          >
                            <ArrowLeftRight className="h-4 w-4 mr-2" />
                            Narrow
                          </Button>
                        </div>
                      </div>

                      {/* Vertical Scaling */}
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground">Vertical Scale</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 h-9"
                            onClick={() => handleFeatureSize('increase', 'vertical')}
                            disabled={!selectedFeatureForMovement}
                          >
                            <ChevronsUpDown className="h-4 w-4 mr-2" />
                            Lengthen
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 h-9"
                            onClick={() => handleFeatureSize('decrease', 'vertical')}
                            disabled={!selectedFeatureForMovement}
                          >
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Shorten
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flip Controls */}
                <div className="space-y-3">
                  <span className="text-sm font-medium">Flip</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                      onClick={() => handleFeatureFlip('horizontal')}
                      disabled={!selectedFeatureForMovement}
                    >
                      <ChevronsLeftRight className="h-4 w-4" />
                      <span className="text-sm">Horizontal</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                      onClick={() => handleFeatureFlip('vertical')}
                      disabled={!selectedFeatureForMovement}
                    >
                      <ChevronsUpDown className="h-4 w-4" />
                      <span className="text-sm">Vertical</span>
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        )}

        {activeTool === "Transform" && (
          <>
            <div className="p-4 border-b">
              <span className="font-medium">Feature Controls</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Feature Selection */}
                <div className="space-y-2">
                  {[
                    { label: "Face", icon: <Maximize2 className="h-4 w-4" /> },
                    { label: "Eyes", icon: <Eye className="h-4 w-4" /> },
                    { label: "Mouth", icon: <StretchHorizontal className="h-4 w-4 rotate-180" /> },
                  ].map((feature) => (
                    <Button
                      key={feature.label}
                      variant={selectedFeature === feature.label.toLowerCase() ? "secondary" : "outline"}
                      className="w-full h-9 justify-start gap-2"
                      onClick={() => setSelectedFeature(
                        selectedFeature === feature.label.toLowerCase() 
                          ? null 
                          : feature.label.toLowerCase()
                      )}
                    >
                      {feature.icon}
                      <span className="text-sm">{feature.label}</span>
                    </Button>
                  ))}
                </div>

                {/* Feature-specific controls */}
                {selectedFeature && (
                  <div className="space-y-6 pt-4 border-t">
                    {selectedFeature === 'face' && (
                      <>
                        <div className="space-y-3">
                          <span className="text-sm font-medium">Face Shape</span>
                          {Object.entries(transformSettings.face.shape).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm capitalize">{key}</span>
                                <span className="text-xs text-muted-foreground w-8 text-right">
                                  {(value * 100).toFixed(1)}%
                                </span>
                              </div>
                              <Slider
                                value={[value]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={([newValue]) => {
                                  setTransformSettings(prev => ({
                                    ...prev,
                                    face: {
                                      ...prev.face,
                                      shape: {
                                        ...prev.face.shape,
                                        [key]: newValue
                                      }
                                    }
                                  }))
                                }}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <span className="text-sm font-medium">Jaw Shape</span>
                          {Object.entries(transformSettings.face.jaw).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm capitalize">{key}</span>
                                <span className="text-xs text-muted-foreground w-8 text-right">
                                  {(value * 100).toFixed(1)}%
                                </span>
                              </div>
                              <Slider
                                value={[value]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={([newValue]) => {
                                  setTransformSettings(prev => ({
                                    ...prev,
                                    face: {
                                      ...prev.face,
                                      jaw: {
                                        ...prev.face.jaw,
                                        [key]: newValue
                                      }
                                    }
                                  }))
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {selectedFeature === 'eyes' && (
                      <div className="space-y-3">
                        <span className="text-sm font-medium">Eye Shape</span>
                        {Object.entries(transformSettings.eyes.shape).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm capitalize">{key}</span>
                              <span className="text-xs text-muted-foreground w-8 text-right">
                                {(value * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Slider
                              value={[value]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={([newValue]) => {
                                setTransformSettings(prev => ({
                                  ...prev,
                                  eyes: {
                                    ...prev.eyes,
                                    shape: {
                                      ...prev.eyes.shape,
                                      [key]: newValue
                                    }
                                  }
                                }))
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedFeature === 'mouth' && (
                      <>
                        <div className="space-y-3">
                          <span className="text-sm font-medium">Thickness</span>
                          {Object.entries(transformSettings.lips.thickness).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm capitalize">{key} Lip</span>
                                <span className="text-xs text-muted-foreground w-8 text-right">
                                  {(value * 100).toFixed(1)}%
                                </span>
                              </div>
                              <Slider
                                value={[value]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={([newValue]) => {
                                  setTransformSettings(prev => ({
                                    ...prev,
                                    lips: {
                                      ...prev.lips,
                                      thickness: {
                                        ...prev.lips.thickness,
                                        [key]: newValue
                                      }
                                    }
                                  }))
                                }}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <span className="text-sm font-medium">Shape</span>
                          {Object.entries(transformSettings.lips.shape).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm capitalize">{key}</span>
                                <span className="text-xs text-muted-foreground w-8 text-right">
                                  {(value * 100).toFixed(1)}%
                                </span>
                              </div>
                              <Slider
                                value={[value]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={([newValue]) => {
                                  setTransformSettings(prev => ({
                                    ...prev,
                                    lips: {
                                      ...prev.lips,
                                      shape: {
                                        ...prev.lips.shape,
                                        [key]: newValue
                                      }
                                    }
                                  }))
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        )}

        {activeTool === "Feature Selection" && (
          <>
            <div className="p-4 border-b">
              <div className="space-y-4">
                {/* Feature Categories */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'faceShape', label: 'Face Shape', icon: <CircleUser className="h-4 w-4" /> },
                    { value: 'eyes', label: 'Eyes', icon: <Eye className="h-4 w-4" /> },
                    { value: 'eyebrows', label: 'Eyebrows', icon: <Minus className="h-4 w-4" /> },
                    { value: 'nose', label: 'Nose', icon: <CircleDot className="h-4 w-4" /> },
                    { value: 'mouth', label: 'Mouth', icon: <SmilePlus className="h-4 w-4" /> },
                    { value: 'ears', label: 'Ears', icon: <HeadphonesIcon className="h-4 w-4" /> }
                  ].map((category) => (
                    <Button
                      key={category.value}
                      variant={selectedFeature === category.value ? "secondary" : "ghost"}
                      className="flex flex-col items-center gap-1 h-auto py-2"
                      onClick={() => handleCategorySelect(category.value)}
                    >
                      {category.icon}
                      <span className="text-xs">{category.label}</span>
                    </Button>
                  ))}
                </div>

                {/* Search and Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search features..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Grid Zoom Controls */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setGridZoom(Math.max(100, gridZoom - 20))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground w-12 text-center">
                    {gridZoom}%
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setGridZoom(Math.min(200, gridZoom + 20))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Feature Grid */}
            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-2 gap-2">
                {loading ? (
                  Array(4).fill(null).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-muted animate-pulse"
                    />
                  ))
                ) : features.length > 0 ? (
                  features.map((feature) => (
                    <FeaturePreviewCard
                      key={feature.id}
                      feature={feature}
                      isSelected={selectedFeatureId === feature.id}
                      onSelect={() => handleFeatureSelect(feature)}
                      gridZoom={gridZoom}
                    />
                  ))
                ) : (
                  <div className="col-span-2 text-center text-muted-foreground py-4">
                    No features found
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        )}

        {/* Add other tool panels here */}
      </div>
    )
  }

  const handleFeatureDrop = (feature: Feature) => {
    const newLayer = {
      id: feature.id,
      name: feature.category,
      visible: true,
      opacity: 100,
      feature: feature,
      zIndex: layers.length
    }
    setLayers(prev => [...prev, newLayer])
  }

  const handleFeatureClick = (feature: any) => {
    console.log('Feature clicked:', feature)
    if (!feature.url) {
      console.error('Feature URL is missing:', feature)
      return
    }
    
    if (canvasRef.current) {
      canvasRef.current.addFeature({
        id: feature.id,
        url: feature.url,
        category: feature.category.toLowerCase()
      })
    }
  }

  const handleFeatureAddition = async (feature: FeatureItem) => {
    console.log('Adding feature:', feature);
    try {
      const baseImage = canvasRef.current.getBaseImage(); // Assuming there's a method to get the base image
      const featureImage = new Image();
      featureImage.src = feature.url;
      featureImage.onload = async () => {
        console.log('Feature image loaded:', feature.url);
        const blendedNode = await analyzeAndBlendFeature(baseImage, featureImage, feature.category);
        canvasRef.current.addNode(blendedNode);
        console.log('Blended node added to canvas');
      };
    } catch (error) {
      console.error('Error adding feature:', error);
    }
  };

  useEffect(() => {
    if (canvasRef.current && initialFeatures.length > 0) {
      initialFeatures.forEach(feature => {
        canvasRef.current?.addFeature({
          id: feature.id,
          url: feature.url,
          category: feature.category,
          isBase: feature.isBase,
          needsBlending: feature.needsBlending,
          blendSettings: feature.blendSettings
        })
      })
    }
  }, [initialFeatures])

  const reorderLayers = (fromIndex: number, toIndex: number) => {
    setLayers(prev => {
      const newLayers = [...prev]
      const [movedLayer] = newLayers.splice(fromIndex, 1)
      newLayers.splice(toIndex, 0, movedLayer)
      return newLayers.map((layer, idx) => ({ ...layer, zIndex: idx }))
    })
  }

  useEffect(() => {
    if (location.state?.features) {
      setInitialFeatures(location.state.features)
      // Convert features to layers - maintain proper z-index order
      const newLayers = location.state.features.map((feature: Feature, index: number) => ({
        id: feature.id,
        name: feature.category,
        visible: true,
        opacity: 100,
        feature: feature,
        zIndex: index // Bottom layer starts at 0
      }))
      setLayers(newLayers)
    }
  }, [location.state])

  // Inside CompositeEditor component, add new state
  const [movementStepSize, setMovementStepSize] = useState(5)
  const [selectedFeatureForMovement, setSelectedFeatureForMovement] = useState<string | null>(null);

  // Add this function to handle feature selection for movement
  const handleFeatureSelectionForMovement = (featureValue: string) => {
    console.log('Selected feature for movement:', featureValue);
    setSelectedFeatureForMovement(prev => prev === featureValue ? null : featureValue);
  };

  // Add movement handler
  const handleFeatureMovement = (direction: 'up' | 'down' | 'left' | 'right' | 'upLeft' | 'upRight' | 'downLeft' | 'downRight') => {
    if (!canvasRef.current || !selectedFeatureForMovement) return;

    // Normalize the feature type
    const featureType = selectedFeatureForMovement === 'faceShape' ? 'faceShape' : selectedFeatureForMovement.toLowerCase();

    const moveMap = {
      up: { x: 0, y: -movementStepSize },
      down: { x: 0, y: movementStepSize },
      left: { x: -movementStepSize, y: 0 },
      right: { x: movementStepSize, y: 0 },
      upLeft: { x: -movementStepSize, y: -movementStepSize },
      upRight: { x: movementStepSize, y: -movementStepSize },
      downLeft: { x: -movementStepSize, y: movementStepSize },
      downRight: { x: movementStepSize, y: movementStepSize }
    };

    const movement = moveMap[direction];
    console.log('Moving feature:', featureType, 'by:', movement);
    canvasRef.current.moveFeature(featureType, movement.x, movement.y);
  };

  // Add new state for rotation
  const [rotationAngle, setRotationAngle] = useState(5); // Default 5 degrees per click

  // Add rotation handler
  const handleFeatureRotation = (direction: 'clockwise' | 'counterclockwise') => {
    if (!canvasRef.current || !selectedFeatureForMovement) return;

    const featureType = selectedFeatureForMovement === 'faceShape' ? 'faceShape' : selectedFeatureForMovement.toLowerCase();
    const angle = direction === 'clockwise' ? rotationAngle : -rotationAngle;
    canvasRef.current.rotateFeature(featureType, angle);
  };

  // Add new state for scale
  const [scaleStepSize, setScaleStepSize] = useState(0.1);

  // Add scale handler functions
  const handleFeatureScale = (direction: 'horizontal' | 'vertical', increase: boolean) => {
    if (!canvasRef.current || !selectedFeatureForMovement) return;

    const featureType = selectedFeatureForMovement === 'faceShape' ? 'faceShape' : selectedFeatureForMovement.toLowerCase();
    const scaleFactor = increase ? 
      Math.round((1 + scaleStepSize) * 1000) / 1000 : 
      Math.round((1 - scaleStepSize) * 1000) / 1000;
    
    if (direction === 'horizontal') {
      canvasRef.current.scaleFeature(featureType, scaleFactor, 1);
    } else {
      canvasRef.current.scaleFeature(featureType, 1, scaleFactor);
    }
  };

  // Add new state for size adjustment (near other transform states)
  const [sizeStepSize, setSizeStepSize] = useState(5)

  // Add size handler function (near other transform handlers)
  const handleFeatureSize = (direction: 'increase' | 'decrease', axis: 'both' | 'horizontal' | 'vertical') => {
    if (!canvasRef.current || !selectedFeatureForMovement) return;
    
    const featureType = selectedFeatureForMovement === 'faceShape' ? 'faceShape' : selectedFeatureForMovement.toLowerCase();
    const scaleFactor = direction === 'increase' ? 1 + (sizeStepSize / 100) : 1 - (sizeStepSize / 100);
    
    switch(axis) {
      case 'both':
        canvasRef.current.scaleFeature(featureType, scaleFactor, scaleFactor);
        break;
      case 'horizontal':
        canvasRef.current.scaleFeature(featureType, scaleFactor, 1);
        break;
      case 'vertical':
        canvasRef.current.scaleFeature(featureType, 1, scaleFactor);
        break;
    }
  };

  const FeatureSelectionContent = () => {
    const featureCategories = [
      { value: 'faceShape', label: 'Face Shape', icon: <CircleUser className="h-4 w-4" /> },
      { value: 'eyes', label: 'Eyes', icon: <Eye className="h-4 w-4" /> },
      { value: 'eyebrows', label: 'Eyebrows', icon: <Minus className="h-4 w-4" /> },
      { value: 'nose', label: 'Nose', icon: <CircleDot className="h-4 w-4" /> },
      { value: 'mouth', label: 'Mouth', icon: <SmilePlus className="h-4 w-4" /> },
      { value: 'ears', label: 'Ears', icon: <HeadphonesIcon className="h-4 w-4" /> }
    ];

    return (
      <div className="p-4 space-y-4">
        {featureCategories.map((category) => (
          <div key={category.value}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                selectedFeature === category.value && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleCategorySelect(category.value)}
            >
              {category.icon}
              <span className="ml-2">{category.label}</span>
            </Button>
            
            {selectedFeature === category.value && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {loading ? (
                  Array(4).fill(null).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-muted/50 animate-pulse"
                    />
                  ))
                ) : features.length > 0 ? (
                  features.map((feature) => (
                    <FeaturePreviewCard
                      key={feature.id}
                      feature={feature}
                      isSelected={selectedFeatureId === feature.id}
                      onSelect={() => handleFeatureSelect(feature)}
                      gridZoom={gridZoom}
                    />
                  ))
                ) : (
                  <div className="col-span-2 text-center text-muted-foreground py-4">
                    No features found
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Update the FeaturePreviewDialog component
  const FeaturePreviewDialog = ({ feature, open, onOpenChange }: PreviewDialogProps) => {
    const [previewZoom, setPreviewZoom] = useState(150);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    // Reset position when dialog opens
    useEffect(() => {
      if (open) {
        setPosition({ x: 0, y: 0 });
      }
    }, [open]);

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[80vw] w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Feature Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setPreviewZoom(Math.max(50, previewZoom - 25))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="flex items-center bg-muted rounded-md px-2 flex-1">
                <Input 
                  type="number" 
                  value={previewZoom}
                  onChange={(e) => setPreviewZoom(Math.min(400, Math.max(50, Number(e.target.value))))}
                  className="h-8 text-center border-0 bg-transparent"
                  min={50}
                  max={400}
                  step={25}
                />
                <span className="text-sm text-muted-foreground ml-1">%</span>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setPreviewZoom(Math.min(400, previewZoom + 25))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Preview Container */}
            <div 
              className="relative rounded-lg border overflow-hidden cursor-move bg-muted/30" 
              style={{ 
                height: 'calc(70vh - 100px)',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Image Container */}
              <div
                className="absolute transition-transform duration-75"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%'
                }}
              >
                <img 
                  src={feature.url}
                  alt={feature.category}
                  className="transition-transform duration-200"
                  style={{
                    transform: `scale(${previewZoom / 100})`,
                    transformOrigin: 'center center',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Update the FeaturePreviewCard component
  const FeaturePreviewCard = ({ 
    feature, 
    isSelected, 
    onSelect,
    gridZoom 
  }: { 
    feature: Feature
    isSelected: boolean
    onSelect: () => void
    gridZoom: number
  }) => {
    const [showPreview, setShowPreview] = useState(false);
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
      const img = new Image();
      img.src = feature.url;
      img.onload = () => setImage(img);
    }, [feature.url]);

    if (!image) {
      return (
        <div className="aspect-square rounded-lg bg-muted/50 animate-pulse" />
      );
    }

    const getZoomLevel = () => {
      // Reduced zoom levels for better visibility
      switch (feature.category) {
        case 'faceShape':
          return 1.1; // Slightly zoomed for face shape
        case 'eyes':
          return 1.8; // Reduced from 2.5
        case 'nose':
          return 1.6; // Reduced from 2.2
        case 'mouth':
          return 1.6; // Reduced from 2.2
        case 'ears':
          return 1.5; // Reduced from 2.0
        case 'eyebrows':
          return 1.7; // Reduced from 2.3
        default:
          return 1.2;
      }
    };

    return (
      <>
        <div
          className={cn(
            "group relative aspect-square rounded-lg bg-muted/50 border-2 transition-all cursor-pointer overflow-hidden",
            "hover:border-primary/50 hover:bg-muted/70",
            isSelected ? "border-primary" : "border-transparent"
          )}
          onClick={onSelect}
        >
          {/* Preview Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setShowPreview(true);
            }}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>

          {/* Feature Image */}
          <div className="w-full h-full relative overflow-hidden">
            <img 
              src={feature.url}
              alt={feature.category}
              className="absolute w-full h-full transition-transform duration-200"
              style={{
                objectFit: feature.category === 'faceShape' ? 'contain' : 'cover',
                objectPosition: 'center',
                transform: `scale(${getZoomLevel()})`,
                transformOrigin: 'center center'
              }}
            />
          </div>

          {isSelected && (
            <div className="absolute top-1 left-1 z-10">
              <div className="bg-primary text-primary-foreground rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
            </div>
          )}
        </div>

        <FeaturePreviewDialog
          feature={feature}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      </>
    );
  };

  // Add these state variables at the top of the CompositeEditor component
  const [gridZoom, setGridZoom] = useState(150);
  const [currentFeature, setCurrentFeature] = useState<string>('faceShape');

  // Add these refs after other state declarations
  const imagesRef = useRef(new Map());
  const layerRef = useRef<Konva.Layer | null>(null);

  // Update handleFeatureSelect function
  const handleFeatureSelect = async (feature: FeatureItem) => {
    try {
      console.log('Selecting feature:', feature);
      setSelectedFeatureId(feature.id);

      // Get existing modifications for the feature if any
      const existingMods = featureModifications[selectedFeature] || {};

      // Update layers while preserving modifications
      setLayers(prev => {
        return prev.map(layer => {
          if (layer.feature.category === selectedFeature) {
            return {
              ...layer,
              id: feature.id,
              feature: {
                ...feature,
                needsBlending: selectedFeature !== 'faceShape',
                blendSettings: selectedFeature !== 'faceShape' ? {
                  category: selectedFeature,
                  ...existingMods
                } : undefined
              }
            };
          }
          return layer;
        });
      });

      // Update canvas with new feature
      if (canvasRef.current) {
        const imageNode = imagesRef.current.get(selectedFeature);
        if (imageNode) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = feature.url;
          img.onload = () => {
            imageNode.image(img);
            
            // Reapply modifications if they exist
            if (existingMods) {
              Object.entries(existingMods).forEach(([key, value]) => {
                imageNode[key](value);
              });
            }
            
            if (layerRef.current) {
              layerRef.current.batchDraw();
            }
          };
        }
      }
    } catch (error) {
      console.error('Error selecting feature:', error);
      toast({
        title: "Error",
        description: "Failed to select feature",
        variant: "destructive"
      });
    }
  };

  // Add this function to handle category selection
  const handleCategorySelect = async (category: string) => {
    setSelectedFeature(category);
    setLoading(true);
    
    try {
      // This matches CompositeBuilder's API call pattern
      const response = await api.get(`/api/features/${category}`);
      if (response.data?.features) {
        setFeatures(response.data.features);
      }
    } catch (error) {
      console.error('Failed to fetch features:', error);
      toast({
        title: "Error",
        description: "Failed to load features",
        variant: "destructive"
      });
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  // Add after other state declarations
  const [featureModifications, setFeatureModifications] = useState<Record<string, any>>({});

  const handleFeatureModification = (category: string, modification: Record<string, any>) => {
    setFeatureModifications(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        ...modification
      }
    }));

    // Apply modification to canvas
    if (canvasRef.current) {
      const imageNode = imagesRef.current.get(category);
      if (imageNode) {
        Object.entries(modification).forEach(([key, value]) => {
          imageNode[key](value);
        });
        layerRef.current?.batchDraw();
      }
    }
  };

  // Add flip handler function (near other transform handlers)
  const handleFeatureFlip = (direction: 'horizontal' | 'vertical') => {
    if (!canvasRef.current || !selectedFeatureForMovement) return;
    
    const featureType = selectedFeatureForMovement === 'faceShape' ? 'faceShape' : selectedFeatureForMovement.toLowerCase();
    canvasRef.current.flipFeature(featureType, direction);
  };

  // Add new state for attributes loading
  const [isApplyingAttributes, setIsApplyingAttributes] = useState(false);

  const detectInitialSkinTone = async (feature: string, layers: Layer[]) => {
    try {
      const stage = stageRef.current;
      if (!stage) return;

      // For 'all' features, we want to detect the base face skin tone
      const targetLayers = feature === 'all' 
        ? layers.filter(layer => {
            const layerCategory = layer.feature.category.toLowerCase();
            return layerCategory === 'face' || layerCategory === 'faceshape';
          })
        : layers.filter(layer => {
            const layerCategory = layer.feature.category.toLowerCase();
            return layerCategory === feature.toLowerCase() || 
                   (feature === 'face' && layerCategory === 'faceshape');
          });

      if (targetLayers.length === 0) return;

      const dataURL = stage.toDataURL();
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataURL;
      });

      tempCanvas.width = stage.width();
      tempCanvas.height = stage.height();
      tempCtx.drawImage(img, 0, 0);

      const skinAnalysis = await analyzeFacialSkin(tempCanvas, targetLayers);
      if (skinAnalysis?.dominantColor) {
        const { s, l } = skinAnalysis.dominantColor;
        // Calculate a percentage based on saturation and lightness
        const percentage = Math.round(((s + l) / 2) * 100);
        
        // Store the original skin tone
        setOriginalSkinTones(prev => ({
          ...prev,
          [feature]: percentage,
          // For 'all', also store it as the face value
          ...(feature === 'all' ? { face: percentage } : {})
        }));

        // Set the initial slider value to match the detected skin tone
        setAttributes(prev => ({
          ...prev,
          skinTone: percentage
        }));
      }
    } catch (error) {
      console.error('Error detecting initial skin tone:', error);
    }
  };

  // Update useEffect to detect initial skin tones when features are loaded
  useEffect(() => {
    if (layers.length > 0) {
      const features = ['all', 'face', 'eyes', 'nose', 'mouth', 'eyebrows']; // Added 'all' to the list
      features.forEach(feature => {
        detectInitialSkinTone(feature, layers);
      });
    }
  }, [layers]);

  // Update handleSkinToneChange to store original value if not already stored
  const handleSkinToneChange = async (value: number, feature: string = 'all') => {
    // Skip if we're resetting to original
    if (isResettingToOriginal) return;

    // If this is the first adjustment for this feature, store the original value
    if (originalSkinTones[feature] === undefined) {
      await detectInitialSkinTone(feature, layers);
    }

    console.log('handleSkinToneChange called:', { value, feature });
    setIsApplyingAttributes(true);
    
    try {
      setAttributes(prev => ({
        ...prev,
        skinTone: value
      }));

      if (!canvasRef.current) return;

      const stage = stageRef.current;
      if (!stage) return;

      // Get only the layers that match the selected feature
      const targetLayers = feature === 'all' 
        ? layers 
        : layers.filter(layer => {
            const layerCategory = layer.feature.category.toLowerCase();
            const selectedFeature = feature.toLowerCase();
            
            // Special handling for face/faceshape
            if (selectedFeature === 'face') {
              return layerCategory === 'face' || layerCategory === 'faceshape';
            }
            
            return layerCategory === selectedFeature;
          });

      console.log('Adjusting skin tone for layers:', targetLayers);

      if (targetLayers.length === 0) {
        console.warn('No matching layers found for feature:', feature);
        return;
      }

      // Create analysis for the specific feature(s)
      const dataURL = stage.toDataURL();
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataURL;
      });

      tempCanvas.width = stage.width();
      tempCanvas.height = stage.height();
      tempCtx.drawImage(img, 0, 0);

      // Get skin analysis for the specific feature(s)
      const skinAnalysis = await analyzeFacialSkin(tempCanvas, targetLayers);
      
      // Apply skin tone only to the selected feature(s)
      for (const layer of targetLayers) {
        if (canvasRef.current) {
          await canvasRef.current.adjustSkinTone(value, skinAnalysis, layer.id);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error('Error in handleSkinToneChange:', error);
      toast.error('Failed to adjust skin tone');
    } finally {
      setIsApplyingAttributes(false);
    }
  };

  // Update handleContrastChange
  const handleContrastChange = async (value: number, feature: string = 'all') => {
    console.log('Handling contrast change:', { value, feature });
    setIsApplyingAttributes(true);
    
    try {
      setAttributes(prev => ({
        ...prev,
        contrast: value
      }));

      if (canvasRef.current) {
        const targetLayers = feature === 'all' 
          ? layers 
          : layers.filter(layer => {
              const layerCategory = layer.feature.category.toLowerCase();
              return layerCategory === feature.toLowerCase() || 
                     (feature === 'face' && layerCategory === 'faceshape');
            });

        // Apply contrast to each layer individually
        for (const layer of targetLayers) {
          await canvasRef.current.adjustContrast(value, layer.id);
        }

        // Add delay only when applying to all features
        if (feature === 'all') {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    } catch (error) {
      console.error('Error adjusting contrast:', error);
      toast.error('Failed to adjust contrast');
    } finally {
      setIsApplyingAttributes(false);
    }
  };

  // Update handleSharpnessChange
  const handleSharpnessChange = async (value: number, feature: string = 'all') => {
    console.log('Handling sharpness change:', { value, feature });
    setIsApplyingAttributes(true);
    
    try {
      setAttributes(prev => ({
        ...prev,
        sharpness: value
      }));

      if (canvasRef.current) {
        const targetLayers = feature === 'all' 
          ? layers 
          : layers.filter(layer => {
              const layerCategory = layer.feature.category.toLowerCase();
              return layerCategory === feature.toLowerCase() || 
                     (feature === 'face' && layerCategory === 'faceshape');
            });

        // Apply sharpness to each layer individually
        for (const layer of targetLayers) {
          await canvasRef.current.adjustSharpness(value, layer.id);
        }

        // Add delay only when applying to all features
        if (feature === 'all') {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    } catch (error) {
      console.error('Error adjusting sharpness:', error);
      toast.error('Failed to adjust sharpness');
    } finally {
      setIsApplyingAttributes(false);
    }
  };

  // Add AttributesLoadingOverlay component
  const AttributesLoadingOverlay = () => {
    if (!isApplyingAttributes) return null;
    
    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="bg-background/95 backdrop-blur-sm rounded-lg p-8 shadow-xl flex flex-col items-center gap-4 min-w-[300px]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin">
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" 
                   style={{ animationDuration: '0.6s' }} 
              />
            </div>
          </div>
          <div className="text-lg font-semibold">Adjusting Attributes</div>
          <div className="text-sm text-muted-foreground text-center">
            Please wait while we process your changes...
          </div>
        </div>
      </div>
    );
  };

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    fileType: 'png',
    quality: 1
  });

  const handleExport = async () => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    let dataURL;
    
    try {
      switch (exportSettings.fileType) {
        case 'ai':
        case 'eps':
          try {
            // Convert stage to SVG
            const svg = stage.toDataURL({
              pixelRatio: 3,
              mimeType: 'image/svg+xml'
            });

            // Create download link with appropriate extension
            const link = document.createElement('a');
            link.download = `composite-image.${exportSettings.fileType}`;
            link.href = svg;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(
              `Downloaded as SVG with .${exportSettings.fileType} extension. For full vector editing, open in Adobe Illustrator.`,
              { duration: 5000 }
            );
            setShowExportDialog(false);
            return;
          } catch (error) {
            console.error('Vector export error:', error);
            toast.error(`Failed to generate ${exportSettings.fileType.toUpperCase()} file. Falling back to SVG format.`);
            return;
          }

        case 'pdf':
          try {
            const pdf = new jsPDF({
              orientation: 'landscape',
              unit: 'px',
              format: [stage.width(), stage.height()]
            });
            
            const imgData = stage.toDataURL({
              pixelRatio: 3,
              mimeType: 'image/jpeg',
              quality: 1
            });
            
            pdf.addImage(imgData, 'JPEG', 0, 0, stage.width(), stage.height());
            pdf.save('composite-image.pdf');
            setShowExportDialog(false);
            return;
          } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF. Please try another format.');
            return;
          }

        case 'jpg':
        case 'jpeg':
          dataURL = stage.toDataURL({
            mimeType: 'image/jpeg',
            quality: exportSettings.quality,
            pixelRatio: 3
          });
          break;

        case 'webp':
          dataURL = stage.toDataURL({
            mimeType: 'image/webp',
            quality: exportSettings.quality,
            pixelRatio: 3
          });
          break;

        default: // png
          dataURL = stage.toDataURL({
            pixelRatio: 3
          });
      }

      // Handle download for non-PDF formats
      const link = document.createElement('a');
      link.download = `composite-image.${exportSettings.fileType}`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowExportDialog(false);

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export image. Please try another format.');
    }
  };

  const handlePrint = () => {
    if (!stageRef.current) return;
    
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Composite</title>
            <style>
              @media print {
                img { 
                  max-width: 100%;
                  height: auto;
                }
              }
            </style>
          </head>
          <body>
            <img src="${dataURL}" onload="window.print();window.close()" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const [showNewDialog, setShowNewDialog] = useState(false)

  // Add handler for new button click
  const handleNew = () => {
    setShowNewDialog(true)
  }

  const handleNewComposite = (formData: FormData) => {
    // Reset current canvas/features
    setLayers([])
    setSelectedFeatureId(null)
    setFeatures([])
    
    // Reset zoom and other settings
    setZoom(190)
    setAttributes({
      skinTone: 50,
      contrast: 50,
      sharpness: 50
    })

    // You might want to save the form data to state or context
    // for reference later
    console.log('New composite form data:', formData)

    // Show success message
    toast.success('New composite created')
  }

  // Add these state variables
  const [selectedStyle, setSelectedStyle] = useState('original');
  const [selectedTexture, setSelectedTexture] = useState('none');
  const [effectControls, setEffectControls] = useState({
    effectStrength: 100,
    lineWeight: 50,
    textureIntensity: 50
  });

  // Add new state for effect loading
  const [isApplyingEffect, setIsApplyingEffect] = useState(false);

  // Modify handleStyleChange to properly wait for effects
  const handleStyleChange = async (style: string) => {
    console.log('Changing style to:', style);
    
    if (canvasRef.current) {
      if (style !== 'original') {
        setIsApplyingEffect(true);
        console.log('Starting effect application...');
      }
      
      try {
        setSelectedStyle(style);
        
        switch(style) {
          case 'original':
            await canvasRef.current.resetAllFilters();
            setEffectControls({
              effectStrength: 0,
              lineWeight: 50,
              textureIntensity: 50
            });
            break;
            
          case 'policeSketch':
            // First reset filters
            await canvasRef.current.resetAllFilters();
            
            setEffectControls({
              effectStrength: 100,
              lineWeight: 50,
              textureIntensity: 50
            });

            // Wait for all effects to be applied
            const applyEffects = async () => {
              try {
                // Apply effects sequentially
                await canvasRef.current.adjustPoliceSketchEffect(100);
                await canvasRef.current.adjustLineWeight(50);
                await canvasRef.current.adjustTextureIntensity(50);
                
                // Add a small delay after effects are applied to ensure rendering is complete
                await new Promise(resolve => setTimeout(resolve, 500));
              } catch (error) {
                console.error('Error applying effects:', error);
                throw error; // Re-throw to be caught by outer try-catch
              }
            };

            // Wait for all effects to complete
            await applyEffects();
            break;
        }
      } catch (error) {
        console.error('Error applying style:', error);
        toast.error('Failed to apply effect');
      } finally {
        // Add a small delay before removing loading state
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Effect application complete');
        setIsApplyingEffect(false);
      }
    }
  };

  // Update handleEffectControlChange for better synchronization
  const handleEffectControlChange = async (key: string, value: number) => {
    // Update UI immediately
    setEffectControls(prev => ({
      ...prev,
      [key]: value
    }));
    
    if (canvasRef.current) {
      const shouldShowLoading = Math.abs(value - effectControls[key as keyof typeof effectControls]) > 20;
      
      if (shouldShowLoading) {
        setIsApplyingEffect(true);
      }
      
      try {
        switch(selectedStyle) {
          case 'policeSketch':
            switch(key) {
              case 'effectStrength':
                if (value === 0) {
                  await canvasRef.current.resetAllFilters();
                  setSelectedStyle('original');
                } else {
                  await canvasRef.current.adjustPoliceSketchEffect(value);
                  // Wait for effect to complete
                  await new Promise(resolve => setTimeout(resolve, 200));
                }
                break;
                
              case 'lineWeight':
                await canvasRef.current.adjustLineWeight(value);
                await new Promise(resolve => setTimeout(resolve, 200));
                break;
                
              case 'textureIntensity':
                await canvasRef.current.adjustTextureIntensity(value);
                await new Promise(resolve => setTimeout(resolve, 200));
                break;
            }
            break;
        }
      } catch (error) {
        console.error('Error applying effect:', error);
        toast.error('Failed to apply effect');
      } finally {
        if (shouldShowLoading) {
          // Add a small delay before removing loading state
          await new Promise(resolve => setTimeout(resolve, 100));
          setIsApplyingEffect(false);
        }
      }
    }
  };

  const handleTextureChange = (texture: string) => {
    setSelectedTexture(texture);
    // Apply texture using Konva
    if (canvasRef.current) {
      const node = canvasRef.current.getNode();
      // Apply texture overlay
      node.cache();
      node.draw();
    }
  };

  // Add history state management
  const [history, setHistory] = useState<CompositeState[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1)
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false)

  // Function to save state to history
  const saveToHistory = () => {
    if (isUndoRedoAction) {
      setIsUndoRedoAction(false)
      return
    }

    const currentState: CompositeState = {
      features,
      zoom,
      layers,
      attributes,
      selectedFeatureId
    }

    // Remove any future states if we're not at the end of history
    const newHistory = history.slice(0, currentHistoryIndex + 1)
    setHistory([...newHistory, currentState])
    setCurrentHistoryIndex(currentHistoryIndex + 1)
  }

  // Undo handler
  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      setIsUndoRedoAction(true)
      const previousState = history[currentHistoryIndex - 1]
      
      // Restore previous state
      setFeatures(previousState.features)
      setZoom(previousState.zoom)
      setLayers(previousState.layers)
      setAttributes(previousState.attributes)
      setSelectedFeatureId(previousState.selectedFeatureId)
      
      setCurrentHistoryIndex(currentHistoryIndex - 1)
    }
  }

  // Redo handler
  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      setIsUndoRedoAction(true)
      const nextState = history[currentHistoryIndex + 1]
      
      // Restore next state
      setFeatures(nextState.features)
      setZoom(nextState.zoom)
      setLayers(nextState.layers)
      setAttributes(nextState.attributes)
      setSelectedFeatureId(nextState.selectedFeatureId)
      
      setCurrentHistoryIndex(currentHistoryIndex + 1)
    }
  }

  // Add effect to initialize history
  useEffect(() => {
    const initialState: CompositeState = {
      features: [],
      zoom: 190,
      layers: [],
      attributes: {
        skinTone: 50,
        contrast: 50,
        sharpness: 50
      },
      selectedFeatureId: null
    }
    setHistory([initialState])
    setCurrentHistoryIndex(0)
  }, [])

  // Add effect to save state changes to history
  useEffect(() => {
    if (!isUndoRedoAction) {
      saveToHistory()
    }
  }, [features, layers, attributes]) // Add other dependencies that should trigger history saves

  const navigate = useNavigate();

  // Add new state for dialog
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Add handler for exit confirmation
  const handleExit = () => {
    setShowExitDialog(true);
  };

  const handleExitConfirm = () => {
    navigate('/dashboard');
  };

  const handleSaveAndExit = async () => {
    setIsSaving(true);
    try {
      // Your save logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated save
      navigate('/dashboard');
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Add state for help dialog
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  // Update the Help button onClick handler
  <Button
    variant="ghost"
    size="icon"
    className="h-8 w-8"
    onClick={() => setShowHelpDialog(true)}
    title="Help"
  >
    <HelpCircle className="h-4 w-4" />
  </Button>

  // Add new state for settings
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [gridSize, setGridSize] = useState(20);

  // Update the Settings Dropdown section
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="Canvas Settings"
      >
        <Settings2 className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium">Canvas Settings</h4>
        </div>

        {/* Grid Settings */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-muted-foreground">Grid</h5>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-muted">
                  <Grid className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <label className="text-sm font-medium">Show Grid</label>
                  <p className="text-xs text-muted-foreground">Display grid lines on canvas</p>
                </div>
              </div>
              <Switch
                checked={showGrid}
                onCheckedChange={setShowGrid}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-muted">
                  <Magnet className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <label className="text-sm font-medium">Snap to Grid</label>
                  <p className="text-xs text-muted-foreground">Align elements to grid</p>
                </div>
              </div>
              <Switch
                checked={snapToGrid}
                onCheckedChange={setSnapToGrid}
                disabled={!showGrid}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Grid Size</label>
                <span className="text-sm text-muted-foreground">{gridSize}px</span>
              </div>
              <Slider
                value={[gridSize]}
                onValueChange={([value]) => setGridSize(value)}
                min={10}
                max={50}
                step={5}
                disabled={!showGrid}
              />
            </div>
          </div>
        </div>

        {/* Canvas Behavior */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-muted-foreground">Behavior</h5>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-muted">
                  <Save className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <label className="text-sm font-medium">Auto Save</label>
                  <p className="text-xs text-muted-foreground">Save changes automatically</p>
                </div>
              </div>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-muted">
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <label className="text-sm font-medium">Smooth Dragging</label>
                  <p className="text-xs text-muted-foreground">Enable smooth drag animations</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-muted-foreground">Performance</h5>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-muted">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <label className="text-sm font-medium">Hardware Acceleration</label>
                  <p className="text-xs text-muted-foreground">Use GPU for better performance</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => {
              setShowGrid(false);
              setSnapToGrid(false);
              setGridSize(20);
              setAutoSave(true);
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>

  // At the top with other state declarations
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)

  // ... rest of the existing code ...

  // Update the LoadingEffectOverlay component
  const LoadingEffectOverlay = () => {
    if (!isApplyingEffect) return null;
    
    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="bg-background/95 backdrop-blur-sm rounded-lg p-8 shadow-xl flex flex-col items-center gap-4 min-w-[300px]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin">
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" 
                   style={{ animationDuration: '0.6s' }} 
              />
            </div>
          </div>
          <div className="text-lg font-semibold">Applying Effects</div>
          <div className="text-sm text-muted-foreground text-center">
            Please wait while we process your changes...
          </div>
        </div>
      </div>
    );
  };

  // Add this near other state declarations at the top of the CompositeEditor component
  const [selectedAttributeFeature, setSelectedAttributeFeature] = useState<'all' | 'face' | 'eyes' | 'eyebrows' | 'nose' | 'mouth'>('all');

  // Add this to your state declarations
  const [originalSkinTones, setOriginalSkinTones] = useState<Record<string, number>>({});

  // Add this state near your other state declarations
  const [isResettingToOriginal, setIsResettingToOriginal] = useState(false);

  // Add these to your state declarations
  const [originalValues, setOriginalValues] = useState<Record<string, Record<string, number>>>({});

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-background">
        <div className="flex h-full">
          {/* Left Panel */}
          <div className={cn(
            "flex flex-col border-r bg-background transition-all duration-300",
            isCollapsed ? "w-[60px]" : "w-[280px]"
          )}>
            {/* Top Actions */}
            <div className={cn(
              "border-b",
              isCollapsed ? "p-2" : "p-4"
            )}>
              <div className={cn(
                "flex items-center",
                isCollapsed ? "justify-center" : "justify-between"
              )}>
                {!isCollapsed && (
                  <span className="text-sm font-medium">Tools Panel</span>
                )}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={cn(
                    "rounded-lg transition-colors hover:bg-accent",
                    isCollapsed ? "h-8 w-8" : "h-10 w-10"
                  )}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={cn(
              "border-b",
              isCollapsed ? "p-2" : "p-6"
            )}>
              {/* First row: New, Save, Download */}
              <div className={cn(
                "grid place-items-center",
                isCollapsed ? "grid-cols-1 gap-2" : "grid-cols-3 gap-6 mb-6"
              )}>
                <div className="flex flex-col items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-lg",
                      isCollapsed ? "h-8 w-8" : "h-10 w-10"
                    )}
                    title="New"
                    onClick={handleNew}
                  >
                    <FileIcon className={cn(
                      isCollapsed ? "h-4 w-4" : "h-5 w-5"
                    )} />
                  </Button>
                  {!isCollapsed && <span className="text-xs text-muted-foreground">New</span>}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-lg",
                      isCollapsed ? "h-8 w-8" : "h-10 w-10"
                    )}
                    title="Save"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className={cn(
                        isCollapsed ? "h-4 w-4" : "h-5 w-5",
                        "animate-spin"
                      )} />
                    ) : (
                      <Save className={cn(
                        isCollapsed ? "h-4 w-4" : "h-5 w-5"
                      )} />
                    )}
                  </Button>
                  {!isCollapsed && (
                    <span className="text-xs text-muted-foreground">
                      {isSaving ? "Saving..." : "Save"}
                    </span>
                  )}
                </div>
                <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                  <DialogTrigger asChild>
                    <div className="flex flex-col items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "rounded-lg",
                          isCollapsed ? "h-8 w-8" : "h-10 w-10"
                        )}
                        title="Download"
                      >
                        <Download className={cn(
                          isCollapsed ? "h-4 w-4" : "h-5 w-5"
                        )} />
                      </Button>
                      {!isCollapsed && <span className="text-xs text-muted-foreground">Download</span>}
                    </div>
                  </DialogTrigger>
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
                        <Button onClick={handleExport}>
                          Export
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Second row: Print, Undo, Redo */}
              <div className={cn(
                "grid place-items-center",
                isCollapsed ? "grid-cols-1 gap-2" : "grid-cols-3 gap-6"
              )}>
                <div className="flex flex-col items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-lg",
                      isCollapsed ? "h-8 w-8" : "h-10 w-10"
                    )}
                    title="Print"
                    onClick={handlePrint}
                  >
                    <Printer className={cn(
                      isCollapsed ? "h-4 w-4" : "h-5 w-5"
                    )} />
                  </Button>
                  {!isCollapsed && <span className="text-xs text-muted-foreground">Print</span>}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-lg",
                      isCollapsed ? "h-8 w-8" : "h-10 w-10"
                    )}
                    title="Undo"
                    onClick={handleUndo}
                    disabled={currentHistoryIndex <= 0}
                  >
                    <Undo className={cn(
                      isCollapsed ? "h-4 w-4" : "h-5 w-5"
                    )} />
                  </Button>
                  {!isCollapsed && <span className="text-xs text-muted-foreground">Undo</span>}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-lg",
                      isCollapsed ? "h-8 w-8" : "h-10 w-10"
                    )}
                    title="Redo"
                    onClick={handleRedo}
                    disabled={currentHistoryIndex >= history.length - 1}
                  >
                    <Redo className={cn(
                      isCollapsed ? "h-4 w-4" : "h-5 w-5"
                    )} />
                  </Button>
                  {!isCollapsed && <span className="text-xs text-muted-foreground">Redo</span>}
                </div>
              </div>
            </div>

            {/* Tools */}
            <ScrollArea className="flex-1">
              <div className={cn(
                "space-y-1",
                isCollapsed ? "p-2" : "p-3"
              )}>
                {[
                  { icon: <Layers className="h-5 w-5" />, label: "Layers" },
                  { icon: <Move className="h-5 w-5" />, label: "Feature Adjustment" },
                  { icon: <ImageIcon className="h-5 w-5" />, label: "Feature Selection" },
                  { icon: <Sliders className="h-5 w-5" />, label: "Attributes" },
                  { icon: <Brush className="h-5 w-5" />, label: "Artistic Effects" }
                ].map((tool) => (
                  <Button 
                    key={tool.label}
                    variant={activeTool === tool.label ? "secondary" : "ghost"}
                    className={cn(
                      "w-full rounded-lg",
                      isCollapsed 
                        ? "h-8 justify-center px-0" 
                        : "h-12 justify-start gap-3"
                    )}
                    title={isCollapsed ? tool.label : undefined}
                    onClick={() => setActiveTool(activeTool === tool.label ? null : tool.label)}
                  >
                    <div className={cn(
                      isCollapsed ? "h-4 w-4" : "h-5 w-5"
                    )}>
                      {tool.icon}
                    </div>
                    {!isCollapsed && <span>{tool.label}</span>}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Canvas */}
          <div className="flex-1">
            <div className="relative h-full">
              {/* Canvas Background */}
              <div className="absolute inset-0 bg-[url('/grid-dark.svg')] dark:bg-[url('/grid-light.svg')] opacity-50 dark:opacity-30" />
              
              {/* Canvas Header */}
              <div className="absolute top-0 left-0 right-0 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="h-full px-4 flex items-center justify-between">
                  {/* Left Section */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={handleExit}
                    >
                      <ArrowLeftCircle className="h-4 w-4" />
                      <span className="text-sm">Back</span>
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Canvas</span>
                    </div>
                  </div>

                  {/* Center Section - Canvas Controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border bg-background/95 p-1 gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => handleZoom(zoom - 10)}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Input 
                        type="number" 
                        value={zoom}
                        onChange={(e) => handleZoom(Number(e.target.value))}
                        className="h-7 w-16 text-center border-0 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min={100}
                        max={300}
                        step={10}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => handleZoom(zoom + 10)}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex items-center gap-2">
                    {/* Share button removed */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowHistoryDialog(true)}
                      title="History"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Canvas Settings"
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80">
                        <div className="p-4 space-y-4">
                          {/* Header */}
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Settings2 className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">Canvas Settings</h4>
                          </div>

                          {/* Grid Settings */}
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium text-muted-foreground">Grid</h5>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-muted">
                                    <Grid className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Show Grid</label>
                                    <p className="text-xs text-muted-foreground">Display grid lines on canvas</p>
                                  </div>
                                </div>
                                <Switch
                                  checked={showGrid}
                                  onCheckedChange={setShowGrid}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-muted">
                                    <Magnet className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Snap to Grid</label>
                                    <p className="text-xs text-muted-foreground">Align elements to grid</p>
                                  </div>
                                </div>
                                <Switch
                                  checked={snapToGrid}
                                  onCheckedChange={setSnapToGrid}
                                  disabled={!showGrid}
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm">Grid Size</label>
                                  <span className="text-sm text-muted-foreground">{gridSize}px</span>
                                </div>
                                <Slider
                                  value={[gridSize]}
                                  onValueChange={([value]) => setGridSize(value)}
                                  min={10}
                                  max={50}
                                  step={5}
                                  disabled={!showGrid}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Canvas Behavior */}
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium text-muted-foreground">Behavior</h5>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-muted">
                                    <Save className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Auto Save</label>
                                    <p className="text-xs text-muted-foreground">Save changes automatically</p>
                                  </div>
                                </div>
                                <Switch
                                  checked={autoSave}
                                  onCheckedChange={setAutoSave}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-muted">
                                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Smooth Dragging</label>
                                    <p className="text-xs text-muted-foreground">Enable smooth drag animations</p>
                                  </div>
                                </div>
                                <Switch defaultChecked />
                              </div>
                            </div>
                          </div>

                          {/* Performance */}
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium text-muted-foreground">Performance</h5>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-muted">
                                    <Zap className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Hardware Acceleration</label>
                                    <p className="text-xs text-muted-foreground">Use GPU for better performance</p>
                                  </div>
                                </div>
                                <Switch defaultChecked />
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="pt-4 border-t">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={() => {
                                setShowGrid(false);
                                setSnapToGrid(false);
                                setGridSize(20);
                                setAutoSave(true);
                              }}
                            >
                              Reset to Defaults
                            </Button>
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Separator orientation="vertical" className="h-6" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowHelpDialog(true)}
                      title="Help"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                    <ModeToggle />
                  </div>
                </div>
              </div>

              {/* Canvas Content */}
              <div className="h-full pt-12 flex items-center justify-center">
                <div className="w-[512px] h-[512px] bg-background rounded-xl border shadow-md relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Canvas 
                      ref={canvasRef}
                      stageRef={stageRef}
                      width={512}
                      height={512}
                      layers={layers}
                      zoom={zoom}
                      selectedFeatureId={selectedFeatureId}
                      onFeatureSelect={(id) => setSelectedFeatureId(id)}
                      onDrop={handleFeatureDrop}
                      initialZoom={zoom}
                      initialFeatures={initialFeatures}
                      disableDragging={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Tool Panel */}
          {renderToolPanel()}
        </div>
      </div>

      {/* All dialogs should be here at the end */}
      <NewCompositeDialog 
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSubmit={handleNewComposite}
      />

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="max-w-[360px] p-5">
          <AlertDialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              <AlertDialogTitle className="text-lg">Exit Editor?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              You have unsaved changes in your composite.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-2 py-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer" onClick={handleSaveAndExit}>
              <div className="p-1.5 rounded-full bg-primary/10">
                <Save className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Save & exit</h4>
                <p className="text-xs text-muted-foreground">
                  Save your current work before exiting
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer" onClick={handleExitConfirm}>
              <div className="p-1.5 rounded-full bg-amber-500/10">
                <X className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Exit without saving</h4>
                <p className="text-xs text-muted-foreground">
                  All unsaved changes will be lost
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExitDialog(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Help Dialog here */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-[800px] h-[600px] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl">Help Center</DialogTitle>
          </DialogHeader>
          
          <div className="flex h-[calc(100%-60px)]">
            {/* Sidebar */}
            <div className="w-[240px] border-r p-4 space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                size="sm"
              >
                <Layers className="h-4 w-4" />
                <span>Getting Started</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                size="sm"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Features & Tools</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                size="sm"
              >
                <Sliders className="h-4 w-4" />
                <span>Adjustments</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                size="sm"
              >
                <Brush className="h-4 w-4" />
                <span>Artistic Effects</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                size="sm"
              >
                <Keyboard className="h-4 w-4" />
                <span>Keyboard Shortcuts</span>
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {/* Quick Start Section */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Quick Start Guide</h2>
                    <div className="grid gap-4">
                      <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                        <div className="p-2 rounded-full bg-primary/10">
                          <CircleUser className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">1. Select Face Shape</h3>
                          <p className="text-sm text-muted-foreground">
                            Start by choosing a base face shape from the Feature Selection panel
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Eye className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">2. Add Facial Features</h3>
                          <p className="text-sm text-muted-foreground">
                            Add eyes, nose, mouth, and other features to build the composite
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Sliders className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">3. Adjust & Refine</h3>
                          <p className="text-sm text-muted-foreground">
                            Fine-tune positions, sizes, and apply artistic effects
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Keyboard Shortcuts Section */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Common Shortcuts</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Undo</span>
                          <kbd className="px-2 py-1 rounded bg-muted">��� Z</kbd>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Redo</span>
                          <kbd className="px-2 py-1 rounded bg-muted">⌘ ⇧ Z</kbd>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Save</span>
                          <kbd className="px-2 py-1 rounded bg-muted">⌘ S</kbd>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Zoom In</span>
                          <kbd className="px-2 py-1 rounded bg-muted">⌘ +</kbd>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Zoom Out</span>
                          <kbd className="px-2 py-1 rounded bg-muted">⌘ -</kbd>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Reset Zoom</span>
                          <kbd className="px-2 py-1 rounded bg-muted">⌘ 0</kbd>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-[400px] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl flex items-center gap-2">
              <History className="h-5 w-5" />
              History
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[500px]">
            <div className="p-6">
              <div className="space-y-6">
                {/* Current State */}
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current State</span>
                      <span className="text-xs text-muted-foreground">Just now</span>
                    </div>
                  </div>
                </div>

                {/* Timeline line */}
                <div className="ml-[5px] border-l-2 border-dashed border-muted-foreground/20 space-y-6">
                  {/* Example history items */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="relative pl-8">
                      <div className="absolute left-[-5px] h-2.5 w-2.5 rounded-full border-2 border-muted bg-background"></div>
                      <div className="flex items-start justify-between gap-2 rounded-lg border p-3 bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Feature Modified</p>
                          <p className="text-xs text-muted-foreground">Adjusted nose position</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">2m ago</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer with info */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Click on any history state to preview. Press restore to revert to that state.
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-muted/50">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setShowHistoryDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                className="flex-1"
                onClick={() => {
                  // Restore functionality would go here
                  setShowHistoryDialog(false)
                }}
              >
                Restore Selected
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add loading overlay */}
      <LoadingEffectOverlay />
      <AttributesLoadingOverlay />
    </DndProvider>
  )
} 