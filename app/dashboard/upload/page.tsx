'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileAudio, FileVideo, X, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { GlassCard } from '@/components/common/GlassCard';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { voiceService } from '@/services/voice';
import { videoService } from '@/services/video';

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        setUploadedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('audio/') || file.type.startsWith('video/'))) {
      setUploadedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate upload completion
    setTimeout(() => {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(100);
    }, 2000);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);

    // Simulate analysis based on file type
    if (uploadedFile.type.startsWith('audio/')) {
      await voiceService.analyzeVoice({
        audioFile: uploadedFile,
        duration: 0,
      });
    } else if (uploadedFile.type.startsWith('video/')) {
      await videoService.analyzeVideo({
        videoFile: uploadedFile,
        duration: 0,
      });
    }

    setIsAnalyzing(false);
    setAnalysisComplete(true);
  };

  const reset = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
  };

  const isAudio = uploadedFile?.type.startsWith('audio/');
  const isVideo = uploadedFile?.type.startsWith('video/');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Upload Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Upload audio or video for emotion analysis
            </p>
          </div>
          {uploadedFile && (
            <Button onClick={reset} variant="ghost" className="glass">
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload File</h2>
            
            {/* Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-white/20 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading || isAnalyzing}
              />
              
              {!uploadedFile ? (
                <div className="space-y-4">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Upload className="w-16 h-16 mx-auto text-primary/50" />
                  </motion.div>
                  <div>
                    <p className="text-lg font-medium">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileAudio className="w-4 h-4" />
                      Audio files
                    </div>
                    <div className="flex items-center gap-1">
                      <FileVideo className="w-4 h-4" />
                      Video files
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    {isAudio ? (
                      <FileAudio className="w-12 h-12 text-primary" />
                    ) : (
                      <FileVideo className="w-12 h-12 text-primary" />
                    )}
                    <div className="text-left">
                      <p className="font-medium truncate max-w-xs">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-muted-foreground">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {!isUploading && uploadProgress === 100 && !analysisComplete && (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm">Upload complete</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {uploadedFile && !isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-3"
              >
                {uploadProgress === 0 && (
                  <Button
                    onClick={handleUpload}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    size="lg"
                  >
                    Upload File
                  </Button>
                )}
                {uploadProgress === 100 && !analysisComplete && (
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    size="lg"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze File'}
                  </Button>
                )}
              </motion.div>
            )}
          </GlassCard>

          {/* Status Section */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Analysis Status</h2>
            
            {!uploadedFile ? (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <LunaAvatar state="thinking" size="xl" />
                <p className="text-muted-foreground mt-4">
                  Upload a file to begin analysis
                </p>
              </div>
            ) : isUploading ? (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                >
                  <Upload className="w-16 h-16 text-primary" />
                </motion.div>
                <p className="text-muted-foreground mt-4">
                  Uploading your file...
                </p>
                <Progress value={uploadProgress} className="w-48 mt-4" />
              </div>
            ) : isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <LunaAvatar state="thinking" size="xl" />
                <p className="text-muted-foreground mt-4">
                  Analyzing your {isAudio ? 'audio' : 'video'}...
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This may take a moment
                </p>
              </div>
            ) : analysisComplete ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-80 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <CheckCircle2 className="w-20 h-20 text-green-400" />
                </motion.div>
                <h3 className="text-2xl font-bold mt-4">Analysis Complete!</h3>
                <p className="text-muted-foreground mt-2">
                  Your {isAudio ? 'audio' : 'video'} has been analyzed
                </p>
                <div className="mt-6 space-y-2">
                  <Button
                    onClick={() => {
                      if (isAudio) {
                        window.location.href = '/dashboard/voice';
                      } else {
                        window.location.href = '/dashboard/video';
                      }
                    }}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    View Results
                  </Button>
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="glass"
                  >
                    Upload Another
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <LunaAvatar state="listening" size="xl" />
                <p className="text-muted-foreground mt-4">
                  File ready for analysis
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click "Analyze File" to begin
                </p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Info Section */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-3">Supported Formats</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-primary mb-2">Audio Files</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• MP3, WAV, M4A, AAC</li>
                <li>• Maximum size: 50MB</li>
                <li>• Duration: up to 10 minutes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-2">Video Files</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• MP4, MOV, AVI, WebM</li>
                <li>• Maximum size: 100MB</li>
                <li>• Duration: up to 5 minutes</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}