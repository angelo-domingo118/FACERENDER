import { Stage, Layer, Image } from 'react-konva'
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { KonvaEventObject } from 'konva/lib/Node'
import Konva from 'konva'

interface CanvasProps {
  width: number
  height: number
  layers: Layer[]
  zoom: number
  selectedFeatureId: string | null
  onFeatureSelect: (id: string) => void
  onDrop: (feature: any) => void
  initialZoom: number
  initialFeatures: Feature[]
  disableDragging?: boolean
}

interface CanvasRef {
  addFeature: (feature: any) => void
  moveFeature: (featureType: string, deltaX: number, deltaY: number) => void
  rotateFeature: (featureType: string, angle: number) => void
  scaleFeature: (featureType: string, scaleX: number, scaleY: number) => void
}

const Canvas = forwardRef<CanvasRef, CanvasProps>((props, ref) => {
  const { width, height, layers, zoom } = props
  const stageRef = useRef<Konva.Stage>(null)
  const layerRef = useRef<Konva.Layer>(null)
  const imagesRef = useRef<Map<string, Konva.Image>>(new Map())

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    addFeature: (feature: any) => {
      // Existing addFeature logic
    },
    moveFeature: (featureType: string, deltaX: number, deltaY: number) => {
      // Find the layer with matching feature type (case-insensitive)
      const targetLayer = Array.from(imagesRef.current.entries()).find(
        ([_, image]) => image.id().toLowerCase().includes(featureType.toLowerCase())
      );

      if (targetLayer) {
        const [_, image] = targetLayer;
        // Apply movement
        image.x(image.x() + deltaX);
        image.y(image.y() + deltaY);
        layerRef.current?.batchDraw();
      }
    },
    rotateFeature: (featureType: string, angle: number) => {
      const targetLayer = Array.from(imagesRef.current.entries()).find(
        ([_, image]) => image.id().toLowerCase().includes(featureType.toLowerCase())
      );

      if (targetLayer) {
        const [_, image] = targetLayer;
        // Apply rotation
        image.rotation(image.rotation() + angle);
        layerRef.current?.batchDraw();
      }
    },
    scaleFeature: (featureType: string, scaleX: number, scaleY: number) => {
      const targetLayer = Array.from(imagesRef.current.entries()).find(
        ([_, image]) => image.id().toLowerCase().includes(featureType.toLowerCase())
      );

      if (targetLayer) {
        const [_, image] = targetLayer;
        // Get current scale
        const currentScaleX = image.scaleX();
        const currentScaleY = image.scaleY();
        
        // Apply new scale
        image.scale({
          x: currentScaleX * scaleX,
          y: currentScaleY * scaleY
        });
        
        layerRef.current?.batchDraw();
      }
    }
  }))

  useEffect(() => {
    if (!layerRef.current) return
    
    // Sort layers by zIndex (lower zIndex = bottom layer)
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex)

    // Handle removed layers
    const currentIds = new Set(sortedLayers.map(l => l.id))
    imagesRef.current.forEach((_, id) => {
      if (!currentIds.has(id)) {
        imagesRef.current.get(id)?.destroy()
        imagesRef.current.delete(id)
      }
    })

    // Update or add layers
    sortedLayers.forEach(layer => {
      if (!layer.visible) {
        // Hide existing image if it exists
        const existingImage = imagesRef.current.get(layer.id)
        if (existingImage) {
          existingImage.hide()
        }
        return
      }

      // Check if image already exists
      const existingImage = imagesRef.current.get(layer.id)
      if (existingImage) {
        // Update existing image properties
        const scaleX = width / existingImage.width()
        const scaleY = height / existingImage.height()
        const scale = Math.min(scaleX, scaleY) * (zoom / 100)
        const paddingFactor = 0.95

        existingImage.setAttrs({
          opacity: layer.opacity / 100,
          scaleX: scale * paddingFactor,
          scaleY: scale * paddingFactor,
          visible: true
        })
      } else {
        // Create new image only if it doesn't exist
        const image = new window.Image()
        image.src = layer.feature.url
        image.onload = () => {
          const scaleX = width / image.width
          const scaleY = height / image.height
          const scale = Math.min(scaleX, scaleY) * (zoom / 100)
          const paddingFactor = 0.95

          const imageNode = new Konva.Image({
            image: image,
            opacity: layer.opacity / 100,
            draggable: false,
            id: `${layer.feature.category.toLowerCase()}_${layer.id}`,
            x: width / 2,
            y: height / 2,
            width: image.width,
            height: image.height,
            scaleX: scale * paddingFactor,
            scaleY: scale * paddingFactor,
            offsetX: image.width / 2,
            offsetY: image.height / 2,
          })
          
          layerRef.current?.add(imageNode)
          imagesRef.current.set(layer.id, imageNode)
          layerRef.current?.batchDraw()
        }
      }
    })

    // Update layer order - iterate in reverse to ensure proper stacking
    for (let i = sortedLayers.length - 1; i >= 0; i--) {
      const layer = sortedLayers[i]
      const image = imagesRef.current.get(layer.id)
      if (image && layer.visible) {
        image.zIndex(i)
      }
    }

    layerRef.current.batchDraw()
  }, [layers, zoom, width, height])

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      draggable={false}
    >
      <Layer ref={layerRef} listening={false} />
    </Stage>
  )
})

Canvas.displayName = 'Canvas'
export default Canvas 