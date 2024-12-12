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
  adjustSkinTone: (value: number, analysis: any, layerId: string) => void
  adjustContrast: (value: number, layerId?: string) => void
  adjustSharpness: (value: number, layerId?: string) => void
  adjustPoliceSketchEffect: (value: number) => void
  adjustLineWeight: (value: number) => void
  adjustTextureIntensity: (value: number) => void
  resetAllFilters: () => void
  resetFilters: (layerId: string) => void
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

  const applyContrastFilter = (value: number, layerId?: string) => {
    console.log('Applying contrast adjustment:', value, 'to layer:', layerId);
    const normalizedValue = ((value - 50) / 50) * 8;
    
    // If layerId is provided, only adjust that specific layer
    if (layerId) {
      const targetImage = imagesRef.current.get(layerId);
      if (!targetImage) return;

      let currentFilters = targetImage.filters() || [];
      if (!currentFilters.includes(Konva.Filters.Contrast)) {
        currentFilters.push(Konva.Filters.Contrast);
      }
      
      targetImage.filters(currentFilters);
      targetImage.contrast(normalizedValue);
      targetImage.cache();
    } else {
      // Original behavior for all layers
      imagesRef.current.forEach((image) => {
        let currentFilters = image.filters() || [];
        if (!currentFilters.includes(Konva.Filters.Contrast)) {
          currentFilters.push(Konva.Filters.Contrast);
        }
        image.filters(currentFilters);
        image.contrast(normalizedValue);
        image.cache();
      });
    }
    
    layerRef.current?.batchDraw();
  };

  const applySharpnessFilter = (value: number, layerId?: string) => {
    console.log('Applying sharpness adjustment:', value, 'to layer:', layerId);
    
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
        if (layerId) {
          const targetImage = imagesRef.current.get(layerId);
          if (!targetImage) return;

          let currentFilters = targetImage.filters() || [];
          if (value === 50) {
            currentFilters = currentFilters.filter(
              filter => filter !== Konva.Filters.Enhance
            );
            targetImage.filters(currentFilters);
            targetImage.enhance(0);
          } else {
            if (!currentFilters.includes(Konva.Filters.Enhance)) {
              currentFilters.push(Konva.Filters.Enhance);
            }
            targetImage.filters(currentFilters);
            const normalizedValue = (value - 50) / 100;
            targetImage.enhance(normalizedValue * 0.5);
          }
          targetImage.cache();
        } else {
          // Original behavior for all layers
          imagesRef.current.forEach((image) => {
            let currentFilters = image.filters() || [];
            if (value === 50) {
              currentFilters = currentFilters.filter(
                filter => filter !== Konva.Filters.Enhance
              );
              image.filters(currentFilters);
              image.enhance(0);
            } else {
              if (!currentFilters.includes(Konva.Filters.Enhance)) {
                currentFilters.push(Konva.Filters.Enhance);
              }
              image.filters(currentFilters);
              const normalizedValue = (value - 50) / 100;
              image.enhance(normalizedValue * 0.5);
            }
            image.cache();
          });
        }
        
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
    adjustSkinTone: (value: number, analysis: any, layerId: string) => {
      console.log('Adjusting skin tone for layer:', { layerId, value, analysis });
      
      // Find the image by layer ID
      const targetImage = imagesRef.current.get(layerId);
      if (!targetImage) {
        console.error('Target image not found for ID:', layerId);
        return;
      }

      // Get category from the image ID and check if it's a base face layer
      const imageId = targetImage.id().toLowerCase();
      console.log('Image ID:', imageId);
      
      // Find if this is a base face layer
      const isBaseFace = imageId.includes('faceshape') || 
                        (imageId.includes('face') && Array.from(imagesRef.current.entries())
                          .findIndex(([id]) => id === layerId) === 0);
                          
      const category = isBaseFace ? 'faceshape' : imageId.split('_')[0];
      console.log('Detected category:', category, 'isBaseFace:', isBaseFace);

      // If value is 0 or very close to 0, remove all filters
      if (value <= 1) {
        targetImage.filters([]);
        targetImage.saturation(1);
        targetImage.brightness(1);
        targetImage.contrast(1);
        targetImage.hue(0);
        targetImage.cache();
        layerRef.current?.batchDraw();
        return;
      }

      const normalizedValue = value / 100;

      // Add HSL filter if not present
      let currentFilters = targetImage.filters() || [];
      if (!currentFilters.includes(Konva.Filters.HSL)) {
        currentFilters.push(Konva.Filters.HSL);
        targetImage.filters(currentFilters);
      }

      // Apply skin tone adjustments based on analysis
      if (analysis?.dominantColor) {
        const { h, s, l } = analysis.dominantColor;
        
        if (isBaseFace) {
          // Enhanced adjustments specifically for base face
          targetImage.saturation(Math.max(0, Math.min(1, s/100 + (normalizedValue * 0.5)))); // Stronger effect
          const lightnessAdjustment = normalizedValue * 0.3; // Stronger effect
          targetImage.brightness(Math.max(0, Math.min(1, l/100 + lightnessAdjustment)));
          const warmth = normalizedValue > 0 ? normalizedValue * 0.2 : 0; // Stronger effect
          targetImage.hue(warmth);
        } else {
          // Regular feature adjustments
          const strengthMultiplier = 
            category === 'nose' ? 1.0 :
            category === 'mouth' ? 0.8 :
            category === 'eyes' || category === 'eyebrows' ? 0.6 :
            0.7;

          targetImage.saturation(Math.max(0, Math.min(1, s/100 + (normalizedValue * 0.3 * strengthMultiplier))));
          const lightnessAdjustment = normalizedValue * 0.2 * strengthMultiplier;
          targetImage.brightness(Math.max(0, Math.min(1, l/100 + lightnessAdjustment)));
          const warmth = normalizedValue > 0 ? normalizedValue * 0.1 * strengthMultiplier : 0;
          targetImage.hue(warmth);
        }
      } else {
        // Fallback adjustments
        if (isBaseFace) {
          // Enhanced fallback adjustments for base face
          targetImage.saturation(0.5 + (normalizedValue * 0.3));
          targetImage.brightness(0.5 + (normalizedValue * 0.25));
        } else {
          const strengthMultiplier = 
            category === 'nose' ? 1.0 :
            category === 'mouth' ? 0.8 :
            category === 'eyes' || category === 'eyebrows' ? 0.6 :
            0.7;

          targetImage.saturation(0.5 + (normalizedValue * 0.2 * strengthMultiplier));
          targetImage.brightness(0.5 + (normalizedValue * 0.15 * strengthMultiplier));
        }
      }

      // Cache and redraw
      targetImage.cache();
      layerRef.current?.batchDraw();
    },
    adjustContrast: (value: number, layerId?: string) => {
      applyContrastFilter(value, layerId);
    },
    adjustSharpness: (value: number, layerId?: string) => {
      console.log('adjustSharpness called with value:', value, 'layerId:', layerId);
      applySharpnessFilter(value, layerId);
    },
    adjustPoliceSketchEffect,
    adjustLineWeight,
    adjustTextureIntensity,
    resetAllFilters,
    resetFilters: (layerId: string) => {
      const targetImage = imagesRef.current.get(layerId);
      if (!targetImage) return;

      console.log('Resetting filters for layer:', layerId);

      // Remove all filters first
      targetImage.filters([]);
      
      // Reset all filter-related properties to their default values
      targetImage.saturation(1);
      targetImage.brightness(1);
      targetImage.contrast(1);
      targetImage.hue(0);
      targetImage.value(1);
      targetImage.blurRadius(0);
      targetImage.red(1);
      targetImage.green(1);
      targetImage.blue(1);
      targetImage.alpha(1);
      
      // Ensure HSL filters are removed
      targetImage.filters([]);
      
      // Cache and redraw
      targetImage.cache();
      layerRef.current?.batchDraw();
    },
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