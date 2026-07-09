import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, DatePicker, InputNumber, Card, Divider, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { PhieuNhapTaiSanResponse } from '../../../api-generated/models/phieuNhapTaiSanResponse';
import type { PhieuNhapTaiSanRequest } from '../../../api-generated/models/phieuNhapTaiSanRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';

// TODO: Đổi tên import khớp với hàm Orval sinh ra
import { laySelectOptions10 as layDonHangOptions, layTheoId22 as layDonHangChiTiet } from '../../../api-generated/endpoints/don-hang-mua-sam-controller/don-hang-mua-sam-controller';
import { laySelectOptions3 as layPhanCungOptions } from '../../../api-generated/endpoints/tai-san-phan-cung-controller/tai-san-phan-cung-controller';
import { laySelectOptions2 as layPhanMemOptions } from '../../../api-generated/endpoints/tai-san-phan-mem-controller/tai-san-phan-mem-controller';
import { laySelectOptions1 as layThietBiPhanCungOptions } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-cung-controller/danh-sach-thiet-bi-phan-cung-controller';
import { laySelectOptions as layThietBiPhanMemOptions } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-mem-controller/danh-sach-thiet-bi-phan-mem-controller';
import { laySelectOptions8 as layThietBiLinhKienOptions } from '../../../api-generated/endpoints/linh-kien-phan-cung-controller/linh-kien-phan-cung-controller';
import type { ChiTietDonHangGeneralResponse } from '../../../api-generated/models/chiTietDonHangGeneralResponse';

interface PhieuNhapTaiSanFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: PhieuNhapTaiSanResponse | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: PhieuNhapTaiSanRequest) => Promise<void>;
    loading: boolean;
}

