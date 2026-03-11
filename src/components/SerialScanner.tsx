import { useState, useEffect, useRef } from 'react';
import { X, Camera, Loader, AlertCircle } from 'lucide-react';

interface SerialScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onSerialFound: (serialNumber: string) => void;
}

export default function SerialScanner({ isOpen, onClose, onSerialFound }: SerialScannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [manualInput, setManualInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

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
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } else {
        throw new Error('Camera não suportada neste navegador');
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Acesso à câmera negado. Permita o uso da câmera para escanear códigos.');
      } else if (err.name === 'NotFoundError') {
        setError('Nenhuma câmera encontrada. Use a entrada manual abaixo.');
      } else {
        setError('Erro ao acessar a câmera. Use a entrada manual abaixo.');
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
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onSerialFound(manualInput.trim());
      setManualInput('');
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        // For demo purposes, simulate OCR result
        // In a real application, you would integrate with an OCR service
        // like Tesseract.js or Google Vision API
        setTimeout(() => {
          const mockSerial = `SN${Date.now().toString().slice(-8)}`;
          onSerialFound(mockSerial);
        }, 1000);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Escanear Número de Série</h2>
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
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <div className="flex flex-col items-center gap-2">
                    <Loader className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Iniciando câmera...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-orange-500" />
                    <p className="text-sm text-gray-600">{error}</p>
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

              {/* Scanning overlay */}
              {stream && !error && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg"></div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                    Posicione o número de série dentro da moldura
                  </div>
                </div>
              )}
            </div>

            {/* Capture button */}
            {stream && !error && !isLoading && (
              <button
                onClick={captureImage}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Capturar e Analisar
              </button>
            )}
          </div>

          {/* Manual input fallback */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Ou digite manualmente:
            </h3>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Digite o número de série..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Instructions */}
          <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded p-2">
            <p className="font-medium mb-1">📱 Dicas para escanear:</p>
            <ul className="space-y-1">
              <li>• Mantenha boa iluminação</li>
              <li>• Posicione o número de série centralmente</li>
              <li>• Certifique-se que o texto está nítido</li>
              <li>• Use entrada manual se a câmera não funcionar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}