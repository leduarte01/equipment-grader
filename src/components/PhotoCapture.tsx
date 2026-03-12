import { useState, useEffect, useRef } from 'react';
import { X, Camera, Loader, AlertCircle, RotateCcw } from 'lucide-react';

interface PhotoCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCapture: (photoUrl: string) => void;
}

export default function PhotoCapture({ isOpen, onClose, onPhotoCapture }: PhotoCaptureProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setIsLoading(true);
    setError('');

    try {
      if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } else {
        throw new Error('Câmera não suportada neste navegador');
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Acesso à câmera negado. Permita o uso da câmera para capturar fotos.');
      } else if (err.name === 'NotFoundError') {
        setError('Nenhuma câmera encontrada.');
      } else {
        setError('Erro ao acessar a câmera. Verifique as permissões.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setError('');
  };

  const retryCamera = () => {
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Elementos de captura não estão prontos');
      return;
    }

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Não foi possível obter contexto do canvas');
      }

      // Wait a bit to ensure video is stable
      await new Promise(resolve => setTimeout(resolve, 200));

      // Set canvas size to video dimensions
      const width = video.videoWidth || video.clientWidth || 640;
      const height = video.videoHeight || video.clientHeight || 480;
      
      canvas.width = width;
      canvas.height = height;

      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0, width, height);

      // Convert to blob for better quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const photoUrl = reader.result as string;
              onPhotoCapture(photoUrl);
              onClose();
            };
            reader.readAsDataURL(blob);
          } else {
            throw new Error('Falha ao converter imagem');
          }
        },
        'image/jpeg',
        0.9 // High quality
      );
    } catch (error) {
      console.error('Capture error:', error);
      setError(`Erro na captura: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Capturar Foto</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Camera view */}
          <div className="mb-4">
            <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
                  <div className="flex flex-col items-center gap-2">
                    <Loader className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Iniciando câmera...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="flex flex-col items-center gap-3 p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-orange-500" />
                    <p className="text-sm text-gray-600">{error}</p>
                    <button
                      onClick={retryCamera}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ display: error ? 'none' : 'block' }}
              />

              {/* Capture overlay */}
              {stream && !error && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg"></div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                    Posicione o equipamento na moldura
                  </div>
                </div>
              )}

              {/* Capturing overlay */}
              {isCapturing && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-700 font-medium">Processando foto...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Capture button */}
            {stream && !error && !isLoading && (
              <button
                onClick={capturePhoto}
                disabled={isCapturing}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5" />
                {isCapturing ? 'Capturando...' : 'Capturar Foto'}
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
            <p className="font-medium mb-2">📸 Dicas para melhor foto:</p>
            <ul className="space-y-1">
              <li>• Certifique-se que há boa iluminação</li>
              <li>• Posicione o equipamento centralmente</li>
              <li>• Mantenha a câmera estável</li>
              <li>• Aguarde a imagem ficar nítida</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}