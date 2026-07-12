import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, DatePicker, InputNumber, Card, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { DonHangMuaSamResponse } from '../../../api-generated/models/donHangMuaSamResponse';
import type { DonHangMuaSamRequest } from '../../../api-generated/models/donHangMuaSamRequest';

import { laySelectOptions5 as layNccOptions } from '../../../api-generated/endpoints/nha-cung-cap-controller/nha-cung-cap-controller';
import { laySelectOptions3 as layPhanCungOptions } from '../../../api-generated/endpoints/tai-san-phan-cung-controller/tai-san-phan-cung-controller';
import { laySelectOptions2 as layPhanMemOptions } from '../../../api-generated/endpoints/tai-san-phan-mem-controller/tai-san-phan-mem-controller';
import { useSearchableSelect } from '../../../hooks/useSearchableSelect';

interface DonHangMuaSamFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: DonHangMuaSamResponse | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: DonHangMuaSamRequest) => Promise<void>;
    loading: boolean;
}

export const DonHangMuaSamFormModal: React.FC<DonHangMuaSamFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
  const { t } = useTranslation();
    const [form] = Form.useForm<DonHangMuaSamRequest>();
    const isView = mode === 'view';

    const ncc = useSearchableSelect(layNccOptions as any);
    const phanCung = useSearchableSelect(layPhanCungOptions as any);
    const phanMem = useSearchableSelect(layPhanMemOptions as any);

    useEffect(() => {
        if (open) {
            Promise.all([ncc.fetchOptions(), phanCung.fetchOptions(), phanMem.fetchOptions()])
                .catch(() => {
                    // Bỏ qua lỗi hiển thị
                });

            if (selectedRecord) {
                const chiTietPhanCung = selectedRecord.chiTietTaiSan
                    ?.filter(item => item.loai === 'PHAN_CUNG')
                    .map(item => ({
                        idTaiSanPhanCung: item.idTaiSan,
                        soLuongDat: item.soLuongDat,
                        donGiaDat: item.donGiaDat,
                        ghiChu: item.ghiChu,
                    })) || [];

                const chiTietPhanMem = selectedRecord.chiTietTaiSan
                    ?.filter(item => item.loai === 'PHAN_MEM')
                    .map(item => ({
                        idTaiSanPhanMem: item.idTaiSan,
                        soLuongDat: item.soLuongDat,
                        donGiaDat: item.donGiaDat,
                        ghiChu: item.ghiChu,
                    })) || [];

                form.setFieldsValue({
                    idNhaCungCap: selectedRecord.idNhaCungCap,
                    maDonHang: selectedRecord.maDonHang,
                    soHopDongDinhKem: selectedRecord.soHopDongDinhKem,
                    tongTienTruocThue: selectedRecord.tongTienTruocThue as any,
                    thueVat: selectedRecord.thueVat as any,
                    tongTienSauThue: selectedRecord.tongTienSauThue as any,
                    thoiGianGiaoDuKien: selectedRecord.thoiGianGiaoDuKien ? dayjs(selectedRecord.thoiGianGiaoDuKien) as any : undefined,
                    ghiChu: selectedRecord.ghiChu,
                    chiTietPhanCung: chiTietPhanCung,
                    chiTietPhanMem: chiTietPhanMem,
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
                thoiGianGiaoDuKien: values.thoiGianGiaoDuKien ? dayjs(values.thoiGianGiaoDuKien).format('YYYY-MM-DD') : undefined,
            };
            await onSave(payload as any);
        } catch (e) {
            // Validate form failed
        }
    };

    const getTitle = () => {
        if (isView) return t('donHangMuaSamFormModal.chi_tiet_don_hang');
        return selectedRecord ? t('donHangMuaSamFormModal.cap_nhat_don_hang') : t('donHangMuaSamFormModal.lap_don_hang_mua');
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
                        {selectedRecord ? t('phieuNhapTaiSanFormModal.luu_cap_nhat') : t('donHangMuaSamFormModal.tao_don_hang')}
                    </Button>
                ]
            }
            width={1000}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Divider orientation={"left" as any}>{t('donHangMuaSamFormModal.thong_tin_chung')}</Divider>
                <Row gutter={16}>
                    {selectedRecord && (
                        <Col span={8}>
                            <Form.Item name="maDonHang" label={t('donHangMuaSamFormModal.ma_don_hang')}>
                                <Input disabled placeholder={t('phieuNhapTaiSanFormModal.ma_tu_dong_sinh')} />
                            </Form.Item>
                        </Col>
                    )}
                    <Col span={selectedRecord ? 16 : 24}>
                        <Form.Item
                            name="idNhaCungCap"
                            label={t('donHangMuaSamPage.nha_cung_cap')}
                            rules={[{ required: true, message: t('donHangMuaSamFormModal.vui_long_chon_nha') }]}
                        >
                            <Select
                                disabled={isView}
                                placeholder={t('donHangMuaSamFormModal.chon_nha_cung_cap')}
                                showSearch
                                filterOption={false}
                                onSearch={ncc.handleSearch}
                                loading={ncc.loading}
                                options={ncc.options.map(opt => ({ value: opt.id, label: opt.ten }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="soHopDongDinhKem" label={t('donHangMuaSamFormModal.so_hop_dong_dinh')}>
                            <Input disabled={isView} placeholder={t('donHangMuaSamFormModal.vi_du_hd2026001')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="thoiGianGiaoDuKien" label={t('donHangMuaSamFormModal.ngay_giao_hang_du')}>
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="tongTienTruocThue" label={t('donHangMuaSamFormModal.tong_tien_truoc_thue')} rules={[{ required: true, message: t('donHangMuaSamFormModal.nhap_so_tien') }]}>
                            <InputNumber disabled={isView} style={{ width: '100%' }} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="thueVat" label={t('donHangMuaSamFormModal.tien_thue_vat_vnd')} rules={[{ required: true, message: t('donHangMuaSamFormModal.nhap_tien_thue') }]}>
                            <InputNumber disabled={isView} style={{ width: '100%' }} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="tongTienSauThue" label={t('donHangMuaSamFormModal.tong_tien_sau_thue')} rules={[{ required: true, message: t('donHangMuaSamFormModal.nhap_tong_tien') }]}>
                            <InputNumber disabled={isView} style={{ width: '100%' }} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="ghiChu" label={t('loaiTaiSanFormModal.ghi_chu')}>
                    <Input.TextArea disabled={isView} rows={2} placeholder={t('donHangMuaSamFormModal.noi_dung_ghi_chu')} />
                </Form.Item>

                <Divider orientation={"left" as any}>{t('donHangMuaSamFormModal.chi_tiet_phan_cung')}</Divider>
                <Form.List name="chiTietPhanCung">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 8 }}>
                                    <Row gutter={16} align="middle">
                                        <Col span={9}>
                                            <Form.Item {...restField} name={[name, 'idTaiSanPhanCung']} label={t('phieuNhapTaiSanFormModal.mau_phan_cung')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_mau') }]}>
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    filterOption={false}
                                                    onSearch={phanCung.handleSearch}
                                                    loading={phanCung.loading}
                                                    options={phanCung.options.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item {...restField} name={[name, 'soLuongDat']} label={t('donHangMuaSamFormModal.so_luong')} rules={[{ required: true, message: t('donHangMuaSamFormModal.nhap_sl') }]}>
                                                <InputNumber disabled={isView} min={1} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'donGiaDat']} label={t('donHangMuaSamFormModal.don_gia')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.nhap_gia') }]}>
                                                <InputNumber disabled={isView} style={{ width: '100%' }} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label={t('loaiTaiSanFormModal.ghi_chu')}>
                                                <Input disabled={isView} />
                                            </Form.Item>
                                        </Col>
                                        {!isView && (
                                            <Col span={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MinusCircleOutlined style={{ color: 'red', fontSize: 18, marginTop: 8 }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm phần cứng vào đơn hàng
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                <Divider orientation={"left" as any}>{t('donHangMuaSamFormModal.chi_tiet_ban_quyen')}</Divider>
                <Form.List name="chiTietPhanMem">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 8 }}>
                                    <Row gutter={16} align="middle">
                                        <Col span={9}>
                                            <Form.Item {...restField} name={[name, 'idTaiSanPhanMem']} label={t('phieuNhapTaiSanFormModal.mau_phan_mem')} rules={[{ required: true, message: t('donHangMuaSamFormModal.chon_phan_mem') }]}>
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    filterOption={false}
                                                    onSearch={phanMem.handleSearch}
                                                    loading={phanMem.loading}
                                                    options={phanMem.options.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item {...restField} name={[name, 'soLuongDat']} label={t('donHangMuaSamFormModal.so_luong')} rules={[{ required: true, message: t('donHangMuaSamFormModal.nhap_sl') }]}>
                                                <InputNumber disabled={isView} min={1} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'donGiaDat']} label={t('donHangMuaSamFormModal.don_gia')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.nhap_gia') }]}>
                                                <InputNumber disabled={isView} style={{ width: '100%' }} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label={t('loaiTaiSanFormModal.ghi_chu')}>
                                                <Input disabled={isView} />
                                            </Form.Item>
                                        </Col>
                                        {!isView && (
                                            <Col span={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MinusCircleOutlined style={{ color: 'red', fontSize: 18, marginTop: 8 }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm phần mềm vào đơn hàng
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

            </Form>
        </Modal>
    );
};