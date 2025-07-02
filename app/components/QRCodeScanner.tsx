import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCw, Flashlight } from 'lucide-react';

declare global {
  interface Window {
    jsQR?: any;
  }
}

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  title?: string;
  placeholder?: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'QRコードスキャン',
  placeholder = 'QRコードをカメラに向けてください'
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // QRコード読み取り用のライブラリ（jsQR）
  useEffect(() => {
    // jsQRライブラリを動的にインポート
    const loadJsQR = async () => {
      try {
        // 既に読み込まれているかチェック
        // @ts-ignore
        if (window.jsQR) {
          console.log('jsQR already loaded');
          return;
        }

        // CDNからjsQRを読み込み
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
        script.onload = () => {
          console.log('jsQR loaded successfully');
          // @ts-ignore
          console.log('jsQR version:', window.jsQR ? 'Available' : 'Not available');
        };
        script.onerror = (error) => {
          console.error('Failed to load jsQR:', error);
          setError('QRコードライブラリの読み込みに失敗しました。');
        };
        
        // 既存のスクリプトタグがないかチェック
        const existingScript = document.querySelector('script[src*="jsqr"]');
        if (!existingScript) {
          document.head.appendChild(script);
        }
      } catch (err) {
        console.error('Failed to load jsQR:', err);
        setError('QRコードライブラリの読み込みに失敗しました。');
      }
    };

    if (isOpen) {
      loadJsQR();
    }
  }, [isOpen]);

  // 利用可能なカメラデバイスを取得
  const getAvailableDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('Available video devices:', videoDevices);
      setAvailableDevices(videoDevices);
      
      // 外付けカメラを優先的に選択（通常、内蔵カメラではない最初のデバイス）
      if (videoDevices.length > 1 && !selectedDeviceId) {
        // 内蔵カメラは通常 "integrated" や "built-in" という文字が含まれる
        const externalCamera = videoDevices.find(device => 
          !device.label.toLowerCase().includes('integrated') &&
          !device.label.toLowerCase().includes('built-in') &&
          !device.label.toLowerCase().includes('facetime')
        ) || videoDevices[1]; // フォールバック：2番目のデバイス
        
        console.log('Selected external camera:', externalCamera);
        setSelectedDeviceId(externalCamera.deviceId);
      }
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  };

  // カメラストリームの開始
  const startCamera = async () => {
    try {
      // 既にリクエスト中またはストリームがある場合はスキップ
      if (isRequestingCamera || streamRef.current) {
        console.log('Camera already requesting or stream exists, skipping...');
        return;
      }

      console.log('Starting camera...');
      setIsRequestingCamera(true);
      setError('');
      setHasPermission(null); // 初期化中に設定
      
      // ビデオ要素が利用可能になるまで待機
      const waitForVideoElement = () => {
        return new Promise<HTMLVideoElement>((resolve, reject) => {
          const maxAttempts = 50; // 最大5秒待機
          let attempts = 0;
          
          const checkElement = () => {
            if (videoRef.current) {
              console.log('Video element found after', attempts * 100, 'ms');
              resolve(videoRef.current);
              return;
            }
            
            attempts++;
            if (attempts >= maxAttempts) {
              reject(new Error('Video element not available after timeout'));
              return;
            }
            
            setTimeout(checkElement, 100);
          };
          
          checkElement();
        });
      };
      
      const video = await waitForVideoElement();
      
      // ブラウザがgetUserMediaをサポートしているかチェック
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('お使いのブラウザはカメラアクセスをサポートしていません。');
      }

      const constraints = {
        video: selectedDeviceId ? {
          deviceId: selectedDeviceId,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      console.log('Requesting camera access with constraints:', constraints);
      
      // タイムアウト付きでカメラアクセスを試行
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia(constraints),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('カメラアクセスがタイムアウトしました（10秒）')), 10000)
        )
      ]) as MediaStream;
      
      console.log('Camera stream obtained:', stream);
      streamRef.current = stream;
      console.log('Video element ready:', video);
        
        // ビデオのイベントリスナーを設定
        video.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
          setHasPermission(true);
          // 少し遅延させてからスキャン開始
          setTimeout(() => {
            console.log('Starting scan from onloadedmetadata');
            startScanning();
          }, 500);
        };

        video.onerror = (e) => {
          console.error('Video error:', e);
          setError('ビデオの再生に失敗しました。');
          setHasPermission(false);
        };

        video.oncanplay = () => {
          console.log('Video can play');
          // canplayイベントでもスキャン開始を試行（フォールバック）
          if (hasPermission === true && !isScanning) {
            setTimeout(() => {
              console.log('Starting scan from oncanplay');
              startScanning();
            }, 300);
          }
        };

        video.onplaying = () => {
          console.log('Video is playing');
          // playingイベントでもスキャン開始を試行（フォールバック）
          if (hasPermission === true && !isScanning) {
            setTimeout(() => {
              console.log('Starting scan from onplaying');
              startScanning();
            }, 200);
          }
        };

        // ストリームを設定
        video.srcObject = stream;
        console.log('Video srcObject set');

        try {
          // 再生を試行
          const playPromise = video.play();
          if (playPromise !== undefined) {
            await playPromise;
            console.log('Video play started successfully');
          }
          
          // メタデータの読み込みを待機（タイムアウト付き）
          const waitForMetadata = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Video metadata loading timeout'));
            }, 5000);
            
            if (video.readyState >= 1) {
              // すでにメタデータが読み込まれている場合
              clearTimeout(timeout);
              console.log('Video metadata already loaded');
              resolve();
            } else {
              video.addEventListener('loadedmetadata', () => {
                clearTimeout(timeout);
                resolve();
              }, { once: true });
            }
          });
          
          await waitForMetadata;
          
        } catch (playError) {
          console.error('Video play/metadata error:', playError);
          // 自動再生が失敗した場合は手動再生を促す
          setError('ビデオの初期化に失敗しました。手動で開始してください。');
          setHasPermission(false);
        }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      let errorMessage = 'カメラへのアクセスに失敗しました。';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'カメラへのアクセスが拒否されました。ブラウザの設定でカメラの権限を許可してください。';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'カメラが見つかりません。カメラが接続されているか確認してください。';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'カメラが他のアプリケーションで使用中です。';
        } else if (err.message) {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setHasPermission(false);
    } finally {
      setIsRequestingCamera(false);
    }
  };

  // QRコードスキャンの実行
  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.log('Video or canvas not ready for scanning');
      return;
    }

    if (isScanning) {
      console.log('Scanning already in progress, skipping...');
      return;
    }

    console.log('Starting QR code scanning...');
    setIsScanning(true);
    
    let frameCount = 0;
    let isActive = true; // ローカルフラグでスキャン状態を管理
    
    const scanFrame = () => {
      if (!isActive) return; // スキャンが停止されている場合は終了
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas) {
        console.warn('Video or canvas element missing');
        return;
      }
      
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        // ビデオの準備ができていない場合は少し待ってから再試行
        setTimeout(() => {
          if (isActive) {
            requestAnimationFrame(scanFrame);
          }
        }, 100);
        return;
      }

      const context = canvas.getContext('2d');
      if (!context) return;

      // ビデオサイズをcanvasに設定
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // ビデオフレームをcanvasに描画
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // 全体の画像データを取得（より確実な検出のため）
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // デバッグ情報
      frameCount++;
      if (frameCount === 1) {
        console.log('First scan frame processed successfully');
        console.log('Canvas size:', canvas.width, 'x', canvas.height);
        console.log('jsQR available:', !!window.jsQR);
        console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
      }
      
      if (frameCount % 60 === 0) {
        console.log(`Scanning frame ${frameCount}, canvas size: ${canvas.width}x${canvas.height}, data length: ${imageData.data.length}`);
        
        // 画像データの一部をサンプリングして内容を確認
        const samplePixels = [];
        for (let i = 0; i < Math.min(20, imageData.data.length); i += 4) {
          samplePixels.push(imageData.data[i]); // R値のみ
        }
        console.log('Sample pixel values:', samplePixels);
        
        // 画像の明度を確認
        let totalBrightness = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
          totalBrightness += (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
        }
        const avgBrightness = totalBrightness / (imageData.data.length / 4);
        console.log(`Average brightness: ${avgBrightness.toFixed(1)}`);
      }
      
      // jsQRでQRコードを検出
      // @ts-ignore - jsQRはCDNから読み込まれるため型定義がない
      if (window.jsQR && imageData.data.length > 0) {
        try {
          // データを安全な配列に変換
          const imageDataArray = new Uint8ClampedArray(imageData.data);
          
          // 複数のオプションで検出を試行
          let code = null;
          const options = [
            undefined,
            { inversionAttempts: "dontInvert" },
            { inversionAttempts: "onlyInvert" },
            { inversionAttempts: "attemptBoth" }
          ];
          
          for (let i = 0; i < options.length && !code; i++) {
            try {
              // @ts-ignore
              code = window.jsQR(imageDataArray, imageData.width, imageData.height, options[i]);
              if (code && code.data) {
                console.log(`QR code detected with option ${i}:`, code.data);
                break;
              }
            } catch (jsqrError) {
              // エラーは無視して次のオプションを試行
            }
          }
          
          if (code && code.data) {
            console.log('QR code successfully detected:', code.data);
            isActive = false; // スキャン停止
            setIsScanning(false);
            onScan(code.data);
            stopCamera();
            onClose();
            return;
          }
        } catch (error) {
          if (frameCount % 60 === 0) {
            console.error('QR scanning error:', error);
          }
        }
      } else {
        // デバッグ情報
        if (frameCount % 120 === 0) {
          if (!window.jsQR) {
            console.warn('jsQR not available');
          }
          if (imageData.data.length === 0) {
            console.warn('No image data available');
          }
        }
      }

      // 次のフレームをスキャン（少し遅延を入れてCPU負荷を軽減）
      setTimeout(() => {
        if (isActive) {
          requestAnimationFrame(scanFrame);
        }
      }, 50); // 50ms遅延で約20FPS
    };

    // スキャン開始
    requestAnimationFrame(scanFrame);
    
    // スキャン停止関数を返す
    return () => {
      isActive = false;
    };
  };

  // カメラストリームの停止
  const stopCamera = () => {
    console.log('Stopping camera...');
    
    setIsScanning(false);
    setIsRequestingCamera(false);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setHasPermission(null);
  };

  // カメラの切り替え
  const switchCamera = () => {
    console.log('Switching camera...');
    stopCamera();
    setIsRequestingCamera(false); // フラグをリセット
    
    if (availableDevices.length > 1) {
      // 複数のデバイスがある場合はデバイスを切り替え
      const currentIndex = availableDevices.findIndex(device => device.deviceId === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % availableDevices.length;
      const nextDevice = availableDevices[nextIndex];
      console.log('Switching to device:', nextDevice.label);
      setSelectedDeviceId(nextDevice.deviceId);
    } else {
      // デバイスが1つの場合はfacingModeを切り替え
      setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
    }
  };

  // フラッシュライトの切り替え
  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && 'torch' in track.getCapabilities()) {
        try {
          await track.applyConstraints({
            // @ts-ignore
            advanced: [{ torch: !torchEnabled }]
          });
          setTorchEnabled(!torchEnabled);
        } catch (err) {
          console.error('Torch control error:', err);
        }
      }
    }
  };

  // コンポーネントのマウント/アンマウント処理
  useEffect(() => {
    if (isOpen) {
      // モーダルが開かれた時の初期化
      console.log('QR Scanner opened, initializing...');
      setError('');
      setHasPermission(null);
      setIsScanning(false);
      setIsRequestingCamera(false);
      
      // デバイス一覧を取得してから自動でカメラを開始
      const initializeAndStartCamera = async () => {
        try {
          await getAvailableDevices();
          console.log('Device enumeration completed, starting camera automatically');
          // 少し遅延を入れてからカメラを開始
          setTimeout(() => {
            if (isOpen && !streamRef.current && !isRequestingCamera) {
              startCamera();
            }
          }, 500);
        } catch (error) {
          console.error('Device enumeration error:', error);
          // デバイス取得に失敗してもカメラ開始を試行
          setTimeout(() => {
            if (isOpen && !streamRef.current && !isRequestingCamera) {
              startCamera();
            }
          }, 500);
        }
      };
      
      initializeAndStartCamera();
      
      return () => {
        stopCamera();
      };
    } else {
      // モーダルが閉じられた時にカメラを停止
      stopCamera();
    }
  }, [isOpen]);

  // カメラデバイス切り替え時の処理
  useEffect(() => {
    if (isOpen && selectedDeviceId && availableDevices.length > 0) {
      console.log('Device changed, restarting camera with:', selectedDeviceId);
      // 既存のストリームを停止してから新しいデバイスで開始
      if (streamRef.current) {
        stopCamera();
        setTimeout(() => {
          if (isOpen && !isRequestingCamera) {
            startCamera();
          }
        }, 300);
      }
    }
  }, [selectedDeviceId]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-md"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* スキャナー本体 */}
        <div className="p-4">
          {/* ビデオ要素（常にレンダリング、表示制御はCSSで） */}
          <div className="relative">
            <video
              ref={videoRef}
              className={`w-full h-64 bg-black rounded-lg object-cover ${hasPermission ? 'block' : 'hidden'}`}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
              style={{ willReadFrequently: true } as any}
            />
            
            {/* スキャンフレーム */}
            {hasPermission && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white rounded-lg shadow-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                </div>
              </div>
            )}

            {/* ステータス表示 */}
            {isScanning && (
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                スキャン中...
              </div>
            )}
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={startCamera}
                className="mt-2 text-sm text-red-700 underline hover:no-underline"
              >
                再試行
              </button>
            </div>
          )}

          {hasPermission === null && !error && (
            <div className="text-center py-8">
              <div>
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 mb-2">カメラにアクセス中...</p>
                <p className="text-sm text-gray-500 mb-4">
                  {isRequestingCamera 
                    ? 'ブラウザでカメラの許可ダイアログが表示されている場合は「許可」をクリックしてください'
                    : 'カメラを自動で開始しています...'}
                </p>
                {!isRequestingCamera && (
                  <button
                    onClick={() => {
                      console.log('Manual camera start clicked');
                      setIsRequestingCamera(false);
                      setError('');
                      setHasPermission(null);
                      // 既存のストリームを停止してから再開始
                      if (streamRef.current) {
                        stopCamera();
                        setTimeout(() => startCamera(), 300);
                      } else {
                        startCamera();
                      }
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    手動でカメラを開始
                  </button>
                )}
              </div>
            </div>
          )}

          {hasPermission === false && !error && (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">カメラへのアクセスが拒否されました</p>
              <p className="text-sm text-gray-500 mb-4">
                ブラウザの設定でカメラの権限を許可してから再試行してください
              </p>
              <button
                onClick={() => {
                  console.log('Retry camera access clicked');
                  setError('');
                  setHasPermission(null);
                  setIsRequestingCamera(false);
                  startCamera();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                再試行
              </button>
            </div>
          )}

          {/* コントロールボタン */}
          {hasPermission && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={switchCamera}
                className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="カメラ切り替え"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleTorch}
                className={`p-3 rounded-lg transition-colors ${
                  torchEnabled 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="フラッシュライト"
              >
                <Flashlight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* カメラ情報 */}
          {hasPermission && availableDevices.length > 0 && (
            <div className="text-center text-xs text-gray-500 mt-2">
              使用中: {availableDevices.find(device => device.deviceId === selectedDeviceId)?.label || 'カメラ'}
              {availableDevices.length > 1 && ` (${availableDevices.length}台中)`}
            </div>
          )}

          {/* 説明文 */}
          {hasPermission && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {placeholder}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner; 