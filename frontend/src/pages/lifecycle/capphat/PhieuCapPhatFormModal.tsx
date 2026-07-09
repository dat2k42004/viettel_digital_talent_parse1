import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, Card, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { PhieuCapPhatTaiSanResponse } from '../../../api-generated/models/phieuCapPhatTaiSanResponse';
import type { PhieuCapPhatTaiSanRequest } from '../../../api-generated/models/phieuCapPhatTaiSanRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';

// Import các endpoint từ orval
import { laySelectOptions6 as layNguoiDungOptions } from '../../../api-generated/endpoints/nguoi-dung-controller/nguoi-dung-controller';
import { laySelectOptions4 as layPhongBanOptions } from '../../../api-generated/endpoints/phong-ban-controller/phong-ban-controller';
import { laySelectOptions1 as layThietBiPhanCungOptions } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-cung-controller/danh-sach-thiet-bi-phan-cung-controller';
import { laySelectOptions as layThietBiPhanMemOptions } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-mem-controller/danh-sach-thiet-bi-phan-mem-controller';
import { laySelectOptions8 as layThietBiLinhKienOptions } from '../../../api-generated/endpoints/linh-kien-phan-cung-controller/linh-kien-phan-cung-controller';

interface PhieuCapPhatFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: PhieuCapPhatTaiSanResponse | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: PhieuCapPhatTaiSanRequest) => Promise<void>;
    loading: boolean;
}

