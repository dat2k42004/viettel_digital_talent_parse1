import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Row, Col, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import type { LinhKienPhanCungResponse } from '../../../../api-generated/models/linhKienPhanCungResponse';
import type { LinhKienPhanCungRequest } from '../../../../api-generated/models/linhKienPhanCungRequest';
import type { SelectOption } from '../../../../api-generated/models/selectOption';
import { laySelectOptions3 } from '../../../../api-generated/endpoints/tai-san-phan-cung-controller/tai-san-phan-cung-controller';
import { laySelectOptions5 } from '../../../../api-generated/endpoints/nha-cung-cap-controller/nha-cung-cap-controller';

interface LinhKienPhanCungFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedLinhKien: LinhKienPhanCungResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: LinhKienPhanCungRequest) => Promise<void>;
}

export const LinhKienPhanCungFormModal: React.FC<LinhKienPhanCungFormModalProps> = ({
  open,
  onCancel,
  selectedLinhKien,
  mode,
  onSave,
}) => {
  const [form] = Form.useForm<LinhKienPhanCungRequest>();
  const isView = mode === 'view';

  const [mauPhanCungOptions, setMauPhanCungOptions] = useState<SelectOption[]>([]);
  const [nhaCungCapOptions, setNhaCungCapOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [mauRes, nccRes] = await Promise.all([
          laySelectOptions3(), // In a real app we might query coTheThaoLap=true but let's query all first
          laySelectOptions5(),
        ]);
        if (mauRes.data) setMauPhanCungOptions(mauRes.data);
        if (nccRes.data) setNhaCungCapOptions(nccRes.data);
      } catch (e) {
        message.error('Không thể tải danh mục cấu hình linh kiện/nhà cung cấp!');
      }
    };
    if (open) {
      fetchOptions();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (selectedLinhKien) {
        form.setFieldsValue({
          idTaiSanPhanCung: selectedLinhKien.idTaiSanPhanCung,
          idNhaCungCap: selectedLinhKien.idNhaCungCap,
          soSerial: selectedLinhKien.soSerial,
          giaMua: selectedLinhKien.giaMua ? Number(selectedLinhKien.giaMua) : undefined,
          thoiGianMua: selectedLinhKien.thoiGianMua ? dayjs(selectedLinhKien.thoiGianMua) as any : undefined,
          hanBaoHanhThang: selectedLinhKien.hanBaoHanhThang,
          trangThaiKho: selectedLinhKien.trangThaiKho || 'TON_KHO',
          viTriKho: selectedLinhKien.viTriKho,
          trangThai: selectedLinhKien.trangThai || 'HOAT_DONG',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ trangThaiKho: 'TON_KHO', trangThai: 'HOAT_DONG' });
      }
    }
  }, [open, selectedLinhKien, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        thoiGianMua: values.thoiGianMua ? dayjs(values.thoiGianMua).format('YYYY-MM-DD') : undefined,
        trangThai: selectedLinhKien ? selectedLinhKien.trangThai : 'HOAT_DONG',
      };
      await onSave(payload as any);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return 'Chi tiết linh kiện phần cứng';
    return selectedLinhKien ? 'Cập nhật linh kiện phần cứng' : 'Thêm mới linh kiện phần cứng';
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
              name="idTaiSanPhanCung"
              label="Mẫu thiết bị gốc (Mẫu linh kiện)"
              rules={[{ required: true, message: 'Vui lòng chọn mẫu linh kiện!' }]}
            >
              <Select
                disabled={isView}
                placeholder="Chọn mẫu linh kiện"
                options={mauPhanCungOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="idNhaCungCap" label="Nhà cung cấp">
              <Select
                disabled={isView}
                placeholder="Chọn nhà cung cấp"
                options={nhaCungCapOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="soSerial"
              label="Số Serial"
              rules={[
                { required: true, message: 'Vui lòng nhập số Serial!' },
                { max: 100, message: 'Số Serial không vượt quá 100 ký tự!' }
              ]}
            >
              <Input disabled={isView} placeholder="Nhập số Serial linh kiện (RAM, SSD, HDD...)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="giaMua" label="Giá mua (VND)">
              <InputNumber
                disabled={isView}
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                placeholder="Nhập giá mua"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="thoiGianMua" label="Thời gian mua">
              <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="hanBaoHanhThang" label="Hạn bảo hành (tháng)">
              <InputNumber disabled={isView} style={{ width: '100%' }} min={0} placeholder="Hạn bảo hành" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isView ? 8 : 12}>
            <Form.Item name="trangThaiKho" label="Trạng thái kho">
              <Select disabled={isView} options={[
                { value: 'TON_KHO', label: 'Tồn kho (Sẵn sàng lắp)' },
                { value: 'CAP_PHAT', label: 'Đã lắp ráp (Liên kết)' },
                { value: 'BAO_TRI', label: 'Đang bảo trì' },
                { value: 'THANH_LY', label: 'Đã thanh lý' },
              ]} />
            </Form.Item>
          </Col>
          <Col span={isView ? 8 : 12}>
            <Form.Item name="viTriKho" label="Vị trí kho">
              <Input disabled={isView} placeholder="Vị trí lưu trữ lẻ" />
            </Form.Item>
          </Col>
          {isView && (
            <Col span={8}>
              <Form.Item
                name="trangThai"
                label="Trạng thái vận hành"
              >
                <Select disabled options={[
                  { value: 'HOAT_DONG', label: 'Hoạt động' },
                  { value: 'KHOA', label: 'Khóa' },
                  { value: 'CAP_PHAT', label: 'Cấp phát' },
                ]} />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
};

export default LinhKienPhanCungFormModal;
