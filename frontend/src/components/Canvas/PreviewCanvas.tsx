import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { detectFaceLandmarks, getFeaturePosition } from '@/lib/faceLandmarks';

// Relative positioning for facial features
const defaultPosition = {
  faceShape: { x: 0.5, y: 0.5, scale: 1 },
  eyes: { x: 0.5, y: 0.4, scale: 0.5 },
  eyebrows: { x: 0.5, y: 0.35, scale: 0.5 },
  nose: { x: 0.5, y: 0.55, scale: 0.4 },
  mouth: { x: 0.5, y: 0.7, scale: 0.4 },
  ears: { x: 0.5, y: 0.5, scale: 0.6 }
}

export default function PreviewCanvas({ width, height, features, zoom = 100 }) {
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [positions, setPositions] = useState(defaultPosition);
  
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

      // Calculate positions based on face shape
      if (loadedImages.faceShape) {
        try {
          const landmarks = await detectFaceLandmarks(loadedImages.faceShape);
          if (landmarks) {
            const newPositions = {};
            for (const feature of features) {
              if (feature.category === 'faceShape') {
                newPositions[feature.category] = {
                  x: width / 2,
                  y: height / 2,
                  scale: 1
                };
              } else {
                const pos = getFeaturePosition(landmarks, feature.category);
                if (pos) {
                  newPositions[feature.category] = pos;
                }
              }
            }
            setPositions(newPositions);
          }
        } catch (error) {
          console.error('Error detecting landmarks:', error);
        }
      }
    };

    loadImages();
  }, [features, width, height]);

  const renderFeature = (feature: any) => {
    const image = images[feature.category];
    const position = positions[feature.category];
    
    if (!image || !position) return null;

    // Special handling for ears
    if (feature.category === 'ears' && position.left && position.right) {
      return (
        <>
          <KonvaImage
            key={`${feature.id}-left`}
            image={image}
            x={position.left.x * width}
            y={position.left.y * height}
            offsetX={image.width / 2}
            offsetY={image.height / 2}
            scaleX={(position.scale * zoom) / 100}
            scaleY={(position.scale * zoom) / 100}
          />
          <KonvaImage
            key={`${feature.id}-right`}
            image={image}
            x={position.right.x * width}
            y={position.right.y * height}
            offsetX={image.width / 2}
            offsetY={image.height / 2}
            scaleX={-(position.scale * zoom) / 100} // Flip for right ear
            scaleY={(position.scale * zoom) / 100}
          />
        </>
      );
    }

    return (
      <KonvaImage
        key={feature.id}
        image={image}
        x={position.x * width}
        y={position.y * height}
        offsetX={image.width / 2}
        offsetY={image.height / 2}
        scaleX={(position.scale * zoom) / 100}
        scaleY={(position.scale * zoom) / 100}
      />
    );
  };

  return (
    <Stage width={width} height={height}>
      <Layer>
        {features.map(renderFeature)}
      </Layer>
    </Stage>
  );
} 