import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, Card, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import type { SelectOption } from '../../../api-generated/models/selectOption';
// IMPORT ĐÚNG CÁC DTO ĐƯỢC GENERATE
import type { PhieuThanhLyTaiSanResponse } from '../../../api-generated/models/phieuThanhLyTaiSanResponse';
import type { PhieuThanhLyTaiSanRequest } from '../../../api-generated/models/phieuThanhLyTaiSanRequest';

// API Controllers lấy danh sách thiết bị có thể thanh lý
import { laySelectOptions1 as layThietBiPhanCungOptions } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-cung-controller/danh-sach-thiet-bi-phan-cung-controller';
import { laySelectOptions as layThietBiPhanMemOptions } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-mem-controller/danh-sach-thiet-bi-phan-mem-controller';
import { laySelectOptions8 as layThietBiLinhKienOptions } from '../../../api-generated/endpoints/linh-kien-phan-cung-controller/linh-kien-phan-cung-controller';

interface PhieuThanhLyFormModalProps {
    open: boolean;
    onCancel: () => void;
    // Thay thế any bằng DTO Response
    selectedRecord: PhieuThanhLyTaiSanResponse | null;
    mode: 'add' | 'edit' | 'view';
    // Thay thế any bằng DTO Request
    onSave: (values: PhieuThanhLyTaiSanRequest) => Promise<void>;
    loading: boolean;
}

export const PhieuThanhLyFormModal: React.FC<PhieuThanhLyFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
  const { t } = useTranslation();
    // Đưa Type cho Form
    const [form] = Form.useForm<PhieuThanhLyTaiSanRequest>();
    const isView = mode === 'view';

    // State lưu danh sách toàn bộ tài sản hợp lệ để thanh lý
    const [thietBiPhanCungOptions, setThietBiPhanCungOptions] = useState<SelectOption[]>([]);
    const [thietBiPhanMemOptions, setThietBiPhanMemOptions] = useState<SelectOption[]>([]);
    const [thietBiLinhKienOptions, setThietBiLinhKienOptions] = useState<SelectOption[]>([]);

    useEffect(() => {
        if (open) {
            Promise.all([
                layThietBiPhanCungOptions(),
                layThietBiPhanMemOptions(),
                layThietBiLinhKienOptions(),
            ])
                .then(([pcRes, pmRes, lkRes]) => {
                    if (pcRes.data) setThietBiPhanCungOptions(pcRes.data);
                    if (pmRes.data) setThietBiPhanMemOptions(pmRes.data);
                    if (lkRes.data) setThietBiLinhKienOptions(lkRes.data);
                })
                .catch(() => { });

            if (selectedRecord) {
                // Map mảng danhSachTaiSan (hoặc chiTietTaiSan) sang đúng chuẩn các field của DTO Request
                const danhSachTaiSan = selectedRecord.chiTietTaiSan || [];

                const danhSachPhanCung = danhSachTaiSan
                    .filter((item: any) => item.loai === 'PHAN_CUNG' || item.loaiTaiSan === 'PHAN_CUNG')
                    .map((item: any) => ({
                        idThietBiPhanCung: item.idTaiSan || item.thietBiId,
                        tienThuHoi: item.tienThuHoi || item.giaThanhLy,
                        ghiChu: item.ghiChu,
                    }));

                const danhSachPhanMem = danhSachTaiSan
                    .filter((item: any) => item.loai === 'PHAN_MEM' || item.loaiTaiSan === 'PHAN_MEM')
                    .map((item: any) => ({
                        idThietBiPhanMem: item.idTaiSan || item.thietBiId,
                        tienThuHoi: item.tienThuHoi || item.giaThanhLy,
                        ghiChu: item.ghiChu,
                    }));

                const danhSachLinhKien = danhSachTaiSan
                    .filter((item: any) => item.loai === 'LINH_KIEN' || item.loaiTaiSan === 'LINH_KIEN')
                    .map((item: any) => ({
                        idLinhKienPhanCung: item.idTaiSan || item.thietBiId,
                        tienThuHoi: item.tienThuHoi || item.giaThanhLy,
                        ghiChu: item.ghiChu,
                    }));

                form.setFieldsValue({
                    lyDoThanhLy: selectedRecord.lyDoThanhLy,
                    // ghiChu: selectedRecord.ghiChu,
                    danhSachPhanCung,
                    danhSachPhanMem,
                    danhSachLinhKien,
                } as any);
            } else {
                form.resetFields();
            }
        }
    }, [open, selectedRecord, form]);

    // Lấy Option có dự phòng (Fallback) khi xem/sửa những tài sản đã thanh lý không còn hiện ở list Options gốc
    const getOptionsWithFallback = (baseOptions: SelectOption[], type: 'PHAN_CUNG' | 'PHAN_MEM' | 'LINH_KIEN') => {
        const merged = [...baseOptions];
        const danhSachTaiSan = selectedRecord?.chiTietTaiSan || [];

        if (selectedRecord && danhSachTaiSan.length > 0) {
            const itemsInRecord = danhSachTaiSan.filter((i: any) => i.loai === type || i.loaiTaiSan === type);
            itemsInRecord.forEach((item: any) => {
                const idTaiSan = item.idTaiSan || item.thietBiId;
                if (idTaiSan && !merged.some(opt => opt.id === idTaiSan)) {
                    const labelDisplay = item.tenTaiSan
                        ? `${item.maTheTaiSan || item.soSerial || ''} - ${item.tenTaiSan}`
                        : t('phieuThanhLyFormModal.id_tai_san_idtaisan', { idTaiSan: idTaiSan });
                    merged.push({ id: idTaiSan, ten: labelDisplay });
                }
            });
        }
        return merged.map(opt => ({ value: opt.id, label: opt.ten }));
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload: PhieuThanhLyTaiSanRequest = {
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
        if (isView) return t('phieuThanhLyFormModal.chi_tiet_phieu_thanh');
        return selectedRecord ? t('phieuThanhLyFormModal.cap_nhat_phieu_thanh') : t('phieuThanhLyFormModal.lap_phieu_thanh_ly');
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
                        {selectedRecord ? t('phieuNhapTaiSanFormModal.luu_cap_nhat') : t('phieuThanhLyFormModal.xac_nhan_lap_phieu')}
                    </Button>
                ]
            }
            width={1000}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>

                <Card size="small" title={t('phieuThanhLyFormModal.thong_tin_thanh_ly')} >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="lyDoThanhLy" label={t('phieuThanhLyFormModal.ly_do_muc_dich')} rules={[{ required: true, message: t('phieuThanhLyFormModal.nhap_ly_do_thanh') }]}>
                                <Input.TextArea disabled={isView} rows={2} placeholder={t('phieuThanhLyFormModal.nhap_ly_do_vd')} />
                            </Form.Item>
                        </Col>
                        {/* <Col span={24}>
                            <Form.Item name="ghiChu" label={t('phieuThanhLyFormModal.ghi_chu_them')}>
                                <Input.TextArea disabled={isView} rows={1} placeholder={t('phieuThanhLyFormModal.nhap_cac_chu_thich')} />
                            </Form.Item>
                        </Col> */}
                    </Row>
                </Card>

                {/* 1. MẢNG THANH LÝ THIẾT BỊ PHẦN CỨNG */}
                <Divider orientation={'left' as any}>{t('phieuThanhLyFormModal.danh_sach_thiet_bi')}</Divider>
                <Form.List name="danhSachPhanCung">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={10}>
                                            <Form.Item {...restField} name={[name, 'idThietBiPhanCung']} label={t('phieuSuaChuaFormModal.thiet_bi_phan_cung')} rules={[{ required: true, message: t('phieuThuHoiFormModal.chon_tai_san') }]}>
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={t('phieuThanhLyFormModal.chon_thiet_bi_can')}
                                                    options={getOptionsWithFallback(thietBiPhanCungOptions, 'PHAN_CUNG')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item {...restField} name={[name, 'tienThuHoi']} label={t('phieuThanhLyFormModal.tien_thu_hoi_vnd')}>
                                                <Input disabled={isView} placeholder={t('phieuThanhLyFormModal.nhap_gia_du_kien')} type="number" />
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
                                        Thêm thiết bị phần cứng cần thanh lý
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 2. MẢNG THANH LÝ BẢN QUYỀN PHẦN MỀM */}
                <Divider orientation={'left' as any}>{t('phieuThanhLyFormModal.danh_sach_ban_quyen')}</Divider>
                <Form.List name="danhSachPhanMem">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={10}>
                                            <Form.Item {...restField} name={[name, 'idThietBiPhanMem']} label={t('phieuThanhLyFormModal.ban_quyen_phan_mem')} rules={[{ required: true, message: t('donHangMuaSamFormModal.chon_phan_mem') }]}>
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={t('phieuThanhLyFormModal.chon_phan_mem_can')}
                                                    options={getOptionsWithFallback(thietBiPhanMemOptions, 'PHAN_MEM')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item {...restField} name={[name, 'tienThuHoi']} label={t('phieuThanhLyFormModal.tien_thu_hoi_vnd')}>
                                                <Input disabled={isView} placeholder={t('phieuThanhLyFormModal.nhap_gia_du_kien')} type="number" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'ghiChu']} label={t('loaiTaiSanFormModal.ghi_chu')}>
                                                <Input disabled={isView} placeholder={t('phieuThanhLyFormModal.chu_thich_huy_license')} />
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
                                        Thêm bản quyền phần mềm cần thanh lý
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                {/* 3. MẢNG THANH LÝ LINH KIÊN PHẦN CỨNG */}
                <Divider orientation={'left' as any}>{t('phieuThanhLyFormModal.danh_sach_linh_kien')}</Divider>
                <Form.List name="danhSachLinhKien">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 12 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={10}>
                                            <Form.Item {...restField} name={[name, 'idLinhKienPhanCung']} label={t('phieuThanhLyFormModal.linh_kien_roi')} rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_linh_kien') }]}>
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder={t('phieuThanhLyFormModal.chon_linh_kien_can')}
                                                    options={getOptionsWithFallback(thietBiLinhKienOptions, 'LINH_KIEN')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item {...restField} name={[name, 'tienThuHoi']} label={t('phieuThanhLyFormModal.tien_thu_hoi_vnd')}>
                                                <Input disabled={isView} placeholder={t('phieuThanhLyFormModal.nhap_gia_du_kien')} type="number" />
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
                                        Thêm linh kiện rời cần thanh lý
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