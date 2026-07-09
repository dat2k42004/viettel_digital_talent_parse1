import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Spin, message } from 'antd';
import { layDanhSach23 } from '../../../../api-generated/endpoints/danh-muc-thuoc-tinh-controller/danh-muc-thuoc-tinh-controller';
import { layDanhSach28, saveBulk } from '../../../../api-generated/endpoints/gia-tri-thuoc-tinh-controller/gia-tri-thuoc-tinh-controller';
import type { DanhMucThuocTinhResponse } from '../../../../api-generated/models/danhMucThuocTinhResponse';

interface GiaTriThuocTinhModalProps {
  open: boolean;
  onCancel: () => void;
  assetId: number;
  assetName: string;
}

export const GiaTriThuocTinhModal: React.FC<GiaTriThuocTinhModalProps> = ({
  open,
  onCancel,
  assetId,
  assetName,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [attributes, setAttributes] = useState<DanhMucThuocTinhResponse[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch attributes applicable for hardware (PHAN_CUNG)
        const attrRes = await layDanhSach23({
          apDungCho: 'PHAN_CUNG',
          size: 100, // retrieve all
        });

        // 2. Fetch current values for this asset
        const valRes = await layDanhSach28({
          id_tai_san: assetId,
          loai_tai_san: 'PHAN_CUNG',
          size: 100,
        });

        if (attrRes.data && attrRes.data.content) {
          // Only show active attributes
          const activeAttrs = attrRes.data.content.filter(attr => attr.trangThai === 'HOAT_DONG');
          setAttributes(activeAttrs);
        }

        // Initialize form values
        const formInitValues: Record<string, any> = {};
        if (attrRes.data?.content && valRes.data?.content) {
          attrRes.data.content.forEach((attr) => {
            const matchedVal = valRes.data?.content?.find(
              (v) => v.danhMucThuocTinhId === attr.id
            );
            if (matchedVal) {
              if (attr.kieuDuLieu === 'SELECT') {
                formInitValues[`attr_${attr.id}_select`] = matchedVal.luaChonId;
                formInitValues[`attr_${attr.id}_custom`] = matchedVal.giaTri;
              } else {
                formInitValues[`attr_${attr.id}`] = matchedVal.giaTri;
              }
            } else {
              // Set default value if exists
              if (attr.kieuDuLieu !== 'SELECT') {
                formInitValues[`attr_${attr.id}`] = attr.giaTriMacDinh || undefined;
              }
            }
          });
        }
        form.setFieldsValue(formInitValues);
      } catch (e: any) {
        message.error(e?.message || t('giaTriThuocTinhModal.khong_the_tai_du_lieu'));
      } finally {
        setLoading(false);
      }
    };

    if (open && assetId) {
      loadData();
    }
  }, [open, assetId, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payloadValues: any[] = [];

      attributes.forEach((attr) => {
        if (attr.kieuDuLieu === 'SELECT') {
          const selectedOptionId = values[`attr_${attr.id}_select`];
          const customVal = values[`attr_${attr.id}_custom`];
          // Find option label
          const selectedOption = attr.luaChonGoiY?.find(o => o.id === selectedOptionId);
          payloadValues.push({
            danhMucThuocTinhId: attr.id,
            luaChonId: selectedOptionId || null,
            giaTri: selectedOption ? selectedOption.giaTri : customVal || '',
          });
        } else {
          const val = values[`attr_${attr.id}`];
          payloadValues.push({
            danhMucThuocTinhId: attr.id,
            giaTri: val !== undefined && val !== null ? String(val) : '',
          });
        }
      });

      setLoading(true);
      const res = await saveBulk({
        loaiTaiSan: 'PHAN_CUNG',
        idTaiSan: assetId,
        values: payloadValues,
      });

      if (res.code === 200) {
        message.success(t('danhMucThuocTinhPage.cap_nhat_thuoc_tinh'));
        onCancel();
      } else {
        message.error(res.message || t('cauHinhDonViPage.luu_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('giaTriThuocTinhModal.loi_khi_luu_du'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t('giaTriThuocTinhModal.cau_hinh_thuoc_tinh_assetname', { assetName: assetName })}
      open={open}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} loading={loading}>
          Lưu cấu hình
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        {attributes.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#8c8c8c' }}>
            Không có thuộc tính động nào được cấu hình áp dụng cho Thiết bị Phần cứng.
          </div>
        ) : (
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            {attributes.map((attr) => {
              if (attr.kieuDuLieu === 'SELECT') {
                return (
                  <div key={attr.id} style={{ marginBottom: 16, borderBottom: '1px dashed #f0f0f0', paddingBottom: 16 }}>
                    <Form.Item
                      label={attr.tenThuocTinh}
                      name={`attr_${attr.id}_select`}
                      rules={[{ required: attr.batBuocNhap, message: t('giaTriThuocTinhModal.vui_long_chon_attr_tenthuoctinh', { tenThuocTinh: attr.tenThuocTinh }) }]}
                    >
                      <Select
                        placeholder={t('giaTriThuocTinhModal.chon_attr_tenthuoctinh', { tenThuocTinh: attr.tenThuocTinh })}
                        allowClear
                        options={attr.luaChonGoiY
                          ?.filter(o => o.trangThai === 'HOAT_DONG')
                          .sort((a, b) => (a.thuTuHienThi || 0) - (b.thuTuHienThi || 0))
                          .map(o => ({ value: o.id, label: o.giaTri }))}
                      />
                    </Form.Item>
                    <Form.Item
                      name={`attr_${attr.id}_custom`}
                      label={t('giaTriThuocTinhModal.attr_tenthuoctinh_gia_tri_khac', { tenThuocTinh: attr.tenThuocTinh })}
                    >
                      <Input placeholder={t('giaTriThuocTinhModal.nhap_gia_tri_khac')} />
                    </Form.Item>
                  </div>
                );
              } else if (attr.kieuDuLieu === 'NUMBER') {
                return (
                  <Form.Item
                    key={attr.id}
                    label={attr.tenThuocTinh}
                    name={`attr_${attr.id}`}
                    rules={[{ required: attr.batBuocNhap, message: t('giaTriThuocTinhModal.vui_long_nhap_attr_tenthuoctinh', { tenThuocTinh: attr.tenThuocTinh }) }]}
                  >
                    <InputNumber style={{ width: '100%' }} placeholder={t('giaTriThuocTinhModal.nhap_so_cho_attr_tenthuoctinh', { tenThuocTinh: attr.tenThuocTinh })} />
                  </Form.Item>
                );
              } else {
                return (
                  <Form.Item
                    key={attr.id}
                    label={attr.tenThuocTinh}
                    name={`attr_${attr.id}`}
                    rules={[{ required: attr.batBuocNhap, message: t('giaTriThuocTinhModal.vui_long_nhap_attr_tenthuoctinh', { tenThuocTinh: attr.tenThuocTinh }) }]}
                  >
                    <Input placeholder={t('giaTriThuocTinhModal.nhap_attr_tenthuoctinh', { tenThuocTinh: attr.tenThuocTinh })} />
                  </Form.Item>
                );
              }
            })}
          </Form>
        )}
      </Spin>
    </Modal>
  );
};
export default GiaTriThuocTinhModal;
