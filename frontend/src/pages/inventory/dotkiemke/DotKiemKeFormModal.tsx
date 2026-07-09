import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { DotKiemKeResponse } from '../../../api-generated/models/dotKiemKeResponse';
import type { DotKiemKeRequest } from '../../../api-generated/models/dotKiemKeRequest';

interface DotKiemKeFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: DotKiemKeResponse | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: DotKiemKeRequest) => Promise<void>;
    loading: boolean;
}

export const DotKiemKeFormModal: React.FC<DotKiemKeFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
  const { t } = useTranslation();
    const [form] = Form.useForm<DotKiemKeRequest>();
    const isView = mode === 'view';

    useEffect(() => {
        if (open) {
            if (selectedRecord) {
                form.setFieldsValue({
                    tenDotKiemKe: selectedRecord.tenDotKiemKe,
                    thoiGianBatDauDuKien: selectedRecord.thoiGianBatDauDuKien ? dayjs(selectedRecord.thoiGianBatDauDuKien) as any : undefined,
                    thoiGianKetThucDuKien: selectedRecord.thoiGianKetThucDuKien ? dayjs(selectedRecord.thoiGianKetThucDuKien) as any : undefined,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, selectedRecord, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload: DotKiemKeRequest = {
                tenDotKiemKe: values.tenDotKiemKe,
                thoiGianBatDauDuKien: values.thoiGianBatDauDuKien ? dayjs(values.thoiGianBatDauDuKien).format('YYYY-MM-DD[T]00:00:00') : '',
                thoiGianKetThucDuKien: values.thoiGianKetThucDuKien ? dayjs(values.thoiGianKetThucDuKien).format('YYYY-MM-DD[T]00:00:00') : '',
            };
            await onSave(payload);
        } catch (e) {
            // form validation failed
        }
    };

    const getTitle = () => {
        if (isView) return t('dotKiemKeFormModal.chi_tiet_dot_kiem');
        return selectedRecord ? t('dotKiemKeFormModal.cap_nhat_dot_kiem') : t('dotKiemKeFormModal.tao_dot_kiem_ke_tai_san_moi');
    };

    return (
        <Modal
            title={getTitle()}
            open={open}
            onCancel={onCancel}
            confirmLoading={loading}
            footer={
                isView ? [
                    <Button key="close" onClick={onCancel}>{t('phieuNhapTaiSanFormModal.dong')}</Button>
                ] : [
                    <Button key="cancel" onClick={onCancel} disabled={loading}>{t('appLayout.cancel')}</Button>,
                    <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
                        {selectedRecord ? t('phieuNhapTaiSanFormModal.luu_cap_nhat') : t('dotKiemKeFormModal.tao_dot_kiem_ke')}
                    </Button>
                ]
            }
            width={600}
            style={{ top: 80 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item
                    name="tenDotKiemKe"
                    label={t('phieuKiemKePage.ten_dot_kiem_ke')}
                    rules={[{ required: true, message: t('dotKiemKeFormModal.vui_long_nhap_ten') }]}
                >
                    <Input disabled={isView} placeholder={t('dotKiemKeFormModal.vi_du_dot_kiem')} />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="thoiGianBatDauDuKien"
                            label={t('dotKiemKeFormModal.thoi_gian_bat_dau')}
                            rules={[{ required: true, message: t('phieuSuaChuaFormModal.vui_long_chon_ngay') }]}
                        >
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="thoiGianKetThucDuKien"
                            label={t('dotKiemKeFormModal.thoi_gian_ket_thuc')}
                            rules={[{ required: true, message: t('keHoachBaoTriFormModal.vui_long_chon_ngay') }]}
                        >
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};
