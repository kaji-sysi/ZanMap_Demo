import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  className?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  data,
  size = 256,
  errorCorrectionLevel = 'M',
  margin = 4,
  color = { dark: '#000000', light: '#FFFFFF' },
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      if (!canvasRef.current || !data) return;

      try {
        await QRCode.toCanvas(canvasRef.current, data, {
          width: size,
          margin,
          color,
          errorCorrectionLevel
        });
      } catch (error) {
        console.error('QR Code generation failed:', error);
      }
    };

    generateQRCode();
  }, [data, size, margin, color, errorCorrectionLevel]);

  if (!data) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-gray-500 text-sm text-center">
          QRコード<br />データなし
        </p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`border border-gray-300 ${className}`}
    />
  );
};

export default QRCodeGenerator; 