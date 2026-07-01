import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, message, Upload, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { authStore, QUYEN } from '../../../../stores/AuthStore';
import { axiosInstance } from '../../../../api/axiosInstance';
import type { TaiSanPhanMemResponse } from '../../../../api-generated/models/taiSanPhanMemResponse';
import type { TaiSanPhanMemRequest } from '../../../../api-generated/models/taiSanPhanMemRequest';
import type { SelectOption } from '../../../../api-generated/models/selectOption';
import { laySelectOptions7 } from '../../../../api-generated/endpoints/hang-san-xuat-controller/hang-san-xuat-controller';
import { laySelectOptions5 } from '../../../../api-generated/endpoints/loai-tai-san-controller/loai-tai-san-controller';
import { laySelectOptions9 } from '../../../../api-generated/endpoints/danh-muc-tai-san-controller/danh-muc-tai-san-controller';

interface TaiSanPhanMemFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedTaiSanPhanMem: TaiSanPhanMemResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: TaiSanPhanMemRequest) => Promise<void>;
}

export const TaiSanPhanMemFormModal: React.FC<TaiSanPhanMemFormModalProps> = ({
  open,
  onCancel,
  selectedTaiSanPhanMem,
  mode,
  onSave,
}) => {
  const [form] = Form.useForm<TaiSanPhanMemRequest>();
  const isView = mode === 'view';

  // Dropdown options
  const [hangOptions, setHangOptions] = useState<SelectOption[]>([]);
  const [loaiOptions, setLoaiOptions] = useState<SelectOption[]>([]);
  const [danhmucOptions, setDanhmucOptions] = useState<SelectOption[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [hangRes, loaiRes, dmRes] = await Promise.all([
          laySelectOptions7(),
          laySelectOptions5(),
          laySelectOptions9(),
        ]);
        if (hangRes.data) setHangOptions(hangRes.data);
        if (loaiRes.data) setLoaiOptions(loaiRes.data);
        if (dmRes.data) setDanhmucOptions(dmRes.data);
      } catch (e) {
        message.error('Không thể tải danh sách tùy chọn cho dropdowns!');
      }
    };
    if (open) {
      fetchOptions();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (selectedTaiSanPhanMem) {
        form.setFieldsValue({
          idDanhMucTaiSan: selectedTaiSanPhanMem.idDanhMucTaiSan,
          idLoaiTaiSan: selectedTaiSanPhanMem.idLoaiTaiSan,
          idHangSanXuat: selectedTaiSanPhanMem.idHangSanXuat,
          maMau: selectedTaiSanPhanMem.maMau,
          tenMau: selectedTaiSanPhanMem.tenMau,
          hinhAnh: selectedTaiSanPhanMem.hinhAnh,
          hinhThucTrienKhai: selectedTaiSanPhanMem.hinhThucTrienKhai,
          nenTangHoTro: selectedTaiSanPhanMem.nenTangHoTro,
          hinhThucCapPhep: selectedTaiSanPhanMem.hinhThucCapPhep,
          moTa: selectedTaiSanPhanMem.moTa,
          trangThai: selectedTaiSanPhanMem.trangThai || 'HOAT_DONG',
        });
        setImageUrl(selectedTaiSanPhanMem.hinhAnh || '');
      } else {
        form.resetFields();
        form.setFieldsValue({ trangThai: 'HOAT_DONG' });
        setImageUrl('');
      }
    }
  }, [open, selectedTaiSanPhanMem, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave({
        ...values,
        trangThai: selectedTaiSanPhanMem ? selectedTaiSanPhanMem.trangThai : 'HOAT_DONG',
      } as TaiSanPhanMemRequest);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return 'Chi tiết mẫu tài sản phần mềm';
    return selectedTaiSanPhanMem ? 'Cập nhật mẫu tài sản phần mềm' : 'Thêm mới mẫu tài sản phần mềm';
  };

  return (
    <Modal
      title={getTitle()}
      open={open}
      onCancel={onCancel}
      footer={
        isView
          ? [
              <Button key="close" onClick={onCancel}>
                Đóng
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={onCancel}>
                Hủy bỏ
              </Button>,
              <Button key="submit" type="primary" onClick={handleSubmit}>
                Xác nhận lưu
              </Button>,
            ]
      }
      width={700}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tenMau"
              label="Tên mẫu phần mềm"
              rules={[
                { required: true, message: 'Vui lòng nhập tên mẫu!' },
                { max: 150, message: 'Tên mẫu không vượt quá 150 ký tự!' },
              ]}
            >
              <Input disabled={isView} placeholder="Ví dụ: Office 365 Pro" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maMau"
              label="Mã mẫu phần mềm"
            >
              <Input disabled placeholder="Mã hệ thống tự động sinh" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="idHangSanXuat"
              label="Hãng sản xuất"
              rules={[{ required: true, message: 'Vui lòng chọn hãng sản xuất!' }]}
            >
              <Select
                disabled={isView}
                placeholder="Chọn hãng"
                options={hangOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="idLoaiTaiSan"
              label="Loại tài sản"
              rules={[{ required: true, message: 'Vui lòng chọn loại tài sản!' }]}
            >
              <Select
                disabled={isView}
                placeholder="Chọn loại"
                options={loaiOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="idDanhMucTaiSan"
              label="Danh mục tài sản"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            >
              <Select
                disabled={isView}
                placeholder="Chọn danh mục"
                options={danhmucOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="hinhThucTrienKhai"
              label="Hình thức triển khai"
              rules={[{ max: 50, message: 'Hình thức triển khai không vượt quá 50 ký tự!' }]}
            >
              <Input disabled={isView} placeholder="Ví dụ: Cloud, On-Premise" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="nenTangHoTro"
              label="Nền tảng hỗ trợ"
              rules={[{ max: 100, message: 'Nền tảng hỗ trợ không vượt quá 100 ký tự!' }]}
            >
              <Input disabled={isView} placeholder="Ví dụ: Windows, macOS, Linux" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isView ? 12 : 24}>
            <Form.Item
              name="hinhThucCapPhep"
              label="Hình thức cấp phép"
              rules={[{ max: 50, message: 'Hình thức cấp phép không vượt quá 50 ký tự!' }]}
            >
              <Input disabled={isView} placeholder="Ví dụ: Subscription, Perpetual" />
            </Form.Item>
          </Col>
          {isView && (
            <Col span={12}>
              <Form.Item
                name="trangThai"
                label="Trạng thái"
              >
                <Select disabled options={[
                  { value: 'HOAT_DONG', label: 'Đang hoạt động' },
                  { value: 'KHOA', label: 'Tạm khóa' },
                ]} />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="hinhAnh" label="Hình ảnh mẫu">
              {isView ? (
                form.getFieldValue('hinhAnh') ? (
                  <div style={{ marginTop: 8 }}>
                    <img src={form.getFieldValue('hinhAnh')} alt="Mẫu phần mềm" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, objectFit: 'contain' }} />
                  </div>
                ) : (
                  <span>Không có hình ảnh</span>
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Input 
                    value={imageUrl} 
                    disabled 
                    placeholder="URL hình ảnh sẽ tự động điền khi upload thành công" 
                  />
                  {authStore.kiemTraQuyen(QUYEN.TAI_LEN_FILE) ? (
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={async (file) => {
                        const formData = new FormData();
                        formData.append('files', file);
                        setUploading(true);
                        try {
                          const res = await axiosInstance.post('/api/files/upload', formData, {
                            headers: {
                              'Content-Type': 'multipart/form-data',
                            },
                          });
                          if (res.data && res.data.code === 200 && res.data.data && res.data.data.length > 0) {
                            const uploadedUrl = res.data.data[0];
                            form.setFieldValue('hinhAnh', uploadedUrl);
                            setImageUrl(uploadedUrl);
                            message.success('Tải ảnh lên thành công!');
                          } else {
                            message.error('Tải ảnh thất bại!');
                          }
                        } catch (err: any) {
                          message.error(err?.message || 'Lỗi khi tải ảnh lên!');
                        } finally {
                          setUploading(false);
                        }
                        return false;
                      }}
                    >
                      <Button icon={<UploadOutlined />} loading={uploading}>
                        Tải ảnh lên (Upload)
                      </Button>
                    </Upload>
                  ) : (
                    <Typography.Text type="secondary">Bạn không có quyền upload ảnh (yêu cầu quyền TAI_LEN_FILE).</Typography.Text>
                  )}
                  {imageUrl && (
                    <div style={{ marginTop: 4 }}>
                      <img src={imageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 80, borderRadius: 8, objectFit: 'contain' }} />
                    </div>
                  )}
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="moTa" label="Mô tả mẫu tài sản">
          <Input.TextArea disabled={isView} rows={3} placeholder="Mô tả thông số chi tiết của mẫu..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaiSanPhanMemFormModal;
