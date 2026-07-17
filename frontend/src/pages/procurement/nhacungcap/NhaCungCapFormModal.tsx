import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col } from 'antd';
import type { NhaCungCapResponse } from '../../../api-generated/models/nhaCungCapResponse';
import type { NhaCungCapRequest } from '../../../api-generated/models/nhaCungCapRequest';

interface NhaCungCapFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: NhaCungCapResponse | null;
    mode: 'add' | 'edit' | 'view'; // Đã bổ sung thuộc tính mode
    onSave: (values: NhaCungCapRequest) => Promise<void>;
    // loading: boolean;
}

export const NhaCungCapFormModal: React.FC<NhaCungCapFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode, // Nhận prop mode
    onSave,
    // loading,
}) => {
  const { t } = useTranslation();
    const [form] = Form.useForm<NhaCungCapRequest>();
    const isView = mode === 'view'; // Xác định xem có phải đang ở chế độ xem chi tiết không

    useEffect(() => {
        if (open) {
            if (selectedRecord) {
                form.setFieldsValue({
                    maNhaCungCap: selectedRecord.maNhaCungCap,
                    tenNhaCungCap: selectedRecord.tenNhaCungCap,
                    maSoThue: selectedRecord.maSoThue,
                    nguoiLienHe: selectedRecord.nguoiLienHe,
                    soDienThoai: selectedRecord.soDienThoai,
                    email: selectedRecord.email,
                    diaChi: selectedRecord.diaChi,
                    ghiChu: selectedRecord.ghiChu,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, selectedRecord, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onSave(values as NhaCungCapRequest);
        } catch (e) {
            // Validate form failed
        }
    };

    // Thay đổi Title Modal dựa trên mode
    const getTitle = () => {
        if (isView) return t('nhaCungCapFormModal.chi_tiet_thong_tin');
        return selectedRecord ? t('nhaCungCapFormModal.cap_nhat_thong_tin') : t('nhaCungCapFormModal.them_moi_nha_cung');
    };

    return (
        <Modal
            title={getTitle()}
            open={open}
            onCancel={onCancel}
            // confirmLoading={loading}
            footer={
                isView
                    ? [
                        <Button key="close" onClick={onCancel}>{t('common.close')}</Button>,
                    ]
                    : [
                        <Button key="cancel" onClick={onCancel}>{t('common.cancel')}</Button>,
                        <Button key="submit" type="primary" onClick={handleSubmit}>{t('common.save')}</Button>,
                    ]
            }
            width={700}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="maNhaCungCap" label={t('nhaCungCapFormModal.ma_nha_cung_cap')}>
                            <Input disabled placeholder={t('nhaCungCapFormModal.ma_he_thong_tu')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="tenNhaCungCap"
                            label={t('nhaCungCapPage.ten_nha_cung_cap')}
                            rules={[{ required: true, message: t('nhaCungCapFormModal.vui_long_nhap_ten') }]}
                        >
                            <Input disabled={isView} placeholder={t('nhaCungCapFormModal.vi_du_cong_ty')} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="maSoThue" label={t('donViManagementPage.ma_so_thue')}>
                            <Input disabled={isView} placeholder={t('donViFormModal.nhap_ma_so_thue')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="nguoiLienHe" label={t('nhaCungCapFormModal.nguoi_lien_he_dai')}>
                            <Input disabled={isView} placeholder={t('nhaCungCapFormModal.vi_du_nguyen_van')} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="soDienThoai" label={t('appLayout.phone')}>
                            <Input disabled={isView} placeholder={t('nhaCungCapFormModal.vi_du_0987654321')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label={t('nhaCungCapFormModal.email_lien_he')}
                            rules={[{ type: 'email', message: t('dangKyPage.email_khong_dung_dinh') }]}
                        >
                            <Input disabled={isView} placeholder={t('nhaCungCapFormModal.vi_du_contactabccom')} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="diaChi" label={t('nhaCungCapFormModal.dia_chi_tru_so')}>
                    <Input disabled={isView} placeholder={t('nhaCungCapFormModal.nhap_dia_chi_nha')} />
                </Form.Item>

                <Form.Item name="ghiChu" label={t('loaiTaiSanFormModal.ghi_chu')}>
                    <Input.TextArea disabled={isView} rows={3} placeholder={t('nhaCungCapFormModal.ghi_chu_them_ve')} />
                </Form.Item>
            </Form>
        </Modal>
    );
};