import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, Card, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { SelectOption } from '../../../api-generated/models/selectOption';

// Đã cập nhật hàm layAllocationsCuaNhanVien
import { layAllocationsCuaNhanVien } from '../../../api-generated/endpoints/phieu-thu-hoi-tai-san-controller/phieu-thu-hoi-tai-san-controller';
import { laySelectOptions6 as layNguoiDungOptions } from '../../../api-generated/endpoints/nguoi-dung-controller/nguoi-dung-controller';
import { laySelectOptions4 as layPhongBanOptions } from '../../../api-generated/endpoints/phong-ban-controller/phong-ban-controller';
import { useSearchableSelect } from '../../../hooks/useSearchableSelect';

interface PhieuThuHoiFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: any | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: any) => Promise<void>;
    loading: boolean;
}

export const PhieuThuHoiFormModal: React.FC<PhieuThuHoiFormModalProps> = ({
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

    const idPhongBanTra = Form.useWatch('idPhongBanTra', form);
    const idNhanVienTra = Form.useWatch('idNhanVienTra', form);

    const phongBan = useSearchableSelect(layPhongBanOptions as any);
    const nguoiDung = useSearchableSelect(layNguoiDungOptions as any, { idPhongBan: idPhongBanTra });

    // State lưu danh sách tài sản nhân viên ĐANG MƯỢN (Lấy từ API active-allocations)
    const [activeHardwareOptions, setActiveHardwareOptions] = useState<any[]>([]);
    const [activeSoftwareOptions, setActiveSoftwareOptions] = useState<any[]>([]);
    const [activeComponentOptions, setActiveComponentOptions] = useState<any[]>([]);



    useEffect(() => {
        if (open) {
            phongBan.fetchOptions().catch(() => { });

            if (selectedRecord) {
                const danhSachPhanCung = selectedRecord.chiTietTaiSan
                    ?.filter((item: any) => item.loai === 'PHAN_CUNG')
                    .map((item: any) => ({
                        chiTietCapPhatPhanCungId: item.idChiTietCapPhat,
                        tinhTrangLucThuHoi: item.tinhTrangLucThuHoi,
                        phuKienThuHoi: item.phuKienThuHoi,
                        ghiChu: item.ghiChu,
                    })) || [];

                const danhSachPhanMem = selectedRecord.chiTietTaiSan
                    ?.filter((item: any) => item.loai === 'PHAN_MEM')
                    .map((item: any) => ({
                        chiTietCapPhatPhanMemId: item.idChiTietCapPhat,
                        ghiChu: item.ghiChu,
                    })) || [];

                const danhSachLinhKien = selectedRecord.chiTietTaiSan
                    ?.filter((item: any) => item.loai === 'LINH_KIEN')
                    .map((item: any) => ({
                        chiTietCapPhatLinhKienId: item.idChiTietCapPhat,
                        tinhTrangLucThuHoi: item.tinhTrangLucThuHoi,
                        phuKienThuHoi: item.phuKienThuHoi,
                        ghiChu: item.ghiChu,
                    })) || [];

                form.setFieldsValue({
                    idPhongBanTra: selectedRecord.idPhongBanTra,
                    idNhanVienTra: selectedRecord.idNhanVienTra,
                    lyDoThuHoi: selectedRecord.lyDoThuHoi,
                    danhSachPhanCung,
                    danhSachPhanMem,
                    danhSachLinhKien,
                });
            } else {
                form.resetFields();
                setActiveHardwareOptions([]);
                setActiveSoftwareOptions([]);
                setActiveComponentOptions([]);
            }
        }
    }, [open, selectedRecord, form]);

    useEffect(() => {
        if (idPhongBanTra) {
            nguoiDung.fetchOptions();
        } else {
            nguoiDung.reset();
        }
    }, [idPhongBanTra]);

    useEffect(() => {
        if (idNhanVienTra) {
            // Sử dụng hàm layAllocationsCuaNhanVien từ Orval
            layAllocationsCuaNhanVien({ idNhanVien: idNhanVienTra })
                .then(res => {
                    if (res.code === 200 && res.data) {
                        setActiveHardwareOptions(res.data.danhSachPhanCung || []);
                        setActiveSoftwareOptions(res.data.danhSachPhanMem || []);
                        setActiveComponentOptions(res.data.danhSachLinhKien || []);
                    }
                })
                .catch(() => {
                    setActiveHardwareOptions([]);
                    setActiveSoftwareOptions([]);
                    setActiveComponentOptions([]);
                });
        } else {
            setActiveHardwareOptions([]);
            setActiveSoftwareOptions([]);
            setActiveComponentOptions([]);
        }
    }, [idNhanVienTra]);

    const getOptionsWithFallback = (activeOptions: any[], type: 'PHAN_CUNG' | 'PHAN_MEM' | 'LINH_KIEN', keyIdField: string) => {
        const merged = activeOptions.map(opt => ({
            value: opt[keyIdField],
            label: opt.tenThietBi || opt.tenPhanMem || opt.tenLinhKien
                ? `${opt.maTheTaiSan || opt.soSerial || opt.keyBanQuyen || ''} - ${opt.tenThietBi || opt.tenPhanMem || opt.tenLinhKien}`
                : t('phieuThuHoiFormModal.id_phieu_cap_opt_keyidfield', { optkeyIdField: opt[keyIdField] })
        }));

        if (selectedRecord && selectedRecord.chiTietTaiSan) {
            const itemsInRecord = selectedRecord.chiTietTaiSan.filter((i: any) => i.loai === type);
            itemsInRecord.forEach((item: any) => {
                if (item.idChiTietCapPhat && !merged.some(opt => opt.value === item.idChiTietCapPhat)) {
                    const labelDisplay = item.tenTaiSan
                        ? t('phieuDieuChuyenFormModal.item_mathetaisan_item_soserial_item', { soSerial: item.maTheTaiSan || item.soSerial || '', tenTaiSan: item.tenTaiSan })
                        : t('phieuThuHoiFormModal.id_phieu_cap_item_idchitietcapphat', { idChiTietCapPhat: item.idChiTietCapPhat });
                    merged.push({ value: item.idChiTietCapPhat, label: labelDisplay });
                }
            });
        }
        return merged;
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
            await onSave(payload);
        } catch (e) {
            // Lỗi validate form
        }
    };

    const getTitle = () => {
        if (isView) return t('phieuThuHoiFormModal.chi_tiet_phieu_thu');
        return selectedRecord ? t('phieuThuHoiFormModal.cap_nhat_phieu_thu') : t('phieuThuHoiFormModal.lap_phieu_thu_hoi');
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
                        <Form.Item name="idPhongBanTra" label={t('phieuThuHoiFormModal.phong_ban_ban_giao')} rules={[{ required: true, message: t('phieuCapPhatFormModal.vui_long_chon_phong_ban') }]}>
                            <Select
                                disabled={isView}
                                placeholder={t('phieuThuHoiFormModal.chon_phong_ban')}
                                showSearch
                                filterOption={false}
                                onSearch={phongBan.handleSearch}
                                loading={phongBan.loading}
                                options={phongBan.options.map(opt => ({ value: opt.id, label: opt.ten }))}
                                onChange={() => {
                                    form.setFieldValue('idNhanVienTra', undefined);
                                    form.setFieldValue('danhSachPhanCung', []);
                                    form.setFieldValue('danhSachPhanMem', []);
                                    form.setFieldValue('danhSachLinhKien', []);
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="idNhanVienTra" label={t('phieuThuHoiFormModal.nhan_vien_ban_giao')} rules={[{ required: true, message: t('phieuThuHoiFormModal.vui_long_chon_nhan') }]}>
                            <Select
                                disabled={isView || !idPhongBanTra}
                                placeholder={idPhongBanTra ? t('phieuThuHoiFormModal.chon_nhan_su') : t('phieuThuHoiFormModal.vui_long_chon_phong')}
                                showSearch
                                filterOption={false}
                                onSearch={nguoiDung.handleSearch}
                                loading={nguoiDung.loading}
                                options={nguoiDung.options.map(opt => ({ value: opt.id, label: opt.ten }))}
                                onChange={() => {
                                    form.setFieldValue('danhSachPhanCung', []);
                                    form.setFieldValue('danhSachPhanMem', []);
                                    form.setFieldValue('danhSachLinhKien', []);
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="lyDoThuHoi" label={t('phieuThuHoiFormModal.ly_do_thu_hoi')} rules={[{ required: true, message: t('phieuThuHoiFormModal.nhap_ly_do_thu_hoi') }]}>
                    <Input.TextArea disabled={isView} rows={2} placeholder={t('phieuThuHoiFormModal.nhap_ly_do_thu')} />
                </Form.Item>

                {/* 1. MẢNG THU HỒI THIẾT BỊ PHẦN CỨNG */}
                <Divider orientation={'left' as any}>{t('phieuThuHoiFormModal.danh_sach_thu_hoi_thiet')}</Divider>
                <Form.List name="danhSachPhanCung">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={8}>
                                            <Form.Item {...restField} name={[name, 'chiTietCapPhatPhanCungId']} label={t('phieuThuHoiFormModal.tai_san_dang_giu')} rules={[{ required: true, message: t('phieuThuHoiFormModal.chon_tai_san') }]}>
                                                <Select
                                                    disabled={isView || !idNhanVienTra}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={idNhanVienTra ? t('phieuThuHoiFormModal.chon_thiet_bi_can') : t('phieuThuHoiFormModal.chon_nhan_su_truoc')}
                                                    options={getOptionsWithFallback(activeHardwareOptions, 'PHAN_CUNG', 'chiTietCapPhatPhanCungId')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'tinhTrangLucThuHoi']} label={t('phieuThuHoiFormModal.tinh_trang_nhan_lai')} rules={[{ required: true, message: t('phieuSuaChuaFormModal.nhap_tinh_trang') }]}>
                                                <Input disabled={isView} placeholder={t('phieuThuHoiFormModal.vi_du_binh_thuong_xuoc')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'phuKienThuHoi']} label={t('phieuThuHoiFormModal.phu_kien_tra_lai')}>
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
                                        Thêm thiết bị phần cứng cần thu hồi
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 2. MẢNG THU HỒI BẢN QUYỀN PHẦN MỀM */}
                <Divider orientation={'left' as any}>{t('phieuThuHoiFormModal.danh_sach_thu_hoi_ban')}</Divider>
                <Form.List name="danhSachPhanMem">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={16}>
                                            <Form.Item {...restField} name={[name, 'chiTietCapPhatPhanMemId']} label={t('phieuThuHoiFormModal.ban_quyen_phan_mem')} rules={[{ required: true, message: t('donHangMuaSamFormModal.chon_phan_mem') }]}>
                                                <Select
                                                    disabled={isView || !idNhanVienTra}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={idNhanVienTra ? t('phieuThuHoiFormModal.chon_phan_mem_can') : t('phieuThuHoiFormModal.chon_nhan_su_truoc')}
                                                    options={getOptionsWithFallback(activeSoftwareOptions, 'PHAN_MEM', 'chiTietCapPhatPhanMemId')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label={t('loaiTaiSanFormModal.ghi_chu')}>
                                                <Input disabled={isView} placeholder={t('phieuThuHoiFormModal.chu_thich_huy_cai')} />
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
                                        Thêm bản quyền phần mềm cần thu hồi
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 3. MẢNG THU HỒI LINH KIÊN PHẦN CỨNG */}
                <Divider orientation={'left' as any}>{t('phieuThuHoiFormModal.danh_sach_thu_hoi')}</Divider>
                <Form.List name="danhSachLinhKien">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={8}>
                                            <Form.Item {...restField} name={[name, 'chiTietCapPhatLinhKienId']} label={t('phieuThuHoiFormModal.linh_kien_dang_giu')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_linh_kien') }]}>
                                                <Select
                                                    disabled={isView || !idNhanVienTra}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={idNhanVienTra ? t('phieuThuHoiFormModal.chon_linh_kien_can') : t('phieuThuHoiFormModal.chon_nhan_su_truoc')}
                                                    options={getOptionsWithFallback(activeComponentOptions, 'LINH_KIEN', 'chiTietCapPhatLinhKienId')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'tinhTrangLucThuHoi']} label={t('phieuThuHoiFormModal.tinh_trang_nhan_lai')} rules={[{ required: true, message: t('phieuSuaChuaFormModal.nhap_tinh_trang') }]}>
                                                <Input disabled={isView} placeholder={t('phieuThuHoiFormModal.vi_du_binh_thuong')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'phuKienThuHoi']} label={t('phieuThuHoiFormModal.phu_kien_tra_lai')}>
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
                                        Thêm linh kiện rời cần thu hồi
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