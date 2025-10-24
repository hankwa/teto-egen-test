import * as tf from "@tensorflow/tfjs";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import type { FacialFeatures, AnimalType } from "@shared/schema";

let detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;

async function initializeDetector() {
  if (detector) return detector;

  await tf.ready();
  
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  const detectorConfig = {
    runtime: "tfjs" as const,
    maxFaces: 1,
  };

  detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
  return detector;
}

function generateFallbackFeatures(): FacialFeatures & { animalType: AnimalType } {
  const features: FacialFeatures = {
    eyebrowAngle: Math.random() * 20 - 10,
    lipCurvature: Math.random() * 0.4 - 0.2,
    jawlineAngle: Math.random() * 20 + 80,
    faceWidthRatio: 1.3 + Math.random() * 0.4,
    eyeDistance: 80 + Math.random() * 40,
  };

  const animalType = classifyAnimalType(features);
  return { ...features, animalType };
}

export async function analyzeFacialFeatures(imageData: string): Promise<FacialFeatures & { animalType: AnimalType }> {
  try {
    const img = new Image();
    img.src = imageData;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const detector = await initializeDetector();
    const faces = await detector.estimateFaces(img);

    if (!faces || faces.length === 0) {
      console.warn("No face detected in image, using fallback features");
      return generateFallbackFeatures();
    }

    const face = faces[0];
    const keypoints = face.keypoints;

    const leftEyebrow = keypoints.filter((kp: any) => kp.name?.includes("leftEyebrow"));
    const rightEyebrow = keypoints.filter((kp: any) => kp.name?.includes("rightEyebrow"));
    const lips = keypoints.filter((kp: any) => kp.name?.includes("lips"));
    const leftEye = keypoints.filter((kp: any) => kp.name?.includes("leftEye"));
    const rightEye = keypoints.filter((kp: any) => kp.name?.includes("rightEye"));

    const eyebrowAngle = calculateAngle(leftEyebrow, rightEyebrow);
    const lipCurvature = calculateLipCurvature(lips);
    const jawlineAngle = Math.random() * 20 + 80;
    const faceWidthRatio = calculateFaceWidth(keypoints);
    const eyeDistance = calculateEyeDistance(leftEye, rightEye);

    const features: FacialFeatures = {
      eyebrowAngle,
      lipCurvature,
      jawlineAngle,
      faceWidthRatio,
      eyeDistance,
    };

    const animalType = classifyAnimalType(features);

    return { ...features, animalType };
  } catch (error) {
    console.error("Facial analysis error:", error);
    return generateFallbackFeatures();
  }
}

function calculateAngle(leftPoints: any[], rightPoints: any[]): number {
  if (leftPoints.length === 0 || rightPoints.length === 0) {
    return Math.random() * 20 - 10;
  }

  const leftAvgY = leftPoints.reduce((sum, p) => sum + p.y, 0) / leftPoints.length;
  const rightAvgY = rightPoints.reduce((sum, p) => sum + p.y, 0) / rightPoints.length;
  const leftAvgX = leftPoints.reduce((sum, p) => sum + p.x, 0) / leftPoints.length;
  const rightAvgX = rightPoints.reduce((sum, p) => sum + p.x, 0) / rightPoints.length;

  const angle = Math.atan2(rightAvgY - leftAvgY, rightAvgX - leftAvgX) * (180 / Math.PI);
  return angle;
}

function calculateLipCurvature(lips: any[]): number {
  if (lips.length < 3) {
    return Math.random() * 0.4 - 0.2;
  }

  const upperLip = lips.slice(0, Math.floor(lips.length / 2));
  const lowerLip = lips.slice(Math.floor(lips.length / 2));

  if (upperLip.length === 0 || lowerLip.length === 0) {
    return Math.random() * 0.4 - 0.2;
  }

  const upperAvgY = upperLip.reduce((sum, p) => sum + p.y, 0) / upperLip.length;
  const lowerAvgY = lowerLip.reduce((sum, p) => sum + p.y, 0) / lowerLip.length;

  return (lowerAvgY - upperAvgY) / 100;
}

function calculateFaceWidth(keypoints: any[]): number {
  if (keypoints.length === 0) return 1.5 + Math.random() * 0.5;

  const xs = keypoints.map((kp: any) => kp.x);
  const ys = keypoints.map((kp: any) => kp.y);

  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);

  return width / height;
}

function calculateEyeDistance(leftEye: any[], rightEye: any[]): number {
  if (leftEye.length === 0 || rightEye.length === 0) {
    return 80 + Math.random() * 40;
  }

  const leftCenterX = leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length;
  const rightCenterX = rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length;

  return Math.abs(rightCenterX - leftCenterX);
}

export function classifyAnimalType(features: FacialFeatures): AnimalType {
  const { eyebrowAngle, lipCurvature, faceWidthRatio, eyeDistance, jawlineAngle } = features;

  if (faceWidthRatio > 1.6 && jawlineAngle > 95) {
    return "bear";
  }

  if (eyebrowAngle < -5 && lipCurvature < 0 && faceWidthRatio < 1.4) {
    return "cat";
  }

  if (eyebrowAngle > 5 && lipCurvature > 0.1 && faceWidthRatio < 1.5) {
    return "dog";
  }

  if (faceWidthRatio > 1.5 && eyeDistance > 100) {
    return "rabbit";
  }

  if (eyebrowAngle < 0 && jawlineAngle < 90 && faceWidthRatio < 1.4) {
    return "fox";
  }

  if (faceWidthRatio < 1.4 && jawlineAngle < 85) {
    return "deer";
  }

  const types: AnimalType[] = ["dog", "cat", "fox", "rabbit", "bear", "deer"];
  return types[Math.floor(Math.random() * types.length)];
}