export const PhieuNhapTaiSanFormModal: React.FC<PhieuNhapTaiSanFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
  const { t } = useTranslation();
    const [form] = Form.useForm<PhieuNhapTaiSanRequest>();
    const isView = mode === 'view';

    const [donHangOptions, setDonHangOptions] = useState<SelectOption[]>([]);
    const [phanCungOptions, setPhanCungOptions] = useState<SelectOption[]>([]);
    const [phanMemOptions, setPhanMemOptions] = useState<SelectOption[]>([]);
    const [thietBiPhanCungOptions, setThietBiPhanCungOptions] = useState<SelectOption[]>([]);
    const [thietBiPhanMemOptions, setThietBiPhanMemOptions] = useState<SelectOption[]>([]);
    const [thietBiLinhKienOptions, setThietBiLinhKienOptions] = useState<SelectOption[]>([]);
    const [selectedPODetails, setSelectedPODetails] = useState<ChiTietDonHangGeneralResponse[]>([]);

    const idDonHangMuaSam = Form.useWatch('idDonHangMuaSam', form);

    useEffect(() => {
        if (idDonHangMuaSam) {
            layDonHangChiTiet(idDonHangMuaSam)
                .then(res => {
                    if (res?.data?.chiTietTaiSan) {
                        setSelectedPODetails(res.data.chiTietTaiSan);
                    } else {
                        setSelectedPODetails([]);
                    }
                })
                .catch(() => {
                    setSelectedPODetails([]);
                });
        } else {
            setSelectedPODetails([]);
        }
    }, [idDonHangMuaSam]);

    const getPCSelectorOptions = (currentValId?: number) => {
        if (!currentValId) return thietBiPhanCungOptions;
        if (thietBiPhanCungOptions.some(opt => opt.id === currentValId)) return thietBiPhanCungOptions;
        const matchedItem = selectedRecord?.chiTietTaiSan?.find(item => item.idThietBi === currentValId && item.loai === 'PHAN_CUNG');
        const label = matchedItem ? t('phieuNhapTaiSanFormModal.thiet_bi_matcheditem_tentaisan', { tenTaiSan: matchedItem.tenTaiSan }) : `ID: ${currentValId}`;
        return [...thietBiPhanCungOptions, { id: currentValId, ten: label }];
    };

    const getPMSelectorOptions = (currentValId?: number) => {
        if (!currentValId) return thietBiPhanMemOptions;
        if (thietBiPhanMemOptions.some(opt => opt.id === currentValId)) return thietBiPhanMemOptions;
        const matchedItem = selectedRecord?.chiTietTaiSan?.find(item => item.idThietBi === currentValId && item.loai === 'PHAN_MEM');
        const label = matchedItem ? t('phieuNhapTaiSanFormModal.phan_mem_matcheditem_tentaisan', { tenTaiSan: matchedItem.tenTaiSan }) : `ID: ${currentValId}`;
        return [...thietBiPhanMemOptions, { id: currentValId, ten: label }];
    };

    const getLKSelectorOptions = (currentValId?: number) => {
        if (!currentValId) return thietBiLinhKienOptions;
        if (thietBiLinhKienOptions.some(opt => opt.id === currentValId)) return thietBiLinhKienOptions;
        const matchedItem = selectedRecord?.chiTietTaiSan?.find(item => item.idThietBi === currentValId && item.loai === 'LINH_KIEN');
        const label = matchedItem ? t('phieuNhapTaiSanFormModal.linh_kien_matcheditem_tentaisan', { tenTaiSan: matchedItem.tenTaiSan }) : `ID: ${currentValId}`;
        return [...thietBiLinhKienOptions, { id: currentValId, ten: label }];
    };

    const getPODetailOptions = (loai: 'PHAN_CUNG' | 'PHAN_MEM' | 'LINH_KIEN', selectedAssetId?: number) => {
        if (!selectedAssetId) return [];
        return selectedPODetails
            .filter(item => item.loai === loai && item.idTaiSan === selectedAssetId)
            .map(item => ({
                value: item.id,
                label: t('phieuNhapTaiSanFormModal.dong_item_id_item_tentaisan', { id: item.id, tenTaiSan: item.tenTaiSan, soLuongDaNhap: item.soLuongDaNhap, soLuongDat: item.soLuongDat })
            }));
    };

    const getPCDetailOptionsWithFallback = (nameKey: number) => {
        const selectedAssetId = form.getFieldValue(['chiTietPhanCung', nameKey, 'idTaiSanPhanCung']);
        const currentValId = form.getFieldValue(['chiTietPhanCung', nameKey, 'idChiTietDonHangPhanCung']);

        const options = getPODetailOptions('PHAN_CUNG', selectedAssetId);

        if (currentValId && !options.some(opt => opt.value === currentValId)) {
            const matchedItem = selectedRecord?.chiTietTaiSan?.find(item => item.idChiTietDonHang === currentValId && item.loai === 'PHAN_CUNG');
            const label = matchedItem ? t('phieuNhapTaiSanFormModal.dong_currentvalid_matcheditem_tentaisan_da', { currentValId: currentValId, tenTaiSan: matchedItem.tenTaiSan }) : t('phieuNhapTaiSanFormModal.dong_id_currentvalid', { currentValId: currentValId });
            options.push({ value: currentValId, label });
        }
        return options;
    };

    const getPMDetailOptionsWithFallback = (nameKey: number) => {
        const selectedAssetId = form.getFieldValue(['chiTietPhanMem', nameKey, 'idTaiSanPhanMem']);
        const currentValId = form.getFieldValue(['chiTietPhanMem', nameKey, 'idChiTietDonHangPhanMem']);

        const options = getPODetailOptions('PHAN_MEM', selectedAssetId);

        if (currentValId && !options.some(opt => opt.value === currentValId)) {
            const matchedItem = selectedRecord?.chiTietTaiSan?.find(item => item.idChiTietDonHang === currentValId && item.loai === 'PHAN_MEM');
            const label = matchedItem ? t('phieuNhapTaiSanFormModal.dong_currentvalid_matcheditem_tentaisan_da', { currentValId: currentValId, tenTaiSan: matchedItem.tenTaiSan }) : t('phieuNhapTaiSanFormModal.dong_id_currentvalid', { currentValId: currentValId });
            options.push({ value: currentValId, label });
        }
        return options;
    };

    const getLKDetailOptionsWithFallback = (nameKey: number) => {
        const selectedAssetId = form.getFieldValue(['chiTietLinhKien', nameKey, 'idTaiSanPhanCung']);
        const currentValId = form.getFieldValue(['chiTietLinhKien', nameKey, 'idChiTietDonHangPhanCung']);

        const options = getPODetailOptions('PHAN_CUNG', selectedAssetId);

        if (currentValId && !options.some(opt => opt.value === currentValId)) {
            const matchedItem = selectedRecord?.chiTietTaiSan?.find(item => item.idChiTietDonHang === currentValId && item.loai === 'LINH_KIEN');
            const label = matchedItem ? t('phieuNhapTaiSanFormModal.dong_currentvalid_matcheditem_tentaisan_da', { currentValId: currentValId, tenTaiSan: matchedItem.tenTaiSan }) : t('phieuNhapTaiSanFormModal.dong_id_currentvalid', { currentValId: currentValId });
            options.push({ value: currentValId, label });
        }
        return options;
    };

    useEffect(() => {
        if (open) {
            // Gọi API lấy danh sách tham chiếu
            Promise.all([
                layDonHangOptions(),
                layPhanCungOptions(),
                layPhanMemOptions(),
                layThietBiPhanCungOptions(),
                layThietBiPhanMemOptions(),
                layThietBiLinhKienOptions()
            ])
                .then(([dhRes, pcRes, pmRes, tbPcRes, tbPmRes, tbLkRes]) => {
                    if (dhRes.data) setDonHangOptions(dhRes.data);
                    if (pcRes.data) setPhanCungOptions(pcRes.data);
                    if (pmRes.data) setPhanMemOptions(pmRes.data);
                    if (tbPcRes.data) setThietBiPhanCungOptions(tbPcRes.data);
                    if (tbPmRes.data) setThietBiPhanMemOptions(tbPmRes.data);
                    if (tbLkRes.data) setThietBiLinhKienOptions(tbLkRes.data);
                })
                .catch(() => { });

            if (selectedRecord) {
                // Phân tách mảng chiTietTaiSan phẳng thành 3 mảng riêng biệt cho 3 Form.List
                const chiTietPhanCung = selectedRecord.chiTietTaiSan
                    ?.filter(item => item.loai === 'PHAN_CUNG')
                    .map(item => ({
                        idTaiSanPhanCung: item.idTaiSan,
                        idDanhSachThietBiPhanCung: item.idThietBi,
                        idChiTietDonHangPhanCung: item.idChiTietDonHang,
                        giaNhapThuTe: item.giaNhapThucTe,
                        tinhTrangLucNhap: item.tinhTrangLucNhap,
                    })) || [];

                const chiTietPhanMem = selectedRecord.chiTietTaiSan
                    ?.filter(item => item.loai === 'PHAN_MEM')
                    .map(item => ({
                        idTaiSanPhanMem: item.idTaiSan,
                        idDanhSachThietBiPhanMem: item.idThietBi,
                        idChiTietDonHangPhanMem: item.idChiTietDonHang,
                        soLuongGheNhap: item.soLuongGheNhap,
                        giaNhapThucTe: item.giaNhapThucTe,
                    })) || [];

                const chiTietLinhKien = selectedRecord.chiTietTaiSan
                    ?.filter(item => item.loai === 'LINH_KIEN')
                    .map(item => ({
                        idTaiSanPhanCung: item.idTaiSan,
                        idLinhKienPhanCung: item.idThietBi,
                        idChiTietDonHangPhanCung: item.idChiTietDonHang,
                        giaNhapThucTe: item.giaNhapThucTe,
                        tinhTrangLucNhap: item.tinhTrangLucNhap,
                    })) || [];

                form.setFieldsValue({
                    idDonHangMuaSam: selectedRecord.idDonHangMuaSam,
                    maPhieuNhap: selectedRecord.maPhieuNhap,
                    soHoaDonVat: selectedRecord.soHoaDonVat,
                    maBienBanGiaoHang: selectedRecord.maBienBanGiaoHang,
                    thoiGianNhapKho: selectedRecord.thoiGianNhapKho ? dayjs(selectedRecord.thoiGianNhapKho) as any : undefined,
                    ghiChu: selectedRecord.ghiChu,
                    chiTietPhanCung,
                    chiTietPhanMem,
                    chiTietLinhKien,
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
                thoiGianNhapKho: values.thoiGianNhapKho ? dayjs(values.thoiGianNhapKho).format('YYYY-MM-DDTHH:mm:ss') : undefined,
            };
            await onSave(payload as any);
        } catch (e) {
            // Bắt lỗi validate form
        }
    };

    const getTitle = () => {
        if (isView) return t('phieuNhapTaiSanFormModal.chi_tiet_phieu_nhap');
        return selectedRecord ? t('phieuNhapTaiSanFormModal.cap_nhat_phieu_nhap') : t('phieuNhapTaiSanFormModal.lap_phieu_nhap_tai');
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
                        {selectedRecord ? t('phieuNhapTaiSanFormModal.luu_cap_nhat') : t('phieuNhapTaiSanFormModal.tao_phieu_nhap')}
                    </Button>
                ]
            }
            width={1100}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Divider orientation={"left" as any}>{t('phieuNhapTaiSanFormModal.thong_tin_chung_tu')}</Divider>

                <Row gutter={16}>
                    {selectedRecord && (
                        <Col span={8}>
                            <Form.Item name="maPhieuNhap" label={t('phieuNhapTaiSanFormModal.ma_phieu_nhap')}>
                                <Input disabled placeholder={t('phieuNhapTaiSanFormModal.ma_tu_dong_sinh')} />
                            </Form.Item>
                        </Col>
                    )}
                    <Col span={selectedRecord ? 16 : 24}>
                        <Form.Item
                            name="idDonHangMuaSam"
                            label={t('phieuNhapTaiSanFormModal.don_hang_mua_sam')}
                            rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.vui_long_chon_don') }]}
                        >
                            <Select
                                disabled={isView}
                                placeholder={t('phieuNhapTaiSanFormModal.chon_don_hang_po')}
                                showSearch
                                optionFilterProp="label"
                                options={donHangOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="soHoaDonVat" label={t('phieuNhapTaiSanFormModal.so_hoa_don_vat')}>
                            <Input disabled={isView} placeholder={t('phieuNhapTaiSanFormModal.nhap_so_hoa_don')} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="maBienBanGiaoHang" label={t('phieuNhapTaiSanFormModal.ma_bien_ban_giao')}>
                            <Input disabled={isView} placeholder={t('phieuNhapTaiSanFormModal.ma_bien_ban_neu')} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="thoiGianNhapKho" label={t('phieuNhapTaiSanFormModal.thoi_gian_thuc_nhap')}>
                            <DatePicker disabled={isView} style={{ width: '100%' }} showTime format="DD/MM/YYYY HH:mm" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="ghiChu" label={t('loaiTaiSanFormModal.ghi_chu')}>
                    <Input.TextArea disabled={isView} rows={2} placeholder={t('phieuNhapTaiSanFormModal.ghi_chu_dot_nhap')} />
                </Form.Item>

                {/* 1. MẢNG CHI TIẾT THIẾT BỊ PHẦN CỨNG */}
                <Divider orientation={"left" as any}>{t('phieuNhapTaiSanFormModal.danh_sach_thuc_nhan_thiet')}</Divider>
                <Form.List name="chiTietPhanCung">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'idTaiSanPhanCung']} label={t('phieuNhapTaiSanFormModal.mau_phan_cung')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_mau') }]}>
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    options={phanCungOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                    onChange={() => {
                                                        const current = form.getFieldValue(['chiTietPhanCung']) || [];
                                                        const updated = [...current];
                                                        updated[name] = {
                                                            ...updated[name],
                                                            idChiTietDonHangPhanCung: undefined
                                                        };
                                                        form.setFieldsValue({ chiTietPhanCung: updated });
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'idDanhSachThietBiPhanCung']} label={t('phieuNhapTaiSanFormModal.thiet_bi_cu_the')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_thiet_bi') }]}>
                                                <Select disabled={isView} showSearch optionFilterProp="label" options={getPCSelectorOptions(form.getFieldValue(['chiTietPhanCung', name, 'idDanhSachThietBiPhanCung'])).map(opt => ({ value: opt.id, label: opt.ten }))} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'idChiTietDonHangPhanCung']}
                                                label={t('phieuNhapTaiSanFormModal.dong_dat_hang')}
                                                dependencies={[['chiTietPhanCung', name, 'idTaiSanPhanCung']]}
                                                rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_dong_dat_hang') }]}
                                            >
                                                <Select disabled={isView} showSearch optionFilterProp="label" options={getPCDetailOptionsWithFallback(name)} placeholder={t('phieuNhapTaiSanFormModal.chon_dong_po')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item {...restField} name={[name, 'giaNhapThuTe']} label={t('phieuNhapTaiSanFormModal.gia_nhap_vnd')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.nhap_gia') }]}>
                                                <InputNumber disabled={isView} style={{ width: '100%' }} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'tinhTrangLucNhap']} label={t('phieuNhapTaiSanFormModal.tinh_trang')}>
                                                <Input disabled={isView} placeholder={t('phieuNhapTaiSanFormModal.vi_du_moi_100')} />
                                            </Form.Item>
                                        </Col>
                                        {!isView && (
                                            <Col span={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MinusCircleOutlined style={{ color: 'red', fontSize: 18, marginTop: 8, cursor: 'pointer' }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm dòng thiết bị phần cứng
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 2. MẢNG CHI TIẾT BẢN QUYỀN PHẦN MỀM */}
                <Divider orientation={"left" as any}>{t('phieuNhapTaiSanFormModal.danh_sach_thuc_nhan_ban')}</Divider>
                <Form.List name="chiTietPhanMem">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'idTaiSanPhanMem']} label={t('phieuNhapTaiSanFormModal.mau_phan_mem')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_mau') }]}>
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    options={phanMemOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                    onChange={() => {
                                                        const current = form.getFieldValue(['chiTietPhanMem']) || [];
                                                        const updated = [...current];
                                                        updated[name] = {
                                                            ...updated[name],
                                                            idChiTietDonHangPhanMem: undefined
                                                        };
                                                        form.setFieldsValue({ chiTietPhanMem: updated });
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'idDanhSachThietBiPhanMem']} label={t('phieuNhapTaiSanFormModal.key_cu_the')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_key') }]}>
                                                <Select disabled={isView} showSearch optionFilterProp="label" options={getPMSelectorOptions(form.getFieldValue(['chiTietPhanMem', name, 'idDanhSachThietBiPhanMem'])).map(opt => ({ value: opt.id, label: opt.ten }))} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'idChiTietDonHangPhanMem']}
                                                label={t('phieuNhapTaiSanFormModal.dong_dat_hang')}
                                                dependencies={[['chiTietPhanMem', name, 'idTaiSanPhanMem']]}
                                                rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_dong_dat_hang') }]}
                                            >
                                                <Select disabled={isView} showSearch optionFilterProp="label" options={getPMDetailOptionsWithFallback(name)} placeholder={t('phieuNhapTaiSanFormModal.chon_dong_po')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item {...restField} name={[name, 'soLuongGheNhap']} label={t('phieuNhapTaiSanFormModal.so_luong_seats')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.nhap_so_luong') }]}>
                                                <InputNumber disabled={isView} style={{ width: '100%' }} min={1} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'giaNhapThucTe']} label={t('phieuNhapTaiSanFormModal.gia_nhap_vnd')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.nhap_gia') }]}>
                                                <InputNumber disabled={isView} style={{ width: '100%' }} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                            </Form.Item>
                                        </Col>
                                        {!isView && (
                                            <Col span={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MinusCircleOutlined style={{ color: 'red', fontSize: 18, marginTop: 8, cursor: 'pointer' }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm dòng bản quyền phần mềm
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 3. MẢNG CHI TIẾT LINH KIÊN PHẦN CỨNG */}
                <Divider orientation={"left" as any}>{t('phieuNhapTaiSanFormModal.danh_sach_thuc_nhan')}</Divider>
                <Form.List name="chiTietLinhKien">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'idTaiSanPhanCung']} label={t('phieuNhapTaiSanFormModal.mau_linh_kien')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_mau') }]}>
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    options={phanCungOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                    onChange={() => {
                                                        const current = form.getFieldValue(['chiTietLinhKien']) || [];
                                                        const updated = [...current];
                                                        updated[name] = {
                                                            ...updated[name],
                                                            idChiTietDonHangPhanCung: undefined
                                                        };
                                                        form.setFieldsValue({ chiTietLinhKien: updated });
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'idLinhKienPhanCung']} label={t('phieuNhapTaiSanFormModal.linh_kien_cu_the')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_linh_kien') }]}>
                                                <Select disabled={isView} showSearch optionFilterProp="label" options={getLKSelectorOptions(form.getFieldValue(['chiTietLinhKien', name, 'idLinhKienPhanCung'])).map(opt => ({ value: opt.id, label: opt.ten }))} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'idChiTietDonHangPhanCung']}
                                                label={t('phieuNhapTaiSanFormModal.dong_dat_hang')}
                                                dependencies={[['chiTietLinhKien', name, 'idTaiSanPhanCung']]}
                                                rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_dong_dat_hang') }]}
                                            >
                                                <Select disabled={isView} showSearch optionFilterProp="label" options={getLKDetailOptionsWithFallback(name)} placeholder={t('phieuNhapTaiSanFormModal.chon_dong_po')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item {...restField} name={[name, 'giaNhapThucTe']} label={t('phieuNhapTaiSanFormModal.gia_nhap_vnd')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.nhap_gia') }]}>
                                                <InputNumber disabled={isView} style={{ width: '100%' }} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'tinhTrangLucNhap']} label={t('phieuNhapTaiSanFormModal.tinh_trang')}>
                                                <Input disabled={isView} placeholder={t('phieuNhapTaiSanFormModal.vi_du_moi_100')} />
                                            </Form.Item>
                                        </Col>
                                        {!isView && (
                                            <Col span={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MinusCircleOutlined style={{ color: 'red', fontSize: 18, marginTop: 8, cursor: 'pointer' }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm dòng linh kiện rời
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