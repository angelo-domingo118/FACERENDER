import { useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Circle } from 'react-konva';
import { detectFaceLandmarks, getFeaturePosition } from '@/lib/faceLandmarks';

interface LandmarkPoint {
  x: number;
  y: number;
  category: string;
}

export default function PreviewCanvas({ width, height, features, zoom = 100 }) {
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [landmarks, setLandmarks] = useState<LandmarkPoint[]>([]);
  const [stageScale, setStageScale] = useState(1);

  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: Record<string, HTMLImageElement> = {};

      for (const feature of features) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = feature.url;
        await new Promise(resolve => img.onload = resolve);
        loadedImages[feature.category] = img;
      }

      setImages(loadedImages);

      // Only detect landmarks when face shape is loaded
      if (loadedImages.faceShape) {
        try {
          const detectedLandmarks = await detectFaceLandmarks(loadedImages.faceShape);
          if (detectedLandmarks) {
            const predictedPoints: LandmarkPoint[] = [];
            
            // Get predicted positions for each feature
            const featureCategories = ['eyes', 'eyebrows', 'nose', 'mouth', 'ears'];
            featureCategories.forEach(category => {
              const pos = getFeaturePosition(detectedLandmarks, category);
              if (pos) {
                if (category === 'ears') {
                  // Add both ear positions
                  predictedPoints.push({
                    x: pos.left.x * width,
                    y: pos.left.y * height,
                    category: 'leftEar'
                  });
                  predictedPoints.push({
                    x: pos.right.x * width,
                    y: pos.right.y * height,
                    category: 'rightEar'
                  });
                } else {
                  predictedPoints.push({
                    x: pos.x * width,
                    y: pos.y * height,
                    category
                  });
                }
              }
            });

            setLandmarks(predictedPoints);
          }
        } catch (error) {
          console.error('Error detecting landmarks:', error);
        }
      }
    };

    loadImages();
  }, [features, width, height]);

  useEffect(() => {
    setStageScale(zoom / 100);
  }, [zoom]);

  return (
    <Stage 
      width={width} 
      height={height}
      scaleX={stageScale}
      scaleY={stageScale}
    >
      <Layer>
        {/* Render images */}
        {Object.entries(images).map(([category, img]) => (
          <KonvaImage
            key={category}
            image={img}
            width={width}
            height={height}
          />
        ))}
        
        {/* Render landmark points */}
        {landmarks.map((point, index) => (
          <Circle
            key={`${point.category}-${index}`}
            x={point.x}
            y={point.y}
            radius={4}
            fill="red"
            opacity={0.7}
          />
        ))}
      </Layer>
    </Stage>
  );
} 