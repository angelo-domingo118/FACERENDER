import { useDrag, useDrop } from 'react-dnd'
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"
import { Eye, EyeOff, GripVertical, Trash2 } from "lucide-react"

interface DraggableLayerProps {
  id: string
  index: number
  layer: Layer
  moveLayer: (dragIndex: number, hoverIndex: number) => void
  toggleVisibility: (id: string) => void
  updateOpacity: (id: string, value: number) => void
  deleteLayer: (id: string) => void
}

export function DraggableLayer({
  id,
  index,
  layer,
  moveLayer,
  toggleVisibility,
  updateOpacity,
  deleteLayer
}: DraggableLayerProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'LAYER',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'LAYER',
    hover(item: { id: string; index: number }) {
      if (item.index !== index) {
        moveLayer(item.index, index)
        item.index = index
      }
    },
  })

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`flex items-center gap-2 p-2 rounded-lg bg-muted/50 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => toggleVisibility(layer.id)}
      >
        {layer.visible ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </Button>
      
      <div className="flex-1">
        <p className="text-sm font-medium">{layer.name}</p>
        <Slider
          value={[layer.opacity]}
          min={0}
          max={100}
          step={1}
          className="w-full"
          onValueChange={([value]) => updateOpacity(layer.id, value)}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => deleteLayer(layer.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
} 