import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva'
import { forwardRef, useEffect, useRef, useState, useImperativeHandle, useCallback } from 'react'
import { KonvaEventObject } from 'konva/lib/Node'
import ErrorBoundary from '@/components/ErrorBoundary'

interface FeaturePosition {
  id: string
  x: number
  y: number
  scale: number
  rotation: number
  url: string
  category: string
  width?: number
  height?: number
}

interface CanvasProps {
  width?: number
  height?: number
  features: Array<{
    id: string
    url: string
    category: string
    type: number
  }>
  onFeatureSelect?: (id: string) => void
  selectedFeatureId?: string | null
  onDrop?: (feature: any) => void
}

export interface CanvasRef {
  addFeature: (feature: {
    id: string
    url: string
    category: string
    position?: { x: number; y: number }
  }) => void
}

const logError = (error: any, context: string) => {
  console.error(`[Canvas] ${context}:`, error)
}

const logInfo = (message: string, data?: any) => {
  console.log(`[Canvas] ${message}`, data || '')
}

const Canvas = forwardRef<CanvasRef, CanvasProps>((props, ref) => {
  const [featurePositions, setFeaturePositions] = useState<FeaturePosition[]>([])
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: HTMLImageElement }>({})
  
  useImperativeHandle(ref, () => ({
    addFeature: (feature: {
      id: string
      url: string
      category: string
      position?: { x: number; y: number }
    }) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const maxSize = 150
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        const width = img.width * scale
        const height = img.height * scale

        const position = feature.position || { 
          x: props.width ? props.width / 2 : 256,
          y: props.height ? props.height / 2 : 256
        }

        const newPosition: FeaturePosition = {
          id: feature.id,
          url: feature.url,
          category: feature.category,
          x: position.x,
          y: position.y,
          scale: 1,
          rotation: 0,
          width,
          height
        }

        setLoadedImages(prev => ({ ...prev, [feature.url]: img }))
        setFeaturePositions(prev => [...prev, newPosition])
      }
      img.onerror = (error) => {
        console.error('Failed to load image:', feature.url, error)
      }
      img.src = feature.url
    }
  }))

  const renderFeature = useCallback((position: FeaturePosition) => {
    const image = loadedImages[position.url]
    
    if (!image) {
      console.log('Image not loaded yet for:', position.category)
      return null
    }

    return (
      <KonvaImage
        key={position.id}
        image={image}
        x={position.x}
        y={position.y}
        width={position.width}
        height={position.height}
        offsetX={position.width ? position.width / 2 : 0}
        offsetY={position.height ? position.height / 2 : 0}
        scaleX={position.scale}
        scaleY={position.scale}
        rotation={position.rotation}
        draggable
        onDragEnd={(e: KonvaEventObject<DragEvent>) => {
          const pos = e.target.position()
          setFeaturePositions(prev => 
            prev.map(p => p.id === position.id ? {...p, x: pos.x, y: pos.y} : p)
          )
        }}
      />
    )
  }, [loadedImages])

  // Add dimensions check with default values
  const width = props.width || 512
  const height = props.height || 512

  return (
    <ErrorBoundary fallback={<div>Error loading canvas</div>}>
      <Stage width={width} height={height}>
        <Layer>
          {featurePositions.map(renderFeature)}
        </Layer>
      </Stage>
    </ErrorBoundary>
  )
})

Canvas.displayName = 'Canvas'

export default Canvas 