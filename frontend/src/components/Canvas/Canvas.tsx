import { Stage, Layer, Image, Line, Rect, Transformer } from 'react-konva'
import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import { KonvaEventObject } from 'konva/lib/Node'
import Konva from 'konva'
import { debounce } from 'lodash';

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
  brushSettings?: BrushSettings;
  isBrushActive?: boolean;
  selectedFeatureForBrush?: string;
}

interface CanvasRef {
  addFeature: (feature: any) => void
  moveFeature: (featureType: string, deltaX: number, deltaY: number) => void
  rotateFeature: (featureType: string, angle: number) => void
  scaleFeature: (featureType: string, scaleX: number, scaleY: number) => void
  flipFeature: (featureType: string, direction: 'horizontal' | 'vertical') => void
  adjustSkinTone: (value: number, skinAnalysis?: SkinAnalysisResult) => void
  adjustContrast: (value: number) => void
  adjustSharpness: (value: number) => void
  adjustPoliceSketchEffect: (value: number) => void
  adjustLineWeight: (value: number) => void
  adjustTextureIntensity: (value: number) => void
  resetAllFilters: () => void
}

const Canvas = forwardRef<CanvasRef, CanvasProps>((props, ref) => {
  const { width, height, layers, zoom, stageRef: externalStageRef } = props
  const internalStageRef = useRef<Konva.Stage>(null)
  const stageRef = externalStageRef || internalStageRef
  const layerRef = useRef<Konva.Layer>(null)
  const imagesRef = useRef<Map<string, Konva.Image>>(new Map())
  const [lines, setLines] = useState<Array<{
    points: number[];
    size: number;
    opacity: number;
    feature: string;
  }>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedFeatureBounds, setSelectedFeatureBounds] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const applySkinToneFilter = async (value: number, skinAnalysis?: SkinAnalysisResult) => {
    console.log('applySkinToneFilter called:', { value, skinAnalysis });
    const normalizedValue = value / 100;
    console.log('Normalized value:', normalizedValue);
    
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

      if (hasSkin) {
        // If value is 0, remove all HSL filters
        if (value === 0) {
          const currentFilters = image.filters() || [];
          const newFilters = currentFilters.filter(filter => filter !== Konva.Filters.HSL);
          image.filters(newFilters);
          
          // Reset HSL values
          image.saturation(1);
          image.brightness(1);
          image.hue(0);
        } else {
          // Apply HSL filters as before
          let currentFilters = image.filters() || [];
          if (!currentFilters.includes(Konva.Filters.HSL)) {
            currentFilters.push(Konva.Filters.HSL);
            image.filters(currentFilters);
          }
          
          // Rest of your existing filter application code
          if (skinAnalysis?.dominantColor) {
            const { h, s, l } = skinAnalysis.dominantColor;
            const strengthMultiplier = category === 'face' || category === 'nose' ? 1.0 :
                                     category === 'mouth' ? 0.8 :
                                     category === 'eyes' || category === 'eyebrows' ? 0.6 :
                                     0.7;
            
            image.saturation(Math.max(0, Math.min(1, s/100 + (normalizedValue * 0.3 * strengthMultiplier))));
            const lightnessAdjustment = normalizedValue * 0.2 * strengthMultiplier;
            image.brightness(Math.max(0, Math.min(1, l/100 + lightnessAdjustment)));
            const warmth = normalizedValue > 0 ? normalizedValue * 0.1 * strengthMultiplier : 0;
            image.hue(warmth);
          } else {
            // Fallback adjustments
            const strengthMultiplier = category === 'face' || category === 'nose' ? 1.0 :
                                     category === 'mouth' ? 0.8 :
                                     category === 'eyes' || category === 'eyebrows' ? 0.6 :
                                     0.7;
            
            image.saturation(0.5 + (normalizedValue * 0.2 * strengthMultiplier));
            image.brightness(0.5 + (normalizedValue * 0.15 * strengthMultiplier));
          }
        }
        
        image.cache();
      }
    });
    
    layerRef.current?.batchDraw();
  };

  const applyContrastFilter = (value: number) => {
    console.log('Applying contrast adjustment:', value);
    // Increase the contrast range by using a larger multiplier
    const normalizedValue = ((value - 50) / 50) * 8; // Changed from 4 to 8 for stronger effect
    
    imagesRef.current.forEach((image, id) => {
      // Get category for feature-specific adjustments
      const category = id.split('_')[0];
      
      // Preserve existing filters (like HSL) and add Contrast if not present
      let currentFilters = image.filters() || [];
      if (!currentFilters.includes(Konva.Filters.Contrast)) {
        currentFilters.push(Konva.Filters.Contrast);
      }
      
      // Make sure we're not losing HSL filters if they exist
      if (!currentFilters.includes(Konva.Filters.HSL) && 
          category === 'face') {
        currentFilters.push(Konva.Filters.HSL);
      }
      
      // Apply all filters
      image.filters(currentFilters);
      
      // Increased multipliers for stronger contrast
      const contrastMultiplier = 
        category === 'face' ? 1.5 :    // Increased from 1.2
        category === 'eyes' ? 2.0 :    // Increased from 1.5
        category === 'eyebrows' ? 1.8 : // Increased from 1.3
        category === 'nose' ? 1.5 :    // Increased from 1.2
        category === 'mouth' ? 1.4 :   // Increased from 1.1
        1.3;                          // Increased from 1.0
      
      // Apply contrast with multiplier
      image.contrast(normalizedValue * contrastMultiplier);
      
      // Important: Cache the result
      image.cache();
    });
    
    // Force redraw
    layerRef.current?.batchDraw();
  };

  const applySharpnessFilter = (value: number) => {
    console.log('Applying sharpness adjustment with value:', value);
    
    // Debounce the filter application
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
        imagesRef.current.forEach((image, id) => {
          const category = id.split('_')[0];
          let currentFilters = image.filters() || [];
          
          // Reset filters if value is at neutral (50)
          if (value === 50) {
            currentFilters = currentFilters.filter(
              filter => filter !== Konva.Filters.Enhance
            );
            image.filters(currentFilters);
            image.enhance(0);
          } else {
            // Add Enhance filter if not present
            if (!currentFilters.includes(Konva.Filters.Enhance)) {
              currentFilters.push(Konva.Filters.Enhance);
            }
            
            image.filters(currentFilters);
            
            // More subtle normalization range
            const normalizedValue = (value - 50) / 100; // Reduced range for subtler effect
            
            // Reduced multipliers for more subtle effect
            const sharpnessMultiplier = 
              category === 'face' ? 0.3 :     // Reduced from 0.5
              category === 'eyes' ? 0.6 :     // Reduced from 1.2
              category === 'eyebrows' ? 0.4 : // Reduced from 0.8
              category === 'nose' ? 0.3 :     // Reduced from 0.6
              category === 'mouth' ? 0.3 :    // Reduced from 0.7
              0.3;                           // Default
            
            // Apply single enhance filter for better performance
            image.enhance(normalizedValue * sharpnessMultiplier);
          }
          
          // Cache the result
          image.cache();
        });
        
        // Single batch draw for better performance
        layerRef.current?.batchDraw();
      });
    }
  };

  const resetAllFilters = () => {
    console.log('Resetting all filters');
    
    imagesRef.current.forEach((image) => {
      let currentFilters = image.filters() || [];
      
      // Remove all artistic effect filters
      currentFilters = currentFilters.filter(filter => 
        filter !== Konva.Filters.Grayscale &&
        filter !== Konva.Filters.Contrast &&
        filter !== Konva.Filters.Enhance &&
        filter !== Konva.Filters.Noise
      );
      
      // Apply cleaned filters array
      image.filters(currentFilters);
      
      // Reset all filter values
      image.contrast(1);
      image.enhance(0);
      image.brightness(1);
      image.saturation(1);
      image.noise(0);
      
      // Cache the result
      image.cache();
    });

    // Redraw the layer
    layerRef.current?.batchDraw();
  };

  const adjustPoliceSketchEffect = debounce((value: number) => {
    console.log('Applying police sketch effect with value:', value);
    
    if (value === 0) {
      resetAllFilters();
      return;
    }

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const normalizedValue = value / 100;

      imagesRef.current.forEach((image) => {
        // Get current filters
        let currentFilters = image.filters() || [];
        const hasGrayscale = currentFilters.includes(Konva.Filters.Grayscale);
        const hasContrast = currentFilters.includes(Konva.Filters.Contrast);
        const hasEnhance = currentFilters.includes(Konva.Filters.Enhance);
        
        // Only update filters if they changed
        if (!hasGrayscale || !hasContrast || !hasEnhance) {
          // Add required filters if not present
          if (!hasGrayscale) currentFilters.push(Konva.Filters.Grayscale);
          if (!hasContrast) currentFilters.push(Konva.Filters.Contrast);
          if (!hasEnhance) currentFilters.push(Konva.Filters.Enhance);
          
          // Apply filters once
          image.filters(currentFilters);
        }
        
        // Apply filter values
        if (value > 0) {
          image.contrast(1 + normalizedValue * 2);
          image.enhance(normalizedValue * 0.5);
        }
        
        // Cache the result
        image.cache();
      });

      // Single batch draw for all changes
      layerRef.current?.batchDraw();
    });
  }, 16); // 60fps throttle

  const adjustLineWeight = debounce((value: number) => {
    console.log('Adjusting line weight:', value);
    
    requestAnimationFrame(() => {
      const normalizedValue = value / 100;
      
      imagesRef.current.forEach((image) => {
        let currentFilters = image.filters() || [];
        
        if (!currentFilters.includes(Konva.Filters.Enhance)) {
          currentFilters.push(Konva.Filters.Enhance);
          image.filters(currentFilters);
        }
        
        image.enhance(normalizedValue * 0.7);
        image.cache();
      });
      
      layerRef.current?.batchDraw();
    });
  }, 16);

  const adjustTextureIntensity = debounce((value: number) => {
    console.log('Adjusting texture intensity:', value);
    
    requestAnimationFrame(() => {
      const normalizedValue = value / 100;
      
      imagesRef.current.forEach((image) => {
        let currentFilters = image.filters() || [];
        
        if (!currentFilters.includes(Konva.Filters.Noise)) {
          currentFilters.push(Konva.Filters.Noise);
          image.filters(currentFilters);
        }
        
        image.noise(normalizedValue * 0.3);
        image.cache();
      });
      
      layerRef.current?.batchDraw();
    });
  }, 16);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (!props.isBrushActive) return;
    
    setIsDrawing(true);
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    setLines([...lines, {
      points: [pos.x, pos.y],
      size: props.brushSettings?.size || 5,
      opacity: props.brushSettings?.opacity || 1,
      feature: props.selectedFeatureForBrush || 'wholeFace'
    }]);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !props.isBrushActive) return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const lastLine = lines[lines.length - 1];
    if (!lastLine) return;

    const newLine = {
      ...lastLine,
      points: [...lastLine.points, pos.x, pos.y]
    };

    setLines([...lines.slice(0, -1), newLine]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
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
    },
    adjustContrast: (value: number) => {
      applyContrastFilter(value);
    },
    adjustSharpness: (value: number) => {
      console.log('adjustSharpness called with value:', value);
      applySharpnessFilter(value);
    },
    adjustPoliceSketchEffect,
    adjustLineWeight,
    adjustTextureIntensity,
    resetAllFilters
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

  useEffect(() => {
    return () => {
      setLines([]);
      setIsDrawing(false);
    };
  }, []);

  useEffect(() => {
    if (!props.selectedFeatureForBrush || !props.isBrushActive) {
      setSelectedFeatureBounds(null);
      return;
    }

    const selectedImage = Array.from(imagesRef.current.entries()).find(
      ([_, image]) => image.id().toLowerCase().includes(props.selectedFeatureForBrush.toLowerCase())
    );

    if (selectedImage) {
      const [_, image] = selectedImage;
      const box = image.getClientRect();
      setSelectedFeatureBounds(box);
    }
  }, [props.selectedFeatureForBrush, props.isBrushActive]);

  return (
    <div style={{ 
      cursor: props.isBrushActive ? 'url("/eraser-cursor.png") 8 8, auto' : 'default'
    }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        draggable={false}
        imageSmoothingEnabled={true}
        crossOrigin="anonymous"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Layer ref={layerRef} listening={false} />
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#000000"
              strokeWidth={line.size}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation="destination-out"
              opacity={line.opacity}
              listening={false}
            />
          ))}
          {selectedFeatureBounds && (
            <Rect
              x={selectedFeatureBounds.x}
              y={selectedFeatureBounds.y}
              width={selectedFeatureBounds.width}
              height={selectedFeatureBounds.height}
              stroke="#00ff00"
              strokeWidth={2}
              dash={[5, 5]}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
})

Canvas.displayName = 'Canvas'
export default Canvas 