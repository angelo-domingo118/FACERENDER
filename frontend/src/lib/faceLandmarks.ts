import * as facemesh from '@mediapipe/face_mesh';
import * as tf from '@tensorflow/tfjs';

// Mapping of facial features to MediaPipe landmark indices
const LANDMARK_MAPPINGS = {
  eyes: {
    left: [33, 133, 157, 158, 159, 160, 161, 246],  
    right: [362, 263, 386, 387, 388, 389, 390, 466]
  },
  eyebrows: {
    left: [70, 63, 105, 66, 107],
    right: [300, 293, 334, 296, 336]
  },
  nose: [1, 2, 98, 327],
  mouth: [0, 37, 267, 269, 270, 409],
  ears: {
    left: [234, 227, 234, 93, 132],
    right: [454, 447, 454, 323, 361]
  }
};

let detector: any = null;

export async function detectFaceLandmarks(imageElement: HTMLImageElement) {
  try {
    if (!detector) {
      await tf.setBackend('webgl');
      detector = await facemesh.createDetector({
        runtime: 'tfjs',
        modelType: 'full'
      });
    }
    
    const faces = await detector.estimateFaces(imageElement);
    return faces[0]?.keypoints || null;
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
}

export function getFeaturePosition(landmarks: any[], featureType: string) {
  const indices = LANDMARK_MAPPINGS[featureType];
  if (!indices) return defaultPosition(featureType);

  if (featureType === 'ears') {
    // Position ears outside the face shape
    const leftEar = calculateCenter(landmarks, indices.left);
    const rightEar = calculateCenter(landmarks, indices.right);
    return {
      left: { x: leftEar.x - 20, y: leftEar.y },
      right: { x: rightEar.x + 20, y: rightEar.y },
      scale: 0.6
    };
  }

  // For other features, calculate center position
  const points = Array.isArray(indices) ? indices : [...indices.left, ...indices.right];
  const center = calculateCenter(landmarks, points);
  
  // Add scaling based on feature type
  return {
    x: center.x,
    y: center.y,
    scale: getFeatureScale(featureType)
  };
}

function calculateCenter(landmarks: any[], indices: number[]) {
  const points = indices.map(idx => landmarks[idx]);
  return points.reduce((acc, point) => ({
    x: acc.x + point.x / points.length,
    y: acc.y + point.y / points.length
  }), { x: 0, y: 0 });
}

function getFeatureScale(featureType: string) {
  const scales = {
    eyes: 0.5,
    eyebrows: 0.4,
    nose: 0.4,
    mouth: 0.45,
    ears: 0.6
  };
  return scales[featureType] || 1;
}

function defaultPosition(featureType: string) {
  const positions = {
    faceShape: { x: 0.5, y: 0.5, scale: 1 },
    eyes: { x: 0.5, y: 0.4, scale: 0.5 },
    eyebrows: { x: 0.5, y: 0.35, scale: 0.4 },
    nose: { x: 0.5, y: 0.55, scale: 0.4 },
    mouth: { x: 0.5, y: 0.7, scale: 0.45 },
    ears: { 
      left: { x: 0.2, y: 0.5 },
      right: { x: 0.8, y: 0.5 },
      scale: 0.6
    }
  };
  return positions[featureType];
} 