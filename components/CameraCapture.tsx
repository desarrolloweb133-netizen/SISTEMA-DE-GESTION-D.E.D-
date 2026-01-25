import React, { useRef, useEffect, useState } from 'react';
import { Button } from './Button';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
  mode?: 'register' | 'scan'; // 'register' shows preview to approve, 'scan' captures immediately or continuously
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel, mode = 'register' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (mounted) setError("No se pudo acceder a la cámara. Verifique los permisos.");
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const imageSrc = canvasRef.current.toDataURL('image/jpeg', 0.8);
      onCapture(imageSrc);
    }
  };

  // Auto-scan simulation for attendance mode
  useEffect(() => {
    if (mode === 'scan' && stream) {
      const timer = setTimeout(() => {
        handleCapture();
      }, 2000); // Wait 2 seconds then auto capture
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, stream]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full relative">
        <div className="relative aspect-video bg-slate-900">
          {error ? (
            <div className="flex items-center justify-center h-full text-white p-6 text-center">
              {error}
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform -scale-x-100" 
              />
              {mode === 'scan' && (
                <>
                  <div className="scan-line z-10"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-lg pointer-events-none"></div>
                  <div className="absolute bottom-4 left-0 right-0 text-center text-white font-medium text-lg drop-shadow-md">
                    Escaneando rostro...
                  </div>
                </>
              )}
            </>
          )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />

        <div className="p-6 flex justify-between items-center bg-white">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          
          {mode === 'register' && !error && (
            <Button onClick={handleCapture} className="min-w-[120px]">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Capturar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};