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
  stageRef?: React.RefObject<Konva.Stage>
}

interface CanvasRef {
  addFeature: (feature: any) => void
  moveFeature: (featureType: string, deltaX: number, deltaY: number) => void
  rotateFeature: (featureType: string, angle: number) => void
  scaleFeature: (featureType: string, scaleX: number, scaleY: number) => void
  flipFeature: (featureType: string, direction: 'horizontal' | 'vertical') => void
  adjustSkinTone: (value: number, skinAnalysis?: SkinAnalysisResult) => void
}

const Canvas = forwardRef<CanvasRef, CanvasProps>((props, ref) => {
  const { width, height, layers, zoom, stageRef: externalStageRef } = props
  const internalStageRef = useRef<Konva.Stage>(null)
  const stageRef = externalStageRef || internalStageRef
  const layerRef = useRef<Konva.Layer>(null)
  const imagesRef = useRef<Map<string, Konva.Image>>(new Map())

  const applySkinToneFilter = async (value: number, skinAnalysis?: SkinAnalysisResult) => {
    console.log('applySkinToneFilter called:', { value, skinAnalysis });
    const normalizedValue = value / 100;
    console.log('Normalized value:', normalizedValue);
    
    console.log('Current images in ref:', Array.from(imagesRef.current.keys()));
    
    imagesRef.current.forEach((image, id) => {
      console.log('Processing image:', { id });
      
      // Extract the category from the image ID
      const category = id.split('_')[0];
      
      // Expanded list of features that contain skin
      const hasSkin = [
        'face',
        'nose', 
        'mouth',
        'eyes',
        'eyebrows',
        'ears'
      ].includes(category);

      console.log('Image skin detection:', { id, category, hasSkin });
      
      if (hasSkin) {
        console.log('Applying filters to image:', id);
        image.filters([Konva.Filters.HSL]);
        
        // Use dominant color analysis for more accurate adjustments
        if (skinAnalysis?.dominantColor) {
          const { h, s, l } = skinAnalysis.dominantColor;
          console.log('Applying HSL adjustments:', { id, h, s, l, normalizedValue });
          
          // Adjust filter strength based on feature type
          const strengthMultiplier = category === 'face' || category === 'nose' ? 1.0 :
                                   category === 'mouth' ? 0.8 :
                                   category === 'eyes' || category === 'eyebrows' ? 0.6 :
                                   0.7; // default for other features
          
          // Apply adjusted HSL values
          image.saturation(Math.max(0, Math.min(1, s/100 + (normalizedValue * 0.3 * strengthMultiplier))));
          
          const lightnessAdjustment = normalizedValue * 0.2 * strengthMultiplier;
          image.brightness(Math.max(0, Math.min(1, l/100 + lightnessAdjustment)));
          
          // Add slight warmth adjustment for more natural look
          const warmth = normalizedValue > 0 ? normalizedValue * 0.1 * strengthMultiplier : 0;
          image.hue(warmth);
        } else {
          // Fallback adjustments with feature-specific strength
          const strengthMultiplier = category === 'face' || category === 'nose' ? 1.0 :
                                   category === 'mouth' ? 0.8 :
                                   category === 'eyes' || category === 'eyebrows' ? 0.6 :
                                   0.7;
                                   
          image.saturation(0.5 + (normalizedValue * 0.2 * strengthMultiplier));
          image.brightness(0.5 + (normalizedValue * 0.15 * strengthMultiplier));
        }
        
        image.cache();
      }
    });
    
    console.log('Calling batchDraw...');
    layerRef.current?.batchDraw();
  };

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
    },
    flipFeature: (featureType: string, direction: 'horizontal' | 'vertical') => {
      const targetLayer = Array.from(imagesRef.current.entries()).find(
        ([_, image]) => image.id().toLowerCase().includes(featureType.toLowerCase())
      );

      if (targetLayer) {
        const [_, image] = targetLayer;
        // Get current scale
        const currentScaleX = image.scaleX();
        const currentScaleY = image.scaleY();
        
        // Apply flip by negating the scale
        if (direction === 'horizontal') {
          image.scaleX(-currentScaleX);
        } else {
          image.scaleY(-currentScaleY);
        }
        
        layerRef.current?.batchDraw();
      }
    },
    adjustSkinTone: (value: number, skinAnalysis?: SkinAnalysisResult) => {
      console.log('adjustSkinTone ref method called:', { value });
      applySkinToneFilter(value, skinAnalysis);
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
        image.crossOrigin = 'anonymous'
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
      imageSmoothingEnabled={true}
      crossOrigin="anonymous"
    >
      <Layer ref={layerRef} listening={false} />
    </Stage>
  )
})

Canvas.displayName = 'Canvas'
export default Canvas 