import { useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { analyzeAndBlendFeature } from '@/lib/colorBlending';

interface Feature {
  id: string;
  url: string;
  category: string;
}

export default function PreviewCanvas({ width, height, features, zoom = 100 }) {
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [stageScale, setStageScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      console.log('Loading images for features:', features);
      const loadedImages: Record<string, HTMLImageElement> = {};
      
      for (const feature of features) {
        console.log('Loading feature:', feature);
        const img = new Image();
        img.src = feature.url;
        await new Promise((resolve) => {
          img.onload = () => {
            console.log('Loaded image for:', feature.category, {
              width: img.width,
              height: img.height
            });
            resolve(null);
          };
        });
        loadedImages[feature.category] = img;
      }
      
      console.log('All images loaded:', Object.keys(loadedImages));
      setImages(loadedImages);
    };

    loadImages();
  }, [features]);

  useEffect(() => {
    setStageScale(zoom / 100);
  }, [zoom]);

  return (
    <Stage 
      width={width} 
      height={height}
      scaleX={stageScale}
      scaleY={stageScale}
      draggable
      x={position.x}
      y={position.y}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e) => {
        setIsDragging(false);
        setPosition({
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <Layer>
        {Object.entries(images).map(([category, img]) => {
          const centerX = width / (2 * stageScale);
          const centerY = height / (2 * stageScale);
          
          // Adjusted scale calculation for better initial fit
          const scaleX = (width * 0.85) / img.width;
          const scaleY = (height * 0.85) / img.height;
          const scale = Math.min(scaleX, scaleY);
          
          return (
            <KonvaImage
              key={category}
              image={img}
              x={centerX}
              y={centerY}
              offsetX={img.width / 2}
              offsetY={img.height / 2}
              width={img.width}
              height={img.height}
              scaleX={scale}
              scaleY={scale}
            />
          );
        })}
      </Layer>
    </Stage>
  );
} 