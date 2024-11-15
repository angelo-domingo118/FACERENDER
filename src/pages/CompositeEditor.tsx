import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  Save,
  Undo,
  Redo,
  RotateCw,
  Download,
  Layers,
  Settings2
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CompositeEditor() {
  console.log('CompositeEditor mounted')
  const navigate = useNavigate()
  const [zoom, setZoom] = useState(100)

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4 gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Composite Editor</h1>
            <p className="text-sm text-muted-foreground">
              Fine-tune and adjust facial features
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="default" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Tools Panel */}
        <div className="w-64 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Tools</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Redo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Layers className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="features" className="flex-1">
            <TabsList className="w-full justify-start rounded-none border-b h-10 [&>*]:flex-1">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="adjust">Adjust</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1">
              <TabsContent value="features" className="m-0 p-4">
                <div className="space-y-4">
                  {/* Feature categories would go here */}
                  {['Face Shape', 'Eyes', 'Nose', 'Mouth', 'Eyebrows'].map((feature) => (
                    <div key={feature} className="space-y-2">
                      <h3 className="text-sm font-medium">{feature}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2].map((i) => (
                          <div 
                            key={i}
                            className="aspect-square rounded-md bg-muted/50 border-2 border-transparent hover:border-primary/50 cursor-pointer"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="adjust" className="m-0 p-4">
                {/* Adjustment controls would go here */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Size</label>
                    <Input type="range" className="w-full" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Position</label>
                    <Input type="range" className="w-full" />
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b p-4 flex items-center justify-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="w-20">
              <Input 
                type="number" 
                value={zoom}
                onChange={(e) => setZoom(Math.min(150, Math.max(50, Number(e.target.value))))}
                className="text-center"
                min={50}
                max={150}
                step={10}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setZoom(Math.min(150, zoom + 10))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 p-8 flex items-center justify-center bg-[url(/grid.svg)]">
            <div 
              className="w-[512px] h-[512px] bg-background rounded-lg border shadow-sm flex items-center justify-center"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center',
              }}
            >
              <span className="text-sm text-muted-foreground">Canvas Area</span>
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className="w-64 border-l">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <span className="font-medium">Properties</span>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-4 space-y-4">
              {/* Properties would go here */}
              <div>
                <label className="text-sm font-medium">Opacity</label>
                <Input type="range" className="w-full" />
              </div>
              <div>
                <label className="text-sm font-medium">Blend Mode</label>
                <Input type="range" className="w-full" />
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
} 