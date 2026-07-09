import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, Card, Divider, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { SelectOption } from '../../../api-generated/models/selectOption';

// API Controllers
import { laySelectOptions6 as layNguoiDungOptions } from '../../../api-generated/endpoints/nguoi-dung-controller/nguoi-dung-controller';
import { laySelectOptions4 as layPhongBanOptions } from '../../../api-generated/endpoints/phong-ban-controller/phong-ban-controller';

// Kế thừa API lấy tài sản đang mượn từ Controller Thu Hồi
import { layAllocationsCuaNhanVien } from '../../../api-generated/endpoints/phieu-thu-hoi-tai-san-controller/phieu-thu-hoi-tai-san-controller';

interface PhieuDieuChuyenFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: any | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: any) => Promise<void>;
    loading: boolean;
}

export const PhieuDieuChuyenFormModal: React.FC<PhieuDieuChuyenFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
  const { t } = useTranslation();
    const [form] = Form.useForm();
    const isView = mode === 'view';

    const [phongBanOptions, setPhongBanOptions] = useState<SelectOption[]>([]);

    // Mảng lưu danh sách người dùng cho 2 vế: Chuyển & Nhận
    const [nguoiChuyenOptions, setNguoiChuyenOptions] = useState<SelectOption[]>([]);
    const [nguoiNhanOptions, setNguoiNhanOptions] = useState<SelectOption[]>([]);

    // State lưu danh sách tài sản BÊN CHUYỂN đang mượn (để điều chuyển đi)
    const [activeHardwareOptions, setActiveHardwareOptions] = useState<any[]>([]);
    // const [activeSoftwareOptions, setActiveSoftwareOptions] = useState<any[]>([]);
    const [activeComponentOptions, setActiveComponentOptions] = useState<any[]>([]);

    const idPhongBanChuyen = Form.useWatch('idPhongBanChuyen', form);
    const idNguoiChuyen = Form.useWatch('idNguoiChuyen', form);
    const idPhongBanNhan = Form.useWatch('idPhongBanNhan', form);

    // 1. Lấy danh sách Phòng ban chung
    useEffect(() => {
        if (open) {
            layPhongBanOptions()
                .then(res => { if (res.data) setPhongBanOptions(res.data); })
                .catch(() => { });

            if (selectedRecord) {
                // Map mảng chiTietTaiSan phẳng sang DTO mảng của Điều chuyển
                // Lưu ý: DTO request mảng của điều chuyển theo chuẩn tài liệu 14.18 là chiTietCapPhatPhanCungId
                const danhSachPhanCung = selectedRecord.chiTietTaiSan
                    ?.filter((item: any) => item.loai === 'PHAN_CUNG')
                    .map((item: any) => ({
                        chiTietCapPhatPhanCungId: item.chiTietCapPhatId,
                        trangThaiXuat: item.trangThaiXuat,
                        ghiChu: item.ghiChu,
                    })) || [];

                const danhSachPhanMem = selectedRecord.chiTietTaiSan
                    ?.filter((item: any) => item.loai === 'PHAN_MEM')
                    .map((item: any) => ({
                        chiTietCapPhatPhanMemId: item.chiTietCapPhatId,
                        ghiChu: item.ghiChu,
                    })) || [];

                const danhSachLinhKien = selectedRecord.chiTietTaiSan
                    ?.filter((item: any) => item.loai === 'LINH_KIEN')
                    .map((item: any) => ({
                        chiTietCapPhatLinhKienId: item.chiTietCapPhatId,
                        trangThaiXuat: item.trangThaiXuat,
                        ghiChu: item.ghiChu,
                    })) || [];

                form.setFieldsValue({
                    idPhongBanChuyen: selectedRecord.idPhongBanChuyen,
                    idNguoiChuyen: selectedRecord.idNguoiChuyen,
                    idPhongBanNhan: selectedRecord.idPhongBanNhan,
                    idNguoiNhan: selectedRecord.idNguoiNhan,
                    lyDoDieuChuyen: selectedRecord.lyDoDieuChuyen,
                    danhSachPhanCung,
                    danhSachPhanMem,
                    danhSachLinhKien,
                });
            } else {
                form.resetFields();
                setActiveHardwareOptions([]);
                // setActiveSoftwareOptions([]);
                setActiveComponentOptions([]);
            }
        }
    }, [open, selectedRecord, form]);

    // 2. Logic cho Bên Giao (Chuyển đi)
    useEffect(() => {
        if (idPhongBanChuyen) {
            layNguoiDungOptions({ idPhongBan: idPhongBanChuyen })
                .then(res => { if (res.data) setNguoiChuyenOptions(res.data); })
                .catch(() => setNguoiChuyenOptions([]));
        } else {
            setNguoiChuyenOptions([]);
        }
    }, [idPhongBanChuyen]);

    useEffect(() => {
        if (idNguoiChuyen) {
            // Tái sử dụng hàm layAllocationsCuaNhanVien của Thu hồi
            layAllocationsCuaNhanVien({ idNhanVien: idNguoiChuyen })
                .then(res => {
                    if (res.code === 200 && res.data) {
                        setActiveHardwareOptions(res.data.danhSachPhanCung || []);
                        // setActiveSoftwareOptions(res.data.danhSachPhanMem || []);
                        setActiveComponentOptions(res.data.danhSachLinhKien || []);
                    }
                })
                .catch(() => {
                    setActiveHardwareOptions([]);
                    // setActiveSoftwareOptions([]);
                    setActiveComponentOptions([]);
                });
        } else {
            setActiveHardwareOptions([]);
            // setActiveSoftwareOptions([]);
            setActiveComponentOptions([]);
        }
    }, [idNguoiChuyen]);

    // 3. Logic cho Bên Nhận
    useEffect(() => {
        if (idPhongBanNhan) {
            layNguoiDungOptions({ idPhongBan: idPhongBanNhan })
                .then(res => { if (res.data) setNguoiNhanOptions(res.data); })
                .catch(() => setNguoiNhanOptions([]));
        } else {
            setNguoiNhanOptions([]);
        }
    }, [idPhongBanNhan]);

    // Lấy Option có dự phòng cho View/Edit
    const getOptionsWithFallback = (activeOptions: any[], type: 'PHAN_CUNG' | 'PHAN_MEM' | 'LINH_KIEN', keyIdField: string) => {
        const merged = activeOptions.map(opt => ({
            value: opt[keyIdField],
            label: opt.tenThietBi || opt.tenPhanMem || opt.tenLinhKien
                ? `${opt.maTheTaiSan || opt.soSerial || opt.keyBanQuyen || ''} - ${opt.tenThietBi || opt.tenPhanMem || opt.tenLinhKien}`
                : t('phieuDieuChuyenFormModal.id_lich_su_cap_opt_keyidfield', { optkeyIdField: opt[keyIdField] })
        }));

        if (selectedRecord && selectedRecord.chiTietTaiSan) {
            const itemsInRecord = selectedRecord.chiTietTaiSan.filter((i: any) => i.loai === type);
            itemsInRecord.forEach((item: any) => {
                if (item.chiTietCapPhatId && !merged.some(opt => opt.value === item.chiTietCapPhatId)) {
                    const labelDisplay = item.tenTaiSan
                        ? t('phieuDieuChuyenFormModal.item_mathetaisan_item_soserial_item', { soSerial: item.maTheTaiSan || item.soSerial || '', tenTaiSan: item.tenTaiSan })
                        : t('phieuDieuChuyenFormModal.id_lich_su_cap_item', { chiTietCapPhatId: item.chiTietCapPhatId });
                    merged.push({ value: item.chiTietCapPhatId, label: labelDisplay });
                }
            });
        }
        return merged;
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (values.idNguoiChuyen === values.idNguoiNhan) {
                message.error(t('phieuDieuChuyenFormModal.nhan_vien_chuyen_va'));
                return;
            }
            const payload = {
                ...values,
                danhSachPhanCung: values.danhSachPhanCung || [],
                danhSachPhanMem: values.danhSachPhanMem || [],
                danhSachLinhKien: values.danhSachLinhKien || [],
            };
            await onSave(payload);
        } catch (e) {
            // Lỗi validate
        }
    };

    const getTitle = () => {
        if (isView) return t('phieuDieuChuyenFormModal.chi_tiet_phieu_dieu');
        return selectedRecord ? t('phieuDieuChuyenFormModal.cap_nhat_phieu_dieu') : t('phieuDieuChuyenFormModal.lap_phieu_dieu_chuyen');
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
            width={1100}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Row gutter={24}>
                    {/* CỘT BÊN GIAO */}
                    <Col span={11}>
                        <Card title="BÊN GIAO TÀI SẢN (NGƯỜI CHUYỂN)" size="small" type="inner">
                            <Form.Item name="idPhongBanChuyen" label={t('phieuDieuChuyenFormModal.phong_ban_chuyen')} rules={[{ required: true, message: t('phieuDieuChuyenFormModal.chon_phong_ban') }]}>
                                <Select
                                    disabled={isView}
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t('phieuDieuChuyenFormModal.chon_phong_ban_hien')}
                                    options={phongBanOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                    onChange={() => {
                                        form.setFieldValue('idNguoiChuyen', undefined);
                                        form.setFieldValue('danhSachPhanCung', []);
                                        form.setFieldValue('danhSachPhanMem', []);
                                        form.setFieldValue('danhSachLinhKien', []);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item name="idNguoiChuyen" label={t('phieuDieuChuyenFormModal.nhan_vien_ban_giao')} rules={[{ required: true, message: t('phieuDieuChuyenFormModal.chon_nhan_vien') }]}>
                                <Select
                                    disabled={isView || !idPhongBanChuyen}
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={idPhongBanChuyen ? t('phieuDieuChuyenFormModal.chon_nhan_su_dang') : t('phieuDieuChuyenFormModal.chon_phong_ban_truoc')}
                                    options={nguoiChuyenOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                    onChange={() => {
                                        form.setFieldValue('danhSachPhanCung', []);
                                        form.setFieldValue('danhSachPhanMem', []);
                                        form.setFieldValue('danhSachLinhKien', []);
                                    }}
                                />
                            </Form.Item>
                        </Card>
                    </Col>

                    {/* MŨI TÊN ĐIỀU CHUYỂN */}
                    <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowRightOutlined style={{ fontSize: '32px', color: '#1890ff', opacity: 0.5 }} />
                    </Col>

                    {/* CỘT BÊN NHẬN */}
                    <Col span={11}>
                        <Card title="BÊN NHẬN TÀI SẢN (NGƯỜI NHẬN)" size="small" type="inner">
                            <Form.Item name="idPhongBanNhan" label={t('phieuDieuChuyenFormModal.phong_ban_tiep_nhan')} rules={[{ required: true, message: t('phieuDieuChuyenFormModal.chon_phong_ban') }]}>
                                <Select
                                    disabled={isView}
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t('phieuDieuChuyenFormModal.chon_phong_ban_den')}
                                    options={phongBanOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                    onChange={() => form.setFieldValue('idNguoiNhan', undefined)}
                                />
                            </Form.Item>
                            <Form.Item name="idNguoiNhan" label={t('phieuDieuChuyenFormModal.nhan_vien_tiep_nhan')} rules={[{ required: true, message: t('phieuDieuChuyenFormModal.chon_nhan_vien') }]}>
                                <Select
                                    disabled={isView || !idPhongBanNhan}
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={idPhongBanNhan ? t('phieuDieuChuyenFormModal.chon_nhan_su_tiep') : t('phieuDieuChuyenFormModal.chon_phong_ban_truoc')}
                                    options={nguoiNhanOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                <Form.Item name="lyDoDieuChuyen" label={t('phieuDieuChuyenFormModal.ly_do_dieu_chuyen')} rules={[{ required: true, message: t('phieuDieuChuyenFormModal.nhap_ly_do_dieu_chuyen') }]} style={{ marginTop: 16 }}>
                    <Input.TextArea disabled={isView} rows={2} placeholder={t('phieuDieuChuyenFormModal.nhap_ly_do_dieu')} />
                </Form.Item>

                {/* 1. MẢNG ĐIỀU CHUYỂN THIẾT BỊ PHẦN CỨNG */}
                <Divider orientation={'left' as any}>{t('phieuDieuChuyenFormModal.danh_sach_dieu_chuyen_thiet')}</Divider>
                <Form.List name="danhSachPhanCung">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={9}>
                                            <Form.Item {...restField} name={[name, 'chiTietCapPhatPhanCungId']} label={t('phieuDieuChuyenFormModal.tai_san_dang_giu')} rules={[{ required: true, message: t('phieuThuHoiFormModal.chon_tai_san') }]}>
                                                <Select
                                                    disabled={isView || !idNguoiChuyen}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={idNguoiChuyen ? t('phieuDieuChuyenFormModal.chon_thiet_bi_can') : t('phieuDieuChuyenFormModal.chon_nguoi_giao_truoc')}
                                                    options={getOptionsWithFallback(activeHardwareOptions, 'PHAN_CUNG', 'chiTietCapPhatPhanCungId')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'trangThaiXuat']} label={t('phieuDieuChuyenFormModal.trang_thai_khi_ban')} rules={[{ required: true, message: t('phieuDieuChuyenFormModal.nhap_trang_thai') }]}>
                                                <Input disabled={isView} placeholder={t('phieuDieuChuyenFormModal.vi_du_binh_thuong_xuoc_nhe')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label={t('loaiTaiSanFormModal.ghi_chu')}>
                                                <Input disabled={isView} placeholder={t('phieuDieuChuyenFormModal.nhap_chu_thich_kem')} />
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
                                        Thêm thiết bị phần cứng cần điều chuyển
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 2. MẢNG ĐIỀU CHUYỂN BẢN QUYỀN PHẦN MỀM
                <Divider orientation={'left' as any}>{t('phieuDieuChuyenFormModal.danh_sach_dieu_chuyen_ban')}</Divider>
                <Form.List name="danhSachPhanMem">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={16}>
                                            <Form.Item {...restField} name={[name, 'chiTietCapPhatPhanMemId']} label={t('phieuDieuChuyenFormModal.ban_quyen_phan_mem')} rules={[{ required: true, message: t('donHangMuaSamFormModal.chon_phan_mem') }]}>
                                                <Select
                                                    disabled={isView || !idNguoiChuyen}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={idNguoiChuyen ? t('phieuDieuChuyenFormModal.chon_phan_mem_can') : t('phieuDieuChuyenFormModal.chon_nguoi_giao_truoc')}
                                                    options={getOptionsWithFallback(activeSoftwareOptions, 'PHAN_MEM', 'chiTietCapPhatPhanMemId')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label={t('loaiTaiSanFormModal.ghi_chu')}>
                                                <Input disabled={isView} placeholder={t('phieuDieuChuyenFormModal.chu_thich_chuyen_account')} />
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
                                        Thêm bản quyền phần mềm cần điều chuyển
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List> */}

                {/* 3. MẢNG ĐIỀU CHUYỂN LINH KIÊN PHẦN CỨNG */}
                <Divider orientation={'left' as any}>{t('phieuDieuChuyenFormModal.danh_sach_dieu_chuyen')}</Divider>
                <Form.List name="danhSachLinhKien">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={9}>
                                            <Form.Item {...restField} name={[name, 'chiTietCapPhatLinhKienId']} label={t('phieuDieuChuyenFormModal.linh_kien_dang_giu')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_linh_kien') }]}>
                                                <Select
                                                    disabled={isView || !idNguoiChuyen}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={idNguoiChuyen ? t('phieuDieuChuyenFormModal.chon_linh_kien_can') : t('phieuDieuChuyenFormModal.chon_nguoi_giao_truoc')}
                                                    options={getOptionsWithFallback(activeComponentOptions, 'LINH_KIEN', 'chiTietCapPhatLinhKienId')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'trangThaiXuat']} label={t('phieuDieuChuyenFormModal.trang_thai_khi_ban')} rules={[{ required: true, message: t('phieuDieuChuyenFormModal.nhap_trang_thai') }]}>
                                                <Input disabled={isView} placeholder={t('phieuDieuChuyenFormModal.vi_du_binh_thuong')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
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
                                        Thêm linh kiện rời cần điều chuyển
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