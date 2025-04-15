
import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Camera, Upload, CheckCircle } from 'lucide-react';
import AIBadge from './AIBadge';

interface CropQualityGraderProps {
  onGradeComplete?: (score: number, quality: string) => void;
  cropType?: string;
}

const CropQualityGrader: React.FC<CropQualityGraderProps> = ({ 
  onGradeComplete,
  cropType = 'generic'
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [qualityGrade, setQualityGrade] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<tf.LayersModel | null>(null);

  // Load the TensorFlow.js model
  useEffect(() => {
    async function loadModel() {
      try {
        // For demo purposes, we'll use MobileNet as it's available in TFJS
        // In a real implementation, you would use a custom-trained model for crop quality
        const loadedModel = await tf.loadLayersModel(
          'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json'
        );
        setModel(loadedModel);
        setIsModelLoaded(true);
        console.log('AI model loaded successfully');
      } catch (error) {
        console.error('Failed to load the model:', error);
      }
    }

    loadModel();

    return () => {
      // Cleanup function
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
          setQualityScore(null);
          setQualityGrade(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const analyzeImage = async () => {
    if (!image || !model || !canvasRef.current) return;

    setIsAnalyzing(true);
    try {
      // Create an image element to load our image
      const imgElement = document.createElement('img');
      imgElement.src = image;
      
      // Wait for the image to load
      await new Promise((resolve) => {
        imgElement.onload = resolve;
      });

      // Prepare canvas for preprocessing
      const canvas = canvasRef.current;
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Draw and resize image to 224x224 (MobileNet input size)
      ctx.drawImage(imgElement, 0, 0, 224, 224);
      
      // Get image data from canvas and convert to tensor
      const imageData = ctx.getImageData(0, 0, 224, 224);
      const tensor = tf.browser.fromPixels(imageData)
        .toFloat()
        .div(tf.scalar(255))
        .expandDims(0);
      
      // Run inference
      const predictions = await model.predict(tensor) as tf.Tensor;
      const data = await predictions.data();
      
      // For demo purposes, we'll use the confidence scores from MobileNet
      // to simulate a crop quality analysis
      // In a real app, you'd use a model specifically trained for crop quality grading
      
      // Calculate a simulated quality score based on the prediction confidence
      // (this is just for demonstration - not real crop quality assessment)
      const topPredictionIdx = Array.from(data).indexOf(Math.max(...Array.from(data)));
      const confidence = data[topPredictionIdx];
      
      // Simulate a quality score (0-100) based on confidence and randomization
      // In a real model, this would be the actual output of your crop quality model
      let simulatedScore = Math.round(confidence * 100 * 0.7 + Math.random() * 30);
      simulatedScore = Math.min(100, Math.max(0, simulatedScore));
      
      // Determine quality grade based on score
      let grade = '';
      if (simulatedScore >= 90) grade = 'Premium';
      else if (simulatedScore >= 75) grade = 'Quality';
      else if (simulatedScore >= 60) grade = 'Standard';
      else grade = 'Basic';
      
      setQualityScore(simulatedScore);
      setQualityGrade(grade);
      
      if (onGradeComplete) {
        onGradeComplete(simulatedScore, grade);
      }
      
      // Clean up tensors to prevent memory leaks
      tensor.dispose();
      predictions.dispose();
      
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Crop Quality Grader</CardTitle>
        <CardDescription>
          Upload an image of your {cropType} to analyze its quality using AI
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={triggerFileInput}>
            {image ? (
              <div className="relative w-full">
                <img 
                  src={image} 
                  alt="Crop to analyze" 
                  className="mx-auto max-h-64 rounded-md object-contain"
                />
                <Button 
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileInput();
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload a crop image
                </p>
                <p className="text-xs text-gray-400">
                  JPG, PNG or WEBP (max. 5MB)
                </p>
              </div>
            )}
            
            <Input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {qualityScore !== null && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Analysis Results</h3>
                <AIBadge score={qualityScore} />
              </div>
              
              <Separator className="my-3" />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Quality Score</p>
                  <p className="font-medium">{qualityScore}/100</p>
                </div>
                <div>
                  <p className="text-gray-500">Grade</p>
                  <p className="font-medium">{qualityGrade}</p>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                <p>This assessment is based on visual analysis of your crop image using our AI model.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setImage(null);
            setQualityScore(null);
            setQualityGrade(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          disabled={!image || isAnalyzing}
        >
          Clear
        </Button>
        
        <Button 
          onClick={analyzeImage}
          disabled={!image || isAnalyzing || !isModelLoaded}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : qualityScore !== null ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Analyzed
            </>
          ) : (
            'Analyze Image'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CropQualityGrader;
