import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, AlertCircle, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface CameraQrScannerProps {
  onScan: (decodedText: string) => void;
  isActive: boolean;
}

export const CameraQrScanner: React.FC<CameraQrScannerProps> = ({ onScan, isActive }) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedText, setLastScannedText] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const regionId = 'qr-camera-scanner-region';

  useEffect(() => {
    if (!isActive) {
      stopScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      setCameraError(null);
      try {
        // Stop any existing scanner
        if (html5QrcodeRef.current) {
          try {
            await html5QrcodeRef.current.stop();
          } catch (e) {
            // Ignore
          }
        }

        const html5Qrcode = new Html5Qrcode(regionId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.UPC_A,
          ],
          verbose: false,
        });

        html5QrcodeRef.current = html5Qrcode;

        const config = {
          fps: 15,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        };

        await html5Qrcode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!isMounted) return;
            handleDecodedCode(decodedText);
          },
          () => {
            // On scan error (ignore frame errors)
          }
        );

        if (isMounted) {
          setIsScanning(true);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Kamera gagal dimulai:', err);
        setCameraError(
          err?.message || 'Kamera tidak dapat diakses. Pastikan izin kamera aktif dan perangkat memiliki webcam/kamera.'
        );
        setIsScanning(false);
      }
    };

    // Small timeout to ensure DOM element is ready
    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isActive]);

  const stopScanner = async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
      } catch (e) {
        console.error('Error stopping scanner', e);
      } finally {
        html5QrcodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const handleDecodedCode = (decodedText: string) => {
    if (cooldown) return;

    setLastScannedText(decodedText);
    setCooldown(true);
    onScan(decodedText);

    // Cooldown 2 seconds to prevent rapid duplicate scanning
    setTimeout(() => {
      setCooldown(false);
      setLastScannedText(null);
    }, 2000);
  };

  const retryCamera = () => {
    setCameraError(null);
    setIsScanning(false);
    // Trigger re-mount start
    const currentScanner = html5QrcodeRef.current;
    if (currentScanner) {
      currentScanner.stop().then(() => {
        html5QrcodeRef.current = null;
      });
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 border-2 border-blue-900 shadow-xl min-h-[260px] flex flex-col items-center justify-center text-white">
      {/* Target Container for html5-qrcode video */}
      <div id={regionId} className="w-full h-full max-w-sm rounded-xl overflow-hidden" />

      {/* Overlay Status */}
      {isScanning && !cameraError && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <span className="bg-emerald-950/90 text-emerald-300 text-[11px] font-black px-3 py-1 rounded-full border border-emerald-500/50 flex items-center space-x-1.5 shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>KAMERA AKTIF - SIAP SCAN QR/BARCODE</span>
          </span>

          {cooldown && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse shadow-md">
              PROSES...
            </span>
          )}
        </div>
      )}

      {/* Camera Error Display */}
      {cameraError && (
        <div className="p-6 text-center space-y-3 z-20 max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-red-950 text-red-400 border border-red-800 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-sm text-red-300">Akses Kamera Diperlukan</h4>
            <p className="text-xs text-slate-400 mt-1">{cameraError}</p>
          </div>
          <button
            type="button"
            onClick={retryCamera}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Kamera Lagi</span>
          </button>
        </div>
      )}

      {/* Visual Scanning Frame Overlay */}
      {isScanning && !cameraError && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-56 h-56 border-2 border-amber-400/90 rounded-2xl relative shadow-[0_0_20px_rgba(251,191,36,0.4)]">
            {/* Corner Markers */}
            <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

            {/* Scanning Laser Beam */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_12px_#ef4444]" />
          </div>
        </div>
      )}

      {/* Scanned Feedback Overlay */}
      {lastScannedText && (
        <div className="absolute bottom-3 left-3 right-3 bg-emerald-900/95 border border-emerald-400 text-white p-2.5 rounded-xl text-center z-20 shadow-2xl animate-in zoom-in-95">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-black">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>QR DETECTED: {lastScannedText}</span>
          </div>
        </div>
      )}
    </div>
  );
};
