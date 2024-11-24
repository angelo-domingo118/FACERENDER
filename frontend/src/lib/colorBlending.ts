import * as tf from '@tensorflow/tfjs';
import Konva from 'konva';

interface BlendSettings {
  hue: number;
  saturation: number;
  lightness: number;
  featherRadius: number;
  opacity: number;
  blendMode: string;
}

export function createFeatherMask(width: number, height: number, radius: number): ImageData {
  console.log('Creating feather mask with width:', width, 'height:', height, 'radius:', radius);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width / 2
  );
  
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.8, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  console.log('Feather mask created');
  return ctx.getImageData(0, 0, width, height);
}

export async function analyzeAndBlendFeature(
  baseImage: HTMLImageElement,
  featureImage: HTMLImageElement,
  category: string
): Promise<Konva.Node> {
  console.log('Starting blend process for:', category);

  // Create temporary canvas for analysis
  const tempCanvas = document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d')!;
  tempCanvas.width = featureImage.width;
  tempCanvas.height = featureImage.height;
  
  // Draw and analyze the feature
  ctx.drawImage(featureImage, 0, 0);
  const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const { data } = imageData;
  
  // Detect skin areas vs feature areas
  const skinMask = new Uint8ClampedArray(data.length / 4);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    // Simple skin detection (can be enhanced with ML)
    const isSkin = isPixelSkin(r, g, b);
    skinMask[i/4] = isSkin ? 255 : 0;
  }

  // Create blended image with Konva
  const blendedImage = new Konva.Image({
    image: featureImage,
    filters: [
      Konva.Filters.RGBA,
      Konva.Filters.HSL,
      Konva.Filters.Blur,
      Konva.Filters.Mask,
    ],
  });

  // Apply category-specific settings
  const settings = calculateBlendSettings(baseImage, featureImage, category);
  console.log('Blend settings:', settings);

  blendedImage.cache();
  blendedImage.filters([
    Konva.Filters.RGBA,
    Konva.Filters.HSL,
    Konva.Filters.Blur,
    Konva.Filters.Mask,
  ]);

  // Apply color adjustments
  const { colorAdjustment, textureBlend } = await analyzeColors(baseImage, featureImage, category);
  console.log('Color adjustments:', colorAdjustment);

  blendedImage.rgba(colorAdjustment);
  blendedImage.hue(settings.hue);
  blendedImage.saturation(settings.saturation);
  blendedImage.brightness(settings.lightness);
  
  // Enhanced blending based on category
  if (category !== 'nose') {
    const mask = await createEnhancedMask(featureImage, skinMask, settings);
    blendedImage.mask(mask);
    console.log('Enhanced mask applied for:', category);
  }

  // Apply final composite operation
  blendedImage.globalCompositeOperation(settings.blendMode);
  blendedImage.opacity(settings.opacity);

  console.log('Blend process completed for:', category);
  return blendedImage;
}

function calculateBlendSettings(
  baseStats: any, 
  featureStats: any, 
  category: string
): BlendSettings {
  console.log('Calculating blend settings for category:', category);
  // Default settings
  const settings: BlendSettings = {
    hue: 0,
    saturation: 0,
    lightness: 0,
    featherRadius: 10,
    opacity: 1,
    blendMode: 'source-over'
  };

  // Category-specific adjustments
  switch(category) {
    case 'eyes':
      settings.featherRadius = 15;
      settings.blendMode = 'multiply';
      settings.opacity = 0.95;
      break;
    case 'eyebrows':
      settings.featherRadius = 8;
      settings.blendMode = 'multiply';
      settings.opacity = 0.9;
      break;
    case 'nose':
    case 'mouth':
      settings.featherRadius = 12;
      settings.blendMode = 'overlay';
      settings.opacity = 0.95;
      break;
    default:
      console.warn('Unknown category:', category);
  }

  console.log('Calculated blend settings:', settings);
  return settings;
}

async function getAverageColor(image: HTMLImageElement): Promise<{ r: number, g: number, b: number }> {
  console.log('Calculating average color for image:', image.src);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0, image.width, image.height);
  const { data } = ctx.getImageData(0, 0, image.width, image.height);
  
  let r = 0, g = 0, b = 0, count = 0;
  for(let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  const avgColor = {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count)
  };

  console.log('Average color:', avgColor);
  return avgColor;
} 

// New helper functions
function isPixelSkin(r: number, g: number, b: number): boolean {
  // Enhanced skin detection logic
  const sum = r + g + b;
  const rg = Math.abs(r - g);
  const rb = Math.abs(r - b);
  const gb = Math.abs(g - b);

  return (
    r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    rg > 15 && rb > 15 &&
    sum > 300 && sum < 765 &&
    gb < 15
  );
}

async function analyzeColors(baseImage: HTMLImageElement, featureImage: HTMLImageElement, category: string) {
  console.log('Analyzing colors for:', category);
  
  // Get dominant colors using k-means clustering
  const baseColors = await getDominantColors(baseImage);
  const featureColors = await getDominantColors(featureImage);
  
  const colorAdjustment = {
    red: Math.round(baseColors[0].r - featureColors[0].r),
    green: Math.round(baseColors[0].g - featureColors[0].g),
    blue: Math.round(baseColors[0].b - featureColors[0].b),
    alpha: 1
  };

  const textureBlend = {
    contrast: category === 'eyes' ? 1.2 : 1.0,
    brightness: category === 'mouth' ? 1.1 : 1.0
  };

  return { colorAdjustment, textureBlend };
}

async function createEnhancedMask(
  featureImage: HTMLImageElement, 
  skinMask: Uint8ClampedArray, 
  settings: BlendSettings
): Promise<ImageData> {
  const canvas = document.createElement('canvas');
  canvas.width = featureImage.width;
  canvas.height = featureImage.height;
  const ctx = canvas.getContext('2d')!;

  // Create gradient mask
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
  );

  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply skin mask
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < skinMask.length; i++) {
    const idx = i * 4;
    if (skinMask[i] > 0) {
      imageData.data[idx + 3] = Math.round(imageData.data[idx + 3] * settings.opacity);
    }
  }

  return imageData;
}

async function getDominantColors(image: HTMLImageElement, numColors: number = 3) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = [];
  
  for (let i = 0; i < imageData.data.length; i += 4) {
    if (imageData.data[i + 3] > 128) { // Skip transparent pixels
      pixels.push({
        r: imageData.data[i],
        g: imageData.data[i + 1],
        b: imageData.data[i + 2]
      });
    }
  }
  
  // Simple averaging for now - can be replaced with k-means
  const avgColor = pixels.reduce((acc, pixel) => ({
    r: acc.r + pixel.r / pixels.length,
    g: acc.g + pixel.g / pixels.length,
    b: acc.b + pixel.b / pixels.length
  }), { r: 0, g: 0, b: 0 });
  
  return [avgColor];
} 