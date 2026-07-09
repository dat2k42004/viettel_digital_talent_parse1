import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, DatePicker, InputNumber, Space, Card, Divider, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { KeHoachBaoTriDinhKyResponse } from '../../../api-generated/models/keHoachBaoTriDinhKyResponse';
import type { KeHoachBaoTriDinhKyRequest } from '../../../api-generated/models/keHoachBaoTriDinhKyRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import { laySelectOptions3 as layPhanCungOptions } from '../../../api-generated/endpoints/tai-san-phan-cung-controller/tai-san-phan-cung-controller';

const { Text } = Typography;

interface KeHoachBaoTriFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: KeHoachBaoTriDinhKyResponse | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: KeHoachBaoTriDinhKyRequest) => Promise<void>;
    loading: boolean;
}

export const KeHoachBaoTriFormModal: React.FC<KeHoachBaoTriFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
  const { t } = useTranslation();
    const [form] = Form.useForm<KeHoachBaoTriDinhKyRequest>();
    const isView = mode === 'view';
    const [phanCungOptions, setPhanCungOptions] = useState<SelectOption[]>([]);

    useEffect(() => {
        if (open) {
            layPhanCungOptions()
                .then(res => {
                    if (res.data) setPhanCungOptions(res.data);
                })
                .catch(() => { });

            if (selectedRecord) {
                const danhSachChiTiet = selectedRecord.chiTietPhanVi?.map(item => ({
                    idTaiSanPhanCung: item.idTaiSanPhanCung,
                })) || [];

                form.setFieldsValue({
                    tenKeHoach: selectedRecord.tenKeHoach,
                    chuKyLap: selectedRecord.chuKyLap,
                    thoiGianBatDauKeHoach: selectedRecord.thoiGianBatDauKeHoach ? dayjs(selectedRecord.thoiGianBatDauKeHoach) as any : undefined,
                    thoiGianKetThucKeHoach: selectedRecord.thoiGianKetThucKeHoach ? dayjs(selectedRecord.thoiGianKetThucKeHoach) as any : undefined,
                    chiPhiDuKien: selectedRecord.chiPhiDuKien as any,
                    noiDungBaoTri: selectedRecord.noiDungBaoTri,
                    danhSachChiTiet: danhSachChiTiet,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, selectedRecord, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                thoiGianBatDauKeHoach: values.thoiGianBatDauKeHoach ? dayjs(values.thoiGianBatDauKeHoach).format('YYYY-MM-DD') : undefined,
                thoiGianKetThucKeHoach: values.thoiGianKetThucKeHoach ? dayjs(values.thoiGianKetThucKeHoach).format('YYYY-MM-DD') : undefined,
            };
            await onSave(payload as any);
        } catch (e) {
            // validation failed
        }
    };

    const getTitle = () => {
        if (isView) return t('keHoachBaoTriFormModal.chi_tiet_ke_hoach');
        return selectedRecord ? t('keHoachBaoTriFormModal.cap_nhat_ke_hoach') : t('keHoachBaoTriFormModal.lap_ke_hoach_bao');
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
                        {selectedRecord ? t('phieuNhapTaiSanFormModal.luu_cap_nhat') : t('keHoachBaoTriFormModal.tao_ke_hoach')}
                    </Button>
                ]
            }
            width={800}
            style={{ top: 40 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Divider orientation={'left' as any}>{t('keHoachBaoTriFormModal.thong_tin_chung_ke')}</Divider>
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item
                            name="tenKeHoach"
                            label={t('keHoachBaoTriFormModal.ten_ke_hoach_bao')}
                            rules={[{ required: true, message: t('keHoachBaoTriFormModal.vui_long_nhap_ten') }]}
                        >
                            <Input disabled={isView} placeholder={t('keHoachBaoTriFormModal.vi_du_ke_hoach')} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="chuKyLap"
                            label={t('keHoachBaoTriFormModal.chu_ky_lap')}
                            rules={[{ required: true, message: t('keHoachBaoTriFormModal.vui_long_chon_chu') }]}
                        >
                            <Select disabled={isView} placeholder={t('keHoachBaoTriFormModal.chon_chu_ky')}>
                                <Select.Option value="HANG_TUAN">{t('keHoachBaoTriPage.hang_tuan')}</Select.Option>
                                <Select.Option value="HANG_THANG">{t('keHoachBaoTriPage.hang_thang')}</Select.Option>
                                <Select.Option value="HANG_QUY">{t('keHoachBaoTriPage.hang_quy')}</Select.Option>
                                <Select.Option value="HANG_NAM">{t('keHoachBaoTriPage.hang_nam')}</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="thoiGianBatDauKeHoach"
                            label={t('keHoachBaoTriFormModal.ngay_bat_dau_ke')}
                            rules={[{ required: true, message: t('phieuSuaChuaFormModal.vui_long_chon_ngay') }]}
                        >
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="thoiGianKetThucKeHoach"
                            label={t('keHoachBaoTriFormModal.ngay_ket_thuc_ke')}
                            rules={[{ required: true, message: t('keHoachBaoTriFormModal.vui_long_chon_ngay') }]}
                        >
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="chiPhiDuKien" label={t('keHoachBaoTriFormModal.chi_phi_du_kien')}>
                            <InputNumber disabled={isView} style={{ width: '100%' }} min={0} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Col>
                </Row>

                {selectedRecord?.lyDoTuChoi && (
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label={t('keHoachBaoTriFormModal.ly_do_bi_tu')}>
                                <Input.TextArea disabled value={selectedRecord.lyDoTuChoi} autoSize={{ minRows: 2 }} style={{ color: 'red' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                )}

                <Form.Item name="noiDungBaoTri" label={t('keHoachBaoTriFormModal.noi_dung_bao_tri')}>
                    <Input.TextArea disabled={isView} rows={3} placeholder={t('keHoachBaoTriFormModal.noi_dung_chi_tiet')} />
                </Form.Item>

                <Divider orientation={'left' as any}>{t('keHoachBaoTriFormModal.mau_tai_san_phan')}</Divider>
                <Form.List name="danhSachChiTiet" rules={[{
                    validator: async (_, names) => {
                        if (!names || names.length < 1) {
                            return Promise.reject(new Error(t('keHoachBaoTriFormModal.ke_hoach_bao_tri')));
                        }
                    }
                }]}>
                    {(fields, { add, remove }, { errors }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 8 }}>
                                    <Row gutter={16} align="middle">
                                        <Col span={22}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'idTaiSanPhanCung']}
                                                label={t('keHoachBaoTriFormModal.mau_ma_phan_cung')}
                                                rules={[{ required: true, message: t('keHoachBaoTriFormModal.vui_long_chon_mau') }]}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    placeholder={t('keHoachBaoTriFormModal.chon_mau_tai_san')}
                                                    optionFilterProp="label"
                                                    options={phanCungOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        {!isView && (
                                            <Col span={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
                                                <MinusCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm mẫu mã tài sản áp dụng
                                    </Button>
                                    <Form.ErrorList errors={errors} />
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
};
