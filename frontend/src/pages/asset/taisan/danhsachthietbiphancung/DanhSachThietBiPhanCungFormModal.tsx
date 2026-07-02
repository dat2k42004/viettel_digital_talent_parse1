import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Row, Col, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import type { DanhSachThietBiPhanCungResponse } from '../../../../api-generated/models/danhSachThietBiPhanCungResponse';
import type { DanhSachThietBiPhanCungRequest } from '../../../../api-generated/models/danhSachThietBiPhanCungRequest';
import type { SelectOption } from '../../../../api-generated/models/selectOption';
import { laySelectOptions3 } from '../../../../api-generated/endpoints/tai-san-phan-cung-controller/tai-san-phan-cung-controller';
import { laySelectOptions5 } from '../../../../api-generated/endpoints/nha-cung-cap-controller/nha-cung-cap-controller';

interface DanhSachThietBiPhanCungFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedThietBi: DanhSachThietBiPhanCungResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: DanhSachThietBiPhanCungRequest) => Promise<void>;
}

export const DanhSachThietBiPhanCungFormModal: React.FC<DanhSachThietBiPhanCungFormModalProps> = ({
  open,
  onCancel,
  selectedThietBi,
  mode,
  onSave,
}) => {
  const [form] = Form.useForm<DanhSachThietBiPhanCungRequest>();
  const isView = mode === 'view';

  const [mauPhanCungOptions, setMauPhanCungOptions] = useState<SelectOption[]>([]);
  const [nhaCungCapOptions, setNhaCungCapOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [mauRes, nccRes] = await Promise.all([
          laySelectOptions3(),
          laySelectOptions5(),
        ]);
        if (mauRes.data) setMauPhanCungOptions(mauRes.data);
        if (nccRes.data) setNhaCungCapOptions(nccRes.data);
      } catch (e) {
        message.error('Không thể tải danh mục cấu hình thiết bị/nhà cung cấp!');
      }
    };
    if (open) {
      fetchOptions();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (selectedThietBi) {
        form.setFieldsValue({
          idTaiSanPhanCung: selectedThietBi.idTaiSanPhanCung,
          idNhaCungCap: selectedThietBi.idNhaCungCap,
          soSerial: selectedThietBi.soSerial,
          maTheTaiSan: selectedThietBi.maTheTaiSan,
          giaMua: selectedThietBi.giaMua ? Number(selectedThietBi.giaMua) : undefined,
          thoiGianMua: selectedThietBi.thoiGianMua ? dayjs(selectedThietBi.thoiGianMua) as any : undefined,
          hanBaoHanhThang: selectedThietBi.hanBaoHanhThang,
          trangThaiKho: selectedThietBi.trangThaiKho || 'TON_KHO',
          viTriKho: selectedThietBi.viTriKho,
          trangThai: selectedThietBi.trangThai || 'HOAT_DONG',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ trangThaiKho: 'TON_KHO', trangThai: 'HOAT_DONG' });
      }
    }
  }, [open, selectedThietBi, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        thoiGianMua: values.thoiGianMua ? dayjs(values.thoiGianMua).format('YYYY-MM-DD') : undefined,
        trangThai: selectedThietBi ? selectedThietBi.trangThai : 'HOAT_DONG',
      };
      await onSave(payload as any);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return 'Chi tiết thiết bị phần cứng';
    return selectedThietBi ? 'Cập nhật thiết bị phần cứng' : 'Thêm mới thiết bị phần cứng';
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
              label="Mẫu tài sản phần cứng"
              rules={[{ required: true, message: 'Vui lòng chọn mẫu tài sản!' }]}
            >
              <Select
                disabled={isView}
                placeholder="Chọn mẫu tài sản"
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
          <Col span={12}>
            <Form.Item
              name="soSerial"
              label="Số Serial"
              rules={[
                { required: true, message: 'Vui lòng nhập số Serial!' },
                { max: 100, message: 'Serial không vượt quá 100 ký tự!' },
              ]}
            >
              <Input disabled={isView} placeholder="Nhập số Serial thiết bị" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maTheTaiSan"
              label="Mã thẻ tài sản"
            >
              <Input disabled placeholder="Mã thẻ tự động sinh từ loại tài sản" />
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
              <InputNumber disabled={isView} style={{ width: '100%' }} min={0} placeholder="Số tháng bảo hành" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isView ? 8 : 12}>
            <Form.Item name="trangThaiKho" label="Trạng thái kho">
              <Select disabled={isView} options={[
                { value: 'TON_KHO', label: 'Tồn kho' },
                { value: 'CAP_PHAT', label: 'Đang cấp phát' },
                { value: 'BAO_TRI', label: 'Đang bảo trì' },
                { value: 'THANH_LY', label: 'Đã thanh lý' },
              ]} />
            </Form.Item>
          </Col>
          <Col span={isView ? 8 : 12}>
            <Form.Item name="viTriKho" label="Vị trí kho">
              <Input disabled={isView} placeholder="Nhập vị trí lưu kho" />
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

export default DanhSachThietBiPhanCungFormModal;
