import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { layDanhSach25 } from '../../../api-generated/endpoints/danh-muc-cau-hinh-controller/danh-muc-cau-hinh-controller';
import type { DanhMucCauHinhResponse } from '../../../api-generated/models/danhMucCauHinhResponse';
import type { CauHinhDonViResponse } from '../../../api-generated/models/cauHinhDonViResponse';
import type { CauHinhDonViRequest } from '../../../api-generated/models/cauHinhDonViRequest';

interface CauHinhDonViFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedRecord: CauHinhDonViResponse | null;
  onSave: (values: CauHinhDonViRequest) => Promise<void>;
}

export const CauHinhDonViFormModal: React.FC<CauHinhDonViFormModalProps> = ({
  open,
  onCancel,
  selectedRecord,
  onSave,
}) => {
  const [form] = Form.useForm<CauHinhDonViRequest>();
  const [danhSachDanhMuc, setDanhSachDanhMuc] = useState<DanhMucCauHinhResponse[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (open) {
      taiDanhMuc();
      if (selectedRecord) {
        form.setFieldsValue({
          idDanhMucCauHinh: selectedRecord.idDanhMucCauHinh,
          giaTriCauHinh: selectedRecord.giaTriCauHinh,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, selectedRecord, form]);

  const taiDanhMuc = async () => {
    setLoadingList(true);
    try {
      const res = await layDanhSach25({ page: 0, size: 200 });
      if (res.code === 200 && res.data) {
        setDanhSachDanhMuc(res.data.content || []);
      }
    } catch (e) {
      console.error('Không thể tải danh mục cấu hình', e);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave({
        idDanhMucCauHinh: values.idDanhMucCauHinh,
        giaTriCauHinh: values.giaTriCauHinh,
      } as CauHinhDonViRequest);
    } catch (e) {
      // Form validation failed
    }
  };

  return (
    <Modal
      title={selectedRecord ? 'Cập nhật cấu hình đơn vị' : 'Thêm cấu hình đơn vị'}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy bỏ
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Xác nhận lưu
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="idDanhMucCauHinh"
          label="Chọn trường cấu hình"
          rules={[{ required: true, message: 'Vui lòng chọn trường cấu hình!' }]}
        >
          <Select
            placeholder="Chọn trường cấu hình"
            disabled={!!selectedRecord}
            loading={loadingList}
            options={danhSachDanhMuc.map((d) => ({
              value: d.id,
              label: `${d.tenCauHinh} (${d.maCauHinh})`,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="giaTriCauHinh"
          label="Giá trị cấu hình riêng"
          rules={[{ required: true, message: 'Vui lòng nhập giá trị cấu hình!' }]}
        >
          <Input placeholder="Nhập giá trị cấu hình riêng cho đơn vị" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CauHinhDonViFormModal;
