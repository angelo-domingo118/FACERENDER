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
  Search, Filter, X
} from "lucide-react"
import { useState } from "react"
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
  name: string
  preview: string
  tags: string[]
  category: string
  ethnicity?: string[]
  age?: string[]
}

export default function CompositeEditor() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTool, setActiveTool] = useState<string | null>(null)

  // Dummy layers data
  const [layers, setLayers] = useState([
    { id: 1, name: "Eyes", visible: true, opacity: 100 },
    { id: 2, name: "Nose", visible: true, opacity: 100 },
    { id: 3, name: "Mouth", visible: true, opacity: 100 },
  ])

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

  const dummyFeatures: FeatureItem[] = [
    {
      id: "1",
      name: "Almond Eyes",
      preview: "",
      category: "Eyes",
      tags: ["Natural", "Common"],
      ethnicity: ["Asian", "Caucasian"],
      age: ["Young", "Middle"]
    },
    {
      id: "2",
      name: "Round Eyes",
      preview: "",
      category: "Eyes",
      tags: ["Wide", "Expressive"],
      ethnicity: ["Caucasian"],
      age: ["Young"]
    },
    // Add more dummy features...
  ]

  const renderToolPanel = () => {
    if (!activeTool) return null;

    return (
      <div className="w-[320px] border-l flex flex-col bg-background">
        {activeTool === "Layers" && (
          <>
            <div className="p-4 border-b">
              <span className="font-medium">Layers</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Import className="h-4 w-4 mr-2" />
                    Import Layer
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1">
                  {layers.map((layer, index) => (
                    <div 
                      key={layer.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent group border border-transparent hover:border-border"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', index.toString())
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
                        const toIndex = index
                        const newLayers = [...layers]
                        const [movedLayer] = newLayers.splice(fromIndex, 1)
                        newLayers.splice(toIndex, 0, movedLayer)
                        setLayers(newLayers)
                      }}
                    >
                      <div className="cursor-grab">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setLayers(layers.map(l => 
                            l.id === layer.id 
                              ? { ...l, visible: !l.visible }
                              : l
                          ))
                        }}
                      >
                        {layer.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex-1 text-sm">{layer.name}</div>
                      <div className="hidden group-hover:flex items-center gap-1">
                        <Slider 
                          className="w-20"
                          value={[layer.opacity]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={([value]) => {
                            setLayers(layers.map(l =>
                              l.id === layer.id
                                ? { ...l, opacity: value }
                                : l
                            ))
                          }}
                        />
                        <span className="text-xs w-8 text-muted-foreground">
                          {layer.opacity}%
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => {
                            setLayers(layers.filter(l => l.id !== layer.id))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                {/* Feature Selection */}
                <div className="space-y-3">
                  <span className="text-sm font-medium">Feature Selection</span>
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
                        variant="outline"
                        className="h-9 justify-start gap-2 data-[selected=true]:bg-accent"
                        data-selected={false}
                        onClick={(e) => {
                          const btn = e.currentTarget;
                          btn.dataset.selected = btn.dataset.selected === "true" ? "false" : "true";
                        }}
                      >
                        {feature.icon}
                        <span className="text-sm">{feature.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Movement Controls */}
                <div className="space-y-3">
                  <span className="text-sm font-medium">Movement</span>
                  <div className="bg-muted/40 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-2 place-items-center">
                      <Button variant="secondary" size="icon" className="h-9 w-9">
                        <ArrowUpLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-9 w-9">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-9 w-9">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-9 w-9">
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div className="h-9 w-9 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                      </div>
                      <Button variant="secondary" size="icon" className="h-9 w-9">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-9 w-9">
                        <ArrowDownLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-9 w-9">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-9 w-9">
                        <ArrowDownRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Transform Controls */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Rotation */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Rotation</span>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="icon" className="h-9 w-9 flex-1">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-9 w-9 flex-1">
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Scale */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Scale</span>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="icon" className="h-9 w-9 flex-1">
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-9 w-9 flex-1">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                        icon: <Eye className="h-5 w-5" />,
                        count: dummyFeatures.filter(f => f.category === "Eyes").length
                      },
                      { 
                        label: "Nose",
                        icon: <StretchHorizontal className="h-5 w-5" />,
                        count: dummyFeatures.filter(f => f.category === "Nose").length
                      },
                      { 
                        label: "Mouth",
                        icon: <StretchHorizontal className="h-5 w-5 rotate-180" />,
                        count: dummyFeatures.filter(f => f.category === "Mouth").length
                      },
                      { 
                        label: "Ears",
                        icon: <StretchVertical className="h-5 w-5" />,
                        count: dummyFeatures.filter(f => f.category === "Ears").length
                      },
                      { 
                        label: "Eyebrows",
                        icon: <StretchHorizontal className="h-5 w-5" />,
                        count: dummyFeatures.filter(f => f.category === "Eyebrows").length
                      },
                      { 
                        label: "Face Shape",
                        icon: <Maximize2 className="h-5 w-5" />,
                        count: dummyFeatures.filter(f => f.category === "Face Shape").length
                      },
                    ].map((feature) => (
                      <Button
                        key={feature.label}
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary group relative"
                        onClick={() => setSelectedFeature(feature.label)}
                      >
                        <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center group-hover:border-primary transition-colors">
                          {feature.icon}
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{feature.label}</div>
                          <div className="text-xs text-muted-foreground">{feature.count} items</div>
                        </div>
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
                      {dummyFeatures
                        .filter(feature => 
                          feature.category === selectedFeature &&
                          (searchQuery === "" || 
                            feature.name.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                        )
                        .map((feature) => (
                          <Button
                            key={feature.id}
                            variant="outline"
                            className="h-32 p-2 flex flex-col items-center justify-between hover:border-primary group"
                          >
                            <div className="w-full h-20 rounded-md bg-muted flex items-center justify-center relative group-hover:bg-muted/70">
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-medium">Apply Feature</span>
                              </div>
                            </div>
                            <div className="w-full text-sm truncate text-center">
                              {feature.name}
                            </div>
                          </Button>
                        ))}
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
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <ModeToggle />
              </div>
            </div>

            {/* Canvas Content */}
            <div className="h-full pt-12 flex items-center justify-center">
              <div className="w-[512px] h-[512px] bg-background rounded-xl border shadow-md relative">
                {/* Optional: Add grid overlay */}
                <div className="absolute inset-0 bg-[url('/grid-overlay.svg')] opacity-5" />
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