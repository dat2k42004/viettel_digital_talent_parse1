import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, Button, Space, Select, Typography, Alert, Spin } from 'antd';
import { CameraOutlined, CloseOutlined, SwapOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Html5Qrcode, type Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { playSuccessBeep, playWarningBeep } from '../../utils/soundHelper';

const { Text } = Typography;

export interface QrScanResult {
  rawText: string;
  parsedData?: {
    type?: string;
    id?: number;
    code?: string;
    tenantId?: string;
    [key: string]: any;
  };
}

interface QrScannerModalProps {
  open: boolean;
  onCancel: () => void;
  onScan: (result: QrScanResult) => { matched: boolean; message: string; assetName?: string };
  title?: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  open,
  onCancel,
  onScan,
  title = 'Quét mã QR kiểm kê tài sản',
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);

  // Debounce ref to avoid rapid duplicate scans of the same code within 2 seconds
  const lastScanRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Lỗi khi dừng camera:', err);
      } finally {
        scannerRef.current = null;
      }
    }
  }, []);

  const handleDecodedText = useCallback(
    (decodedText: string) => {
      const now = Date.now();
      // Debounce 1.8s for the same code
      if (
        lastScanRef.current.code === decodedText &&
        now - lastScanRef.current.time < 1800
      ) {
        return;
      }

      lastScanRef.current = { code: decodedText, time: now };

      // Parse payload
      let parsedData: any = undefined;
      try {
        parsedData = JSON.parse(decodedText);
      } catch {
        // Raw plaintext fallback
      }

      const scanResult: QrScanResult = {
        rawText: decodedText,
        parsedData,
      };

      const outcome = onScan(scanResult);

      if (outcome.matched) {
        playSuccessBeep();
        setLastFeedback({
          type: 'success',
          text: outcome.message || `Đã khớp: ${outcome.assetName || decodedText}`,
        });
      } else {
        playWarningBeep();
        setLastFeedback({
          type: 'warning',
          text: outcome.message || `Mã ${decodedText} không khớp đợt kiểm kê`,
        });
      }
    },
    [onScan]
  );

  const startScanner = useCallback(
    async (cameraId: string) => {
      setErrorMsg(null);
      setIsStarting(true);
      await stopScanner();

      try {
        const scanner = new Html5Qrcode('qr-reader-viewport');
        scannerRef.current = scanner;

        const config: Html5QrcodeCameraScanConfig = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await scanner.start(
          cameraId,
          config,
          (decodedText) => handleDecodedText(decodedText),
          () => {
            // Frame scan loop - silent
          }
        );
      } catch (err: any) {
        const errStr = err?.message || String(err);
        setErrorMsg(`Không thể kích hoạt Camera: ${errStr}. Vui lòng cấp quyền truy cập Camera trên trình duyệt.`);
      } finally {
        setIsStarting(false);
      }
    },
    [handleDecodedText, stopScanner]
  );

  // Load cameras when modal opens
  useEffect(() => {
    let isMounted = true;

    if (open) {
      setErrorMsg(null);
      setLastFeedback(null);
      lastScanRef.current = { code: '', time: 0 };

      Html5Qrcode.getCameras()
        .then((devices) => {
          if (!isMounted) return;
          if (devices && devices.length > 0) {
            const formatted = devices.map((d, idx) => ({
              id: d.id,
              label: d.label || `Camera ${idx + 1}`,
            }));
            setCameras(formatted);
            // Default to environment (back) camera if available, otherwise first camera
            const backCam = devices.find((d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('sau') ||
              d.label.toLowerCase().includes('environment')
            );
            const chosenId = backCam ? backCam.id : devices[0].id;
            setSelectedCameraId(chosenId);
            startScanner(chosenId);
          } else {
            setErrorMsg('Không tìm thấy thiết bị Camera nào trên máy tính / điện thoại của bạn.');
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          setErrorMsg('Không thể truy cập danh sách Camera. Vui lòng cho phép quyền Camera trên trình duyệt.');
        });
    } else {
      stopScanner();
    }

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [open, startScanner, stopScanner]);

  const handleCameraChange = (newCameraId: string) => {
    setSelectedCameraId(newCameraId);
    startScanner(newCameraId);
  };

  return (
    <Modal
      title={
        <Space>
          <CameraOutlined style={{ color: '#1677ff', fontSize: 20 }} />
          <span>{title}</span>
        </Space>
      }
      open={open}
      onCancel={() => {
        stopScanner();
        onCancel();
      }}
      footer={[
        <Button
          key="close"
          type="primary"
          icon={<CloseOutlined />}
          onClick={() => {
            stopScanner();
            onCancel();
          }}
        >
          Hoàn tất quét
        </Button>,
      ]}
      width={520}
      destroyOnClose
      centered
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Camera Selector (if multiple cameras exist) */}
        {cameras.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SwapOutlined style={{ color: '#888' }} />
            <Text type="secondary" style={{ fontSize: 13 }}>Đổi Camera:</Text>
            <Select
              size="small"
              value={selectedCameraId}
              onChange={handleCameraChange}
              style={{ flex: 1 }}
              options={cameras.map((c) => ({ value: c.id, label: c.label }))}
            />
          </div>
        )}

        {/* Feedback Alert */}
        {lastFeedback && (
          <Alert
            message={lastFeedback.text}
            type={lastFeedback.type}
            showIcon
            icon={lastFeedback.type === 'success' ? <CheckCircleOutlined /> : undefined}
            style={{ borderRadius: 6 }}
          />
        )}

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            style={{ borderRadius: 6 }}
          />
        )}

        {/* Viewport container for html5-qrcode */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: 280,
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isStarting && (
            <div
              style={{
                position: 'absolute',
                zIndex: 10,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Spin size="large" />
              <Text style={{ color: '#fff' }}>Đang khởi động Camera...</Text>
            </div>
          )}

          <div
            id="qr-reader-viewport"
            style={{
              width: '100%',
              minHeight: 280,
            }}
          />
        </div>

        <Text type="secondary" style={{ textAlign: 'center', fontSize: 12 }}>
          💡 Đưa mã QR trên tem nhãn thiết bị vào giữa khung hình để hệ thống tự động nhận diện và đối soát.
        </Text>
      </div>
    </Modal>
  );
};

export default QrScannerModal;