export const PhieuCapPhatFormModal: React.FC<PhieuCapPhatFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
  const { t } = useTranslation();
    const [form] = Form.useForm<PhieuCapPhatTaiSanRequest>();
    const isView = mode === 'view';

    const [nguoiDungOptions, setNguoiDungOptions] = useState<SelectOption[]>([]);
    const [phongBanOptions, setPhongBanOptions] = useState<SelectOption[]>([]);
    const [thietBiPhanCungOptions, setThietBiPhanCungOptions] = useState<SelectOption[]>([]);
    const [thietBiPhanMemOptions, setThietBiPhanMemOptions] = useState<SelectOption[]>([]);
    const [thietBiLinhKienOptions, setThietBiLinhKienOptions] = useState<SelectOption[]>([]);

    // Theo dõi ID Phòng ban để load danh sách nhân viên tương ứng
    const idPhongBanNhan = Form.useWatch('idPhongBanNhan', form);

    useEffect(() => {
        if (open) {
            // Lấy danh sách Select Option chung
            Promise.all([
                layPhongBanOptions(),
                layThietBiPhanCungOptions(),
                layThietBiPhanMemOptions(),
                layThietBiLinhKienOptions(),
            ])
                .then(([depRes, pcRes, pmRes, lkRes]) => {
                    if (depRes.data) setPhongBanOptions(depRes.data);
                    if (pcRes.data) setThietBiPhanCungOptions(pcRes.data);
                    if (pmRes.data) setThietBiPhanMemOptions(pmRes.data);
                    if (lkRes.data) setThietBiLinhKienOptions(lkRes.data);
                })
                .catch(() => { });

            if (selectedRecord) {
                // FIX: Dùng đúng trường `loai` theo DTO ChiTietCapPhatGeneralResponse
                const danhSachPhanCung = selectedRecord.danhSachTaiSan
                    ?.filter((item: any) => item.loai === 'PHAN_CUNG')
                    .map((item: any) => ({
                        danhSachThietBiPhanCungId: item.idTaiSan,
                        tinhTrangLucGiao: item.tinhTrangLucGiao,
                        phuKienKemTheo: item.phuKienKemTheo,
                        ghiChu: item.ghiChu,
                    })) || [];

                const danhSachPhanMem = selectedRecord.danhSachTaiSan
                    ?.filter((item: any) => item.loai === 'PHAN_MEM')
                    .map((item: any) => ({
                        danhSachThietBiPhanMemId: item.idTaiSan,
                        maKeyKichHoat: item.maTheTaiSan, // Key phần mềm được trả về qua trường maTheTaiSan
                        ghiChu: item.ghiChu,
                    })) || [];

                const danhSachLinhKien = selectedRecord.danhSachTaiSan
                    ?.filter((item: any) => item.loai === 'LINH_KIEN')
                    .map((item: any) => ({
                        danhSachLinhKienPhanCungId: item.idTaiSan,
                        tinhTrangLucGiao: item.tinhTrangLucGiao,
                        phuKienKemTheo: item.phuKienKemTheo,
                        ghiChu: item.ghiChu,
                    })) || [];

                // Gán dữ liệu vào Form
                form.setFieldsValue({
                    idPhongBanNhan: selectedRecord.idPhongBanNhan,
                    idNguoiNhan: selectedRecord.idNguoiNhan,
                    mucDichSuDung: selectedRecord.mucDichSuDung,
                    danhSachPhanCung,
                    danhSachPhanMem,
                    danhSachLinhKien,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, selectedRecord, form]);

    // Lắng nghe sự thay đổi của Phòng ban để load danh sách User
    useEffect(() => {
        if (idPhongBanNhan) {
            layNguoiDungOptions({ idPhongBan: idPhongBanNhan })
                .then(res => {
                    if (res.data) setNguoiDungOptions(res.data);
                })
                .catch(() => setNguoiDungOptions([]));
        } else {
            setNguoiDungOptions([]);
        }
    }, [idPhongBanNhan]);

    // Hàm tiện ích: Bổ sung Option bị thiếu (Trường hợp tài sản đã cấp phát, không còn trong list select-options)
    const getOptionsWithFallback = (baseOptions: SelectOption[], type: 'PHAN_CUNG' | 'PHAN_MEM' | 'LINH_KIEN') => {
        const merged = [...baseOptions];
        if (selectedRecord && selectedRecord.danhSachTaiSan) {
            const itemsInRecord = selectedRecord.danhSachTaiSan.filter((i: any) => i.loai === type);
            itemsInRecord.forEach((item: any) => {
                if (item.idTaiSan && !merged.some(opt => opt.id === item.idTaiSan)) {
                    const labelDisplay = item.tenTaiSan
                        ? `${item.maTheTaiSan || item.soSerial || ''} - ${item.tenTaiSan}`
                        : `ID: ${item.idTaiSan}`;
                    merged.push({ id: item.idTaiSan, ten: labelDisplay });
                }
            });
        }
        return merged.map(opt => ({ value: opt.id, label: opt.ten }));
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                danhSachPhanCung: values.danhSachPhanCung || [],
                danhSachPhanMem: values.danhSachPhanMem || [],
                danhSachLinhKien: values.danhSachLinhKien || [],
            };
            await onSave(payload as any);
        } catch (e) {
            // Lỗi validate form
        }
    };

    const getTitle = () => {
        if (isView) return t('phieuCapPhatFormModal.chi_tiet_phieu_cap');
        return selectedRecord ? t('phieuCapPhatFormModal.cap_nhat_phieu_cap') : t('phieuCapPhatFormModal.lap_phieu_cap_phat');
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
                        {selectedRecord ? t('phieuNhapTaiSanFormModal.luu_cap_nhat') : t('phieuThuHoiFormModal.tao_phieu')}
                    </Button>
                ]
            }
            width={1050}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Divider orientation={'left' as any}>{t('donHangMuaSamFormModal.thong_tin_chung')}</Divider>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="idPhongBanNhan" label={t('phieuDieuChuyenFormModal.phong_ban_tiep_nhan')} rules={[{ required: true, message: t('phieuCapPhatFormModal.vui_long_chon_phong_ban') }]}>
                            <Select
                                disabled={isView}
                                placeholder={t('phieuThuHoiFormModal.chon_phong_ban')}
                                showSearch
                                optionFilterProp="label"
                                options={phongBanOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                onChange={() => {
                                    form.setFieldValue('idNguoiNhan', undefined);
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="idNguoiNhan" label={t('phieuDieuChuyenFormModal.nhan_vien_tiep_nhan')} rules={[{ required: true, message: t('phieuCapPhatFormModal.vui_long_chon_nguoi') }]}>
                            <Select
                                disabled={isView || !idPhongBanNhan}
                                placeholder={idPhongBanNhan ? t('phieuThuHoiFormModal.chon_nhan_su') : t('phieuThuHoiFormModal.vui_long_chon_phong')}
                                showSearch
                                optionFilterProp="label"
                                options={nguoiDungOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="mucDichSuDung" label={t('phieuCapPhatFormModal.muc_dich_su_dung')} rules={[{ required: true, message: t('phieuCapPhatFormModal.nhap_muc_dich_su') }]}>
                    <Input.TextArea disabled={isView} rows={2} placeholder={t('phieuCapPhatFormModal.nhap_ly_domuc_dich')} />
                </Form.Item>

                {/* 1. MẢNG CẤP PHÁT THIẾT BỊ PHẦN CỨNG */}
                <Divider orientation={'left' as any}>{t('phieuCapPhatFormModal.danh_sach_cap_phat_thiet')}</Divider>
                <Form.List name="danhSachPhanCung">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={8}>
                                            <Form.Item {...restField} name={[name, 'danhSachThietBiPhanCungId']} label={t('phieuSuaChuaFormModal.thiet_bi_phan_cung')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_thiet_bi') }]}>
                                                <Select disabled={isView} showSearch optionFilterProp="label" placeholder={t('phieuCapPhatFormModal.tim_theo_ma_the')} options={getOptionsWithFallback(thietBiPhanCungOptions, 'PHAN_CUNG')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'tinhTrangLucGiao']} label={t('phieuCapPhatFormModal.tinh_trang_luc_giao')} rules={[{ required: true, message: t('phieuSuaChuaFormModal.nhap_tinh_trang') }]}>
                                                <Input disabled={isView} placeholder={t('phieuCapPhatFormModal.vi_du_moi_100_xuoc_nhe')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'phuKienKemTheo']} label={t('phieuCapPhatFormModal.phu_kien_kem_theo')}>
                                                <Input disabled={isView} placeholder={t('phieuThuHoiFormModal.sac_chuot')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label={t('loaiTaiSanFormModal.ghi_chu')}>
                                                <Input disabled={isView} placeholder={t('phieuThuHoiFormModal.nhap_chu_thich')} />
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
                                        Thêm thiết bị phần cứng
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 2. MẢNG CẤP PHÁT BẢN QUYỀN PHẦN MỀM */}
                <Divider orientation={'left' as any}>{t('phieuCapPhatFormModal.danh_sach_cap_phat_ban')}</Divider>
                <Form.List name="danhSachPhanMem">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={9}>
                                            <Form.Item {...restField} name={[name, 'danhSachThietBiPhanMemId']} label={t('phieuThanhLyFormModal.ban_quyen_phan_mem')} rules={[{ required: true, message: t('donHangMuaSamFormModal.chon_phan_mem') }]}>
                                                <Select disabled={isView} showSearch optionFilterProp="label" placeholder={t('phieuCapPhatFormModal.tim_keyphan_mem')} options={getOptionsWithFallback(thietBiPhanMemOptions, 'PHAN_MEM')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'maKeyKichHoat']} label={t('phieuCapPhatFormModal.ma_kich_hoat_gui')}>
                                                <Input disabled={isView} placeholder={t('phieuCapPhatFormModal.key_tai_khoan_dang')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label={t('loaiTaiSanFormModal.ghi_chu')}>
                                                <Input disabled={isView} placeholder={t('phieuCapPhatFormModal.chu_thich_cai_dat')} />
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
                                        Thêm bản quyền phần mềm
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 3. MẢNG CẤP PHÁT LINH KIÊN PHẦN CỨNG */}
                <Divider orientation={'left' as any}>{t('phieuCapPhatFormModal.danh_sach_cap_phat')}</Divider>
                <Form.List name="danhSachLinhKien">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={8}>
                                            <Form.Item {...restField} name={[name, 'danhSachLinhKienPhanCungId']} label={t('phieuCapPhatFormModal.linh_kien_phan_cung')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_linh_kien') }]}>
                                                <Select disabled={isView} showSearch optionFilterProp="label" placeholder={t('phieuCapPhatFormModal.tim_kiem_serial_linh')} options={getOptionsWithFallback(thietBiLinhKienOptions, 'LINH_KIEN')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'tinhTrangLucGiao']} label={t('phieuCapPhatFormModal.tinh_trang_luc_giao')} rules={[{ required: true, message: t('phieuSuaChuaFormModal.nhap_tinh_trang') }]}>
                                                <Input disabled={isView} placeholder={t('phieuCapPhatFormModal.vi_du_moi_100')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'phuKienKemTheo']} label={t('phieuCapPhatFormModal.phu_kien_kem_theo')}>
                                                <Input disabled={isView} placeholder={t('phieuThuHoiFormModal.cap_vo_hop')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label={t('loaiTaiSanFormModal.ghi_chu')}>
                                                <Input disabled={isView} placeholder={t('phieuThuHoiFormModal.nhap_chu_thich')} />
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
                                        Thêm linh kiện rời
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