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
  Search, Filter, X, Check
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

export default function CompositeEditor() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTool, setActiveTool] = useState<string | null>(null)

  // Dummy layers data
  const [layers, setLayers] = useState<Layer[]>([])

  // Add attributes state
  const [attributes, setAttributes] = useState({
    skinTone: 50,
    contrast: 50,
    wrinkles: 0,
    hostility: 0,
    friendliness: 50,
    happiness: 50,
    weight: 50,
    hardness: 50,
    angular: 50,
  })

  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
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
  const [features, setFeatures] = useState<FeatureItem[]>([])
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
        const response = await api.get(`/api/features/${selectedFeature.toLowerCase()}`);
        console.log('API Response:', response.data);
        
        if (response.data?.success && Array.isArray(response.data.data)) {
          if (response.data.data.length === 0) {
            console.warn(`No features found for category: ${selectedFeature}`);
          }
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
      
      // Update zIndex for all layers
      return newLayers.map((layer, idx) => ({
        ...layer,
        zIndex: newLayers.length - idx - 1 // Highest index = top layer
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
                  { key: 'skinTone', label: 'Skin Tone' },
                  { key: 'contrast', label: 'Contrast' },
                  { key: 'wrinkles', label: 'Wrinkles' },
                  { key: 'hostility', label: 'Hostility' },
                  { key: 'friendliness', label: 'Friendliness' },
                  { key: 'happiness', label: 'Happiness' },
                  { key: 'weight', label: 'Weight' },
                  { key: 'hardness', label: 'Hardness' },
                  { key: 'angular', label: 'Angular' },
                ].map((attr) => (
                  <div key={attr.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{attr.label}</span>
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

        {activeTool === "Move" && (
          <>
            <div className="p-4 border-b">
              <span className="font-medium">Transform Controls</span>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Movement Controls */}
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

                    {/* Feature Selection */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Eyes", icon: <Eye className="h-4 w-4" /> },
                        { label: "Nose", icon: <StretchHorizontal className="h-4 w-4" /> },
                        { label: "Mouth", icon: <StretchHorizontal className="h-4 w-4 rotate-180" /> },
                        { label: "Ears", icon: <StretchVertical className="h-4 w-4" /> },
                        { label: "Eyebrows", icon: <StretchHorizontal className="h-4 w-4" /> },
                        { label: "Face Shape", icon: <Maximize2 className="h-4 w-4" /> },
                      ].map((feature) => (
                        <Button
                          key={feature.label}
                          variant={selectedFeatureForMovement === feature.label ? "secondary" : "outline"}
                          className="h-9 justify-start gap-2"
                          onClick={() => handleFeatureSelectionForMovement(feature.label)}
                        >
                          {feature.icon}
                          <span className="text-sm">{feature.label}</span>
                        </Button>
                      ))}
                    </div>

                    {/* Movement Grid */}
                    <div className="bg-muted/40 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-2 place-items-center">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={() => handleFeatureMovement('upLeft')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowUpLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={() => handleFeatureMovement('up')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={() => handleFeatureMovement('upRight')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={() => handleFeatureMovement('left')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="h-9 w-9 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                        </div>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={() => handleFeatureMovement('right')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={() => handleFeatureMovement('downLeft')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowDownLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={() => handleFeatureMovement('down')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={() => handleFeatureMovement('downRight')}
                          disabled={!selectedFeatureForMovement}
                        >
                          <ArrowDownRight className="h-4 w-4" />
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

                {/* Scale Controls */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Scale Step Size</span>
                    <span className="text-xs text-muted-foreground">{scaleStepSize * 100}%</span>
                  </div>
                  <Slider
                    value={[scaleStepSize * 100]}
                    min={1}
                    max={50}
                    step={1}
                    onValueChange={([value]) => setScaleStepSize(value / 100)}
                  />
                  
                  {/* Horizontal Scale */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleFeatureScale('horizontal', false)}
                      disabled={!selectedFeatureForMovement}
                    >
                      <ChevronsLeftRight className="h-4 w-4 mr-2" />
                      Scale In
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleFeatureScale('horizontal', true)}
                      disabled={!selectedFeatureForMovement}
                    >
                      <ChevronsLeftRight className="h-4 w-4 mr-2" />
                      Scale Out
                    </Button>
                  </div>

                  {/* Vertical Scale */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleFeatureScale('vertical', false)}
                      disabled={!selectedFeatureForMovement}
                    >
                      <ChevronsUpDown className="h-4 w-4 mr-2" />
                      Scale In
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleFeatureScale('vertical', true)}
                      disabled={!selectedFeatureForMovement}
                    >
                      <ChevronsUpDown className="h-4 w-4 mr-2" />
                      Scale Out
                    </Button>
                  </div>
                </div>

                {/* Stretch & Squeeze Controls */}
                <div className="space-y-3">
                  <span className="text-sm font-medium">Stretch & Squeeze</span>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Vertical */}
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">Vertical</span>
                      <div className="grid grid-cols-1 gap-2">
                        <Button variant="secondary" size="sm" className="h-9">
                          <ChevronsUpDown className="h-4 w-4 mr-2" />
                          Stretch
                        </Button>
                        <Button variant="secondary" size="sm" className="h-9">
                          <ChevronsUpDown className="h-4 w-4 mr-2 rotate-180" />
                          Squeeze
                        </Button>
                      </div>
                    </div>

                    {/* Horizontal */}
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">Horizontal</span>
                      <div className="grid grid-cols-1 gap-2">
                        <Button variant="secondary" size="sm" className="h-9">
                          <ChevronsLeftRight className="h-4 w-4 mr-2" />
                          Stretch
                        </Button>
                        <Button variant="secondary" size="sm" className="h-9">
                          <ChevronsLeftRight className="h-4 w-4 mr-2 rotate-180" />
                          Squeeze
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pinch & Stretch Controls */}
                <div className="space-y-3">
                  <span className="text-sm font-medium">Pinch & Stretch</span>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Upper Part */}
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">Upper Part</span>
                      <div className="grid grid-cols-1 gap-2">
                        <Button variant="secondary" size="sm" className="h-9">
                          <ChevronsLeftRight className="h-4 w-4 mr-2 rotate-[-45deg]" />
                          Pinch
                        </Button>
                        <Button variant="secondary" size="sm" className="h-9">
                          <ChevronsLeftRight className="h-4 w-4 mr-2 rotate-[-45deg] scale-x-[-1]" />
                          Stretch
                        </Button>
                      </div>
                    </div>

                    {/* Lower Part */}
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">Lower Part</span>
                      <div className="grid grid-cols-1 gap-2">
                        <Button variant="secondary" size="sm" className="h-9">
                          <ChevronsLeftRight className="h-4 w-4 mr-2 rotate-45deg" />
                          Pinch
                        </Button>
                        <Button variant="secondary" size="sm" className="h-9">
                          <ChevronsLeftRight className="h-4 w-4 mr-2 rotate-45deg scale-x-[-1]" />
                          Stretch
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        )}

        {activeTool === "Transform" && (
          <>
            <div className="p-4 border-b">
              <span className="font-medium">Transform Controls</span>
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
                                  {value}%
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
                                  {value}%
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
                                {value}%
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
                                  {value}%
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
                                  {value}%
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

        {activeTool === "Features" && (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <span className="font-medium">Feature Library</span>
                {selectedFeature && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSelectedFeature(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {!selectedFeature ? (
                  // Feature Categories
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { 
                        label: "Eyes",
                        icon: <Eye className="h-5 w-5" />
                      },
                      { 
                        label: "Nose",
                        icon: <StretchHorizontal className="h-5 w-5" />
                      },
                      { 
                        label: "Mouth",
                        icon: <StretchHorizontal className="h-5 w-5 rotate-180" />
                      },
                      { 
                        label: "Ears",
                        icon: <StretchVertical className="h-5 w-5" />
                      },
                      { 
                        label: "Eyebrows",
                        icon: <StretchHorizontal className="h-5 w-5" />
                      },
                      { 
                        label: "Face Shape",
                        icon: <Maximize2 className="h-5 w-5" />
                      },
                      { 
                        label: "Hair",
                        value: "hair",
                        icon: <StretchVertical className="h-5 w-5 rotate-45" />
                      }
                    ].map((feature) => (
                      <Button
                        key={feature.label}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center gap-2 hover:border-primary group relative"
                        onClick={() => setSelectedFeature(feature.label)}
                      >
                        <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center group-hover:border-primary transition-colors">
                          {feature.icon}
                        </div>
                        <div className="text-sm font-medium">{feature.label}</div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  // Feature Database View
                  <div className="space-y-4">
                    {/* Back Button */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedFeature(null)}
                      className="h-8 px-2"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder={`Search ${selectedFeature}...`}
                        className="pl-8" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {loading ? (
                        // Loading placeholders
                        Array(6).fill(null).map((_, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-lg bg-muted/50 animate-pulse"
                          />
                        ))
                      ) : features.length > 0 ? (
                        features
                          .filter(feature => 
                            searchQuery === "" || 
                            feature.name.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((feature) => (
                            <div
                              key={feature.id}
                              className={cn(
                                "relative rounded-lg bg-muted/50 border-2 transition-all cursor-pointer",
                                "hover:border-primary/50 hover:bg-muted/70",
                                selectedFeatureId === feature.id ? "border-primary" : "border-transparent"
                              )}
                              style={{ aspectRatio: '1' }}
                              onClick={() => handleFeatureClick(feature)}
                            >
                              <img 
                                src={feature.url}
                                alt={`${feature.category} type ${feature.type}`}
                                className="w-full h-full object-contain p-2"
                                draggable={false}
                              />
                              {selectedFeatureId === feature.id && (
                                <div className="absolute top-2 right-2">
                                  <Check className="h-4 w-4 text-primary" />
                                </div>
                              )}
                            </div>
                          ))
                      ) : (
                        <div className="col-span-2 text-center text-muted-foreground py-8">
                          No features found {searchQuery && "for your search"}
                        </div>
                      )}
                    </div>
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
      // Convert features to layers
      const newLayers = location.state.features.map((feature: Feature, index: number) => ({
        id: feature.id,
        name: feature.category,
        visible: true,
        opacity: 100,
        feature: feature,
        zIndex: index
      }))
      setLayers(newLayers)
    }
  }, [location.state])

  // Inside CompositeEditor component, add new state
  const [movementStepSize, setMovementStepSize] = useState(5)
  const [selectedFeatureForMovement, setSelectedFeatureForMovement] = useState<string | null>(null);

  // Add this function to handle feature selection for movement
  const handleFeatureSelectionForMovement = (featureLabel: string) => {
    setSelectedFeatureForMovement(prev => prev === featureLabel ? null : featureLabel);
  };

  // Add movement handler
  const handleFeatureMovement = (direction: 'up' | 'down' | 'left' | 'right' | 'upLeft' | 'upRight' | 'downLeft' | 'downRight') => {
    if (!canvasRef.current || !selectedFeatureForMovement) return;

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
    console.log('Moving feature:', selectedFeatureForMovement, 'by:', movement);
    canvasRef.current.moveFeature(selectedFeatureForMovement, movement.x, movement.y);
  };

  // Add new state for rotation
  const [rotationAngle, setRotationAngle] = useState(5); // Default 5 degrees per click

  // Add rotation handler
  const handleFeatureRotation = (direction: 'clockwise' | 'counterclockwise') => {
    if (!canvasRef.current || !selectedFeatureForMovement) return;

    const angle = direction === 'clockwise' ? rotationAngle : -rotationAngle;
    canvasRef.current.rotateFeature(selectedFeatureForMovement, angle);
  };

  // Add new state for scale
  const [scaleStepSize, setScaleStepSize] = useState(0.1);

  // Add scale handler functions
  const handleFeatureScale = (direction: 'horizontal' | 'vertical', increase: boolean) => {
    if (!canvasRef.current || !selectedFeatureForMovement) return;

    const scaleFactor = increase ? 1 + scaleStepSize : 1 - scaleStepSize;
    
    if (direction === 'horizontal') {
      canvasRef.current.scaleFeature(selectedFeatureForMovement, scaleFactor, 1);
    } else {
      canvasRef.current.scaleFeature(selectedFeatureForMovement, 1, scaleFactor);
    }
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
                    isCollapsed ? "h-8 w-8" : "h-8 w-8"
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
                  { icon: <Sliders className="h-5 w-5" />, label: "Attributes" },
                  { icon: <Move className="h-5 w-5" />, label: "Move" },
                  { icon: <ArrowDownUp className="h-5 w-5" />, label: "Transform" },
                  { icon: <ImageIcon className="h-5 w-5" />, label: "Features" }
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