import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Row, Col, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import type { DanhSachThietBiPhanMemResponse } from '../../../../api-generated/models/danhSachThietBiPhanMemResponse';
import type { DanhSachThietBiPhanMemRequest } from '../../../../api-generated/models/danhSachThietBiPhanMemRequest';
import type { SelectOption } from '../../../../api-generated/models/selectOption';
import { laySelectOptions2 } from '../../../../api-generated/endpoints/tai-san-phan-mem-controller/tai-san-phan-mem-controller';
import { laySelectOptions5 } from '../../../../api-generated/endpoints/nha-cung-cap-controller/nha-cung-cap-controller';

interface DanhSachThietBiPhanMemFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedThietBi: DanhSachThietBiPhanMemResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: DanhSachThietBiPhanMemRequest) => Promise<void>;
}

export const DanhSachThietBiPhanMemFormModal: React.FC<DanhSachThietBiPhanMemFormModalProps> = ({
  open,
  onCancel,
  selectedThietBi,
  mode,
  onSave,
}) => {
  const [form] = Form.useForm<DanhSachThietBiPhanMemRequest>();
  const isView = mode === 'view';

  const [mauPhanMemOptions, setMauPhanMemOptions] = useState<SelectOption[]>([]);
  const [nhaCungCapOptions, setNhaCungCapOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [mauRes, nccRes] = await Promise.all([
          laySelectOptions2(),
          laySelectOptions5(),
        ]);
        if (mauRes.data) setMauPhanMemOptions(mauRes.data);
        if (nccRes.data) setNhaCungCapOptions(nccRes.data);
      } catch (e) {
        message.error('Không thể tải danh mục cấu hình phần mềm/nhà cung cấp!');
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
          idTaiSanPhanMem: selectedThietBi.idTaiSanPhanMem,
          idNhaCungCap: selectedThietBi.idNhaCungCap,
          keyBanQuyen: selectedThietBi.keyBanQuyen,
          maChungTuMua: selectedThietBi.maChungTuMua,
          tongSoGhe: selectedThietBi.tongSoGhe,
          giaMua: selectedThietBi.giaMua ? Number(selectedThietBi.giaMua) : undefined,
          thoiGianMua: selectedThietBi.thoiGianMua ? dayjs(selectedThietBi.thoiGianMua) as any : undefined,
          thoiGianHetHan: selectedThietBi.thoiGianHetHan ? dayjs(selectedThietBi.thoiGianHetHan) as any : undefined,
          trangThaiKho: selectedThietBi.trangThaiKho || 'TON_KHO',
          trangThai: selectedThietBi.trangThai || 'HOAT_DONG',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ tongSoGhe: 1, trangThaiKho: 'TON_KHO', trangThai: 'HOAT_DONG' });
      }
    }
  }, [open, selectedThietBi, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        thoiGianMua: values.thoiGianMua ? dayjs(values.thoiGianMua).format('YYYY-MM-DD') : undefined,
        thoiGianHetHan: values.thoiGianHetHan ? dayjs(values.thoiGianHetHan).format('YYYY-MM-DD') : undefined,
        trangThai: selectedThietBi ? selectedThietBi.trangThai : 'HOAT_DONG',
      };
      await onSave(payload as any);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return 'Chi tiết bản quyền phần mềm';
    return selectedThietBi ? 'Cập nhật bản quyền phần mềm' : 'Thêm mới bản quyền phần mềm';
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
              name="idTaiSanPhanMem"
              label="Mẫu tài sản phần mềm"
              rules={[{ required: true, message: 'Vui lòng chọn mẫu phần mềm!' }]}
            >
              <Select
                disabled={isView}
                placeholder="Chọn mẫu phần mềm"
                options={mauPhanMemOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
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
              name="keyBanQuyen"
              label="Key bản quyền / License key"
              rules={[
                { required: true, message: 'Vui lòng nhập Key bản quyền!' },
                { max: 255, message: 'Key bản quyền không vượt quá 255 ký tự!' },
              ]}
            >
              <Input disabled={isView} placeholder="Nhập mã key bản quyền phần mềm" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maChungTuMua"
              label="Mã chứng từ mua"
              rules={[{ max: 100, message: 'Mã chứng từ không vượt quá 100 ký tự!' }]}
            >
              <Input disabled={isView} placeholder="Nhập mã hóa đơn/chứng từ mua" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tongSoGhe"
              label="Tổng số ghế (License seats)"
              rules={[
                { required: true, message: 'Vui lòng nhập số ghế sử dụng!' },
                { type: 'number', min: 1, message: 'Tổng số ghế phải lớn hơn hoặc bằng 1!' }
              ]}
            >
              <InputNumber disabled={isView} style={{ width: '100%' }} placeholder="Số lượng máy được phép cài đặt" />
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
            <Form.Item name="thoiGianHetHan" label="Thời gian hết hạn">
              <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isView ? 12 : 24}>
            <Form.Item name="trangThaiKho" label="Trạng thái kho">
              <Select disabled={isView} options={[
                { value: 'TON_KHO', label: 'Chưa kích hoạt (Trong kho)' },
                { value: 'CAP_PHAT', label: 'Đang hoạt động (Đã cấp)' },
                { value: 'THANH_LY', label: 'Đã hủy/Hết hạn' },
              ]} />
            </Form.Item>
          </Col>
          {isView && (
            <Col span={12}>
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

export default DanhSachThietBiPhanMemFormModal;
