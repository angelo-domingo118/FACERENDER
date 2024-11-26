import * as tf from '@tensorflow/tfjs';

interface SkinAnalysisResult {
  dominantColor: {
    h: number;
    s: number;
    l: number;
  };
  skinMask: Uint8ClampedArray;
  skinRegions: number[][];
}

// Force CPU backend
tf.setBackend('cpu');

export async function analyzeFacialSkin(
  canvas: HTMLCanvasElement,
  layers: Layer[]
): Promise<SkinAnalysisResult> {
  console.log('analyzeFacialSkin called with layers:', layers);
  
  try {
    // Get image data directly from canvas
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    
    // Create skin mask using simple RGB rules
    const skinMask = new Uint8ClampedArray(width * height);
    const rgbValues: number[][] = [];
    
    // Process pixels
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const pixelIndex = i / 4;
      
      // Simple skin detection
      if (isSkinPixel(r, g, b)) {
        skinMask[pixelIndex] = 1;
        rgbValues.push([r, g, b]);
      }
    }
    
    // Calculate dominant color from skin pixels
    const dominantColor = calculateDominantColor(rgbValues);
    
    // Calculate skin regions for each layer
    const skinRegions = layers
      .filter(layer => layer.visible)
      .map(layer => detectSkinRegions(layer, skinMask));
    
    return {
      dominantColor,
      skinMask,
      skinRegions
    };
  } catch (error) {
    console.error('Error in analyzeFacialSkin:', error);
    throw error;
  }
}

function isSkinPixel(r: number, g: number, b: number): boolean {
  return (
    r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 15 &&
    r + g + b > 300 && r + g + b < 765 &&
    Math.abs(g - b) < 15
  );
}

function calculateDominantColor(rgbValues: number[][]): { h: number; s: number; l: number } {
  if (rgbValues.length === 0) {
    return { h: 0, s: 0, l: 0 };
  }
  
  // Average RGB values
  const avgRGB = rgbValues.reduce(
    (acc, [r, g, b]) => {
      acc[0] += r;
      acc[1] += g;
      acc[2] += b;
      return acc;
    },
    [0, 0, 0]
  ).map(sum => sum / rgbValues.length);
  
  // Convert RGB to HSL
  return rgbToHsl(avgRGB[0], avgRGB[1], avgRGB[2]);
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  
  return {
    h: h * 360,
    s: s * 100,
    l: l * 100
  };
}

function detectSkinRegions(layer: Layer, skinMask: Uint8ClampedArray): number[] {
  // Extract just the numeric ID from the layer ID (e.g. "face_type_9_cxx5nv" -> "9")
  const layerId = layer.id.split('_')[2];
  console.log('Detecting skin regions for layer:', { 
    layerId,
    category: layer.feature.category,
    hasSkin: layer.feature.category === 'faceShape' || 
             layer.feature.category === 'nose'
  });

  // For face and nose components, consider them as having skin
  if (layer.feature.category === 'faceShape' || 
      layer.feature.category === 'nose') {
    // Return indices where skin is detected
    return Array.from(skinMask.entries())
      .filter(([_, value]) => value > 0)
      .map(([index]) => parseInt(layerId));
  }

  return [];
} 