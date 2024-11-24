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
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DraggableLayer } from '@/components/DraggableLayer'

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

  const renderToolPanel = () => {
    if (!activeTool) return null;

    return (
      <DndProvider backend={HTML5Backend}>
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
              <div className="p-4 space-y-4">
                {layers.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No layers added yet
                  </div>
                ) : (
                  <div className="space-y-2">
                      {[...layers].reverse().map((layer, index) => (
                        <DraggableLayer
                        key={layer.id}
                          id={layer.id}
                          index={layers.length - 1 - index}
                          layer={layer}
                          moveLayer={reorderLayers}
                          toggleVisibility={toggleLayerVisibility}
                          updateOpacity={updateLayerOpacity}
                          deleteLayer={deleteLayer}
                        />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        )}
            </div>
      </DndProvider>
    );
  };

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

  return (
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
  )
} 