import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { 
  FileIcon, Save, Printer, Undo, Redo,
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
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import api from '@/lib/api'
import Canvas from '@/components/Canvas/Canvas'
import { createFeatherMask, analyzeAndBlendFeature } from '@/lib/colorBlending';
import { useLocation } from "react-router-dom"
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DraggableLayer } from "@/components/DraggableLayer"
import { toast } from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
}

interface CompositeState {
  features: Feature[]
  zoom: number
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

export default function CompositeEditor() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTool, setActiveTool] = useState<string | null>(null)

  // Dummy layers data
  const [layers, setLayers] = useState<Layer[]>([])

  // Update attributes state
  const [attributes, setAttributes] = useState({
    skinTone: 50,
    contrast: 50,
    age: 50,
    symmetry: 50,      // Controls facial symmetry
    sharpness: 50,     // Controls feature definition/clarity
    blur: 50,         // Controls feature softness/blur
    lighting: 50       // Controls lighting/shadow balance
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
                    onClick={() => setSelectedFeature(category.value)}
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
                {[
                  { 
                    key: 'skinTone', 
                    label: 'Skin Tone',
                    description: 'Adjust overall skin color' 
                  },
                  { 
                    key: 'contrast', 
                    label: 'Contrast',
                    description: 'Enhance feature definition' 
                  },
                  { 
                    key: 'age', 
                    label: 'Age',
                    description: 'Adjust age-related characteristics' 
                  },
                  { 
                    key: 'symmetry', 
                    label: 'Symmetry',
                    description: 'Balance facial features' 
                  },
                  { 
                    key: 'sharpness', 
                    label: 'Sharpness',
                    description: 'Control feature clarity' 
                  },
                  { 
                    key: 'blur', 
                    label: 'Blur',
                    description: 'Soften facial features' 
                  },
                  { 
                    key: 'lighting', 
                    label: 'Lighting',
                    description: 'Control shadows and highlights' 
                  }
                ].map((attr) => (
                  <div key={attr.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm">{attr.label}</span>
                        <p className="text-xs text-muted-foreground">{attr.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {attributes[attr.key as keyof typeof attributes]}%
                      </span>
                    </div>
                    <Slider
                      value={[attributes[attr.key as keyof typeof attributes]]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([value]) => {
                        setAttributes(prev => ({
                          ...prev,
                          [attr.key]: value
                        }))
                      }}
                      className="w-full"
                    />
                  </div>
                ))}
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

  // Add this function to handle feature selection
  const handleFeatureSelect = async (feature: FeatureItem) => {
    try {
      setSelectedFeatureId(feature.id);

      // Update layers while preserving modifications
      setLayers(prev => {
        return prev.map(layer => {
          if (layer.feature.category === selectedFeature) {
            // Preserve existing modifications for this category
            const existingMods = featureModifications[selectedFeature] || {};
            
            return {
              ...layer,
              id: feature.id,
              feature: {
                ...feature,
                needsBlending: selectedFeature !== 'faceShape',
                blendSettings: selectedFeature !== 'faceShape' ? {
                  category: selectedFeature,
                  ...existingMods // Apply existing modifications
                } : undefined
              }
            };
          }
          return layer;
        });
      });

      // Update canvas with new feature while preserving modifications
      if (canvasRef.current) {
        const imageNode = imagesRef.current.get(selectedFeature);
        if (imageNode) {
          const img = new Image();
          img.src = feature.url;
          img.onload = () => {
            imageNode.image(img);
            
            // Reapply modifications after loading new image
            const mods = featureModifications[selectedFeature];
            if (mods) {
              Object.entries(mods).forEach(([key, value]) => {
                imageNode[key](value);
              });
            }
            
            layerRef.current?.batchDraw();
          };
        }
      }
    } catch (error) {
      console.error('Error updating feature:', error);
      toast({
        title: "Error",
        description: "Failed to update feature",
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
                  >
                    <Save className={cn(
                      isCollapsed ? "h-4 w-4" : "h-5 w-5"
                    )} />
                  </Button>
                  {!isCollapsed && <span className="text-xs text-muted-foreground">Save</span>}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-lg",
                      isCollapsed ? "h-8 w-8" : "h-10 w-10"
                    )}
                    title="Print"
                  >
                    <Printer className={cn(
                      isCollapsed ? "h-4 w-4" : "h-5 w-5"
                    )} />
                  </Button>
                  {!isCollapsed && <span className="text-xs text-muted-foreground">Print</span>}
                </div>
              </div>
              <div className={cn(
                "grid place-items-center",
                isCollapsed ? "grid-cols-1 gap-2" : "grid-cols-2 gap-6"
              )}>
                <div className="flex flex-col items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-lg",
                      isCollapsed ? "h-8 w-8" : "h-10 w-10"
                    )}
                    title="Undo"
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
                  { icon: <Sliders className="h-5 w-5" />, label: "Attributes" }
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
              <div className="absolute top-0 left-0 right-0 h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 flex items-center justify-between">
                <span className="text-sm font-medium">Canvas</span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleZoom(zoom - 10)}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center bg-muted rounded-md px-2">
                    <Input 
                      type="number" 
                      value={zoom}
                      onChange={(e) => handleZoom(Number(e.target.value))}
                      className="h-8 w-16 text-center border-0 bg-transparent"
                      min={100}
                      max={300}
                      step={10}
                    />
                    <span className="text-sm text-muted-foreground ml-1">%</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleZoom(zoom + 10)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <ModeToggle />
                </div>
              </div>

              {/* Canvas Content */}
              <div className="h-full pt-12 flex items-center justify-center">
                <div className="w-[512px] h-[512px] bg-background rounded-xl border shadow-md relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Canvas 
                      ref={canvasRef}
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
    </DndProvider>
  )
} 