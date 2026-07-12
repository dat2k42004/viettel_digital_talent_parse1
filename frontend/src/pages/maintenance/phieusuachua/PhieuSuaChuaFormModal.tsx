import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, DatePicker, InputNumber, Space, Card, Divider, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { PhieuSuaChuaBaoTriResponse } from '../../../api-generated/models/phieuSuaChuaBaoTriResponse';
import type { PhieuSuaChuaBaoTriRequest } from '../../../api-generated/models/phieuSuaChuaBaoTriRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import type { KeHoachBaoTriDinhKyResponse } from '../../../api-generated/models/keHoachBaoTriDinhKyResponse';

import { laySelectOptions5 as layNccOptions } from '../../../api-generated/endpoints/nha-cung-cap-controller/nha-cung-cap-controller';
import { laySelectOptions1 as layThietBiOptions } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-cung-controller/danh-sach-thiet-bi-phan-cung-controller';
import { laySelectOptions8 as layLinhKienOptions } from '../../../api-generated/endpoints/linh-kien-phan-cung-controller/linh-kien-phan-cung-controller';
import { layDanhSach19 as layKeHoachList, layTheoId18 as layKeHoachDetail } from '../../../api-generated/endpoints/ke-hoach-bao-tri-controller/ke-hoach-bao-tri-controller';
import { useSearchableSelect } from '../../../hooks/useSearchableSelect';

const { Text } = Typography;

interface PhieuSuaChuaFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: PhieuSuaChuaBaoTriResponse | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (values: PhieuSuaChuaBaoTriRequest) => Promise<void>;
    loading: boolean;
}

export const PhieuSuaChuaFormModal: React.FC<PhieuSuaChuaFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSave,
    loading,
}) => {
  const { t } = useTranslation();
    const [form] = Form.useForm<PhieuSuaChuaBaoTriRequest>();
    const isView = mode === 'view';

    const ncc = useSearchableSelect(layNccOptions as any);
    const [thietBiOptions, setThietBiOptions] = useState<SelectOption[]>([]);
    const [linhKienOptions, setLinhKienOptions] = useState<SelectOption[]>([]);
    const [keHoachOptions, setKeHoachOptions] = useState<KeHoachBaoTriDinhKyResponse[]>([]);

    // Debounced search for thietBi and linhKien (keeps keHoach-dependency filter)
    const tbSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lkSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleThietBiSearch = useCallback((keyword: string) => {
        if (tbSearchTimer.current) clearTimeout(tbSearchTimer.current);
        tbSearchTimer.current = setTimeout(() => {
            layThietBiOptions({ keyword }).then(res => { if (res.data) setThietBiOptions(res.data); }).catch(() => { });
        }, 400);
    }, []);
    const handleLinhKienSearch = useCallback((keyword: string) => {
        if (lkSearchTimer.current) clearTimeout(lkSearchTimer.current);
        lkSearchTimer.current = setTimeout(() => {
            layLinhKienOptions({ keyword }).then(res => { if (res.data) setLinhKienOptions(res.data); }).catch(() => { });
        }, 400);
    }, []);

    const keHoachBaoTriId = Form.useWatch('keHoachBaoTriId', form);

    useEffect(() => {
        if (open) {
            // Load dropdown data
            Promise.all([
                ncc.fetchOptions(),
                layKeHoachList({ trangThai: 'DA_PHE_DUYET', size: 1000 })
            ]).then(([, khRes]) => {
                if (khRes.data && (khRes.data as any).content) {
                    setKeHoachOptions((khRes.data as any).content);
                }
            }).catch(() => { });

            if (selectedRecord) {
                // If it's a detail record, it has chiTietTaiSan (from backend response)
                // PhieuSuaChuaBaoTriResponse contains chiTietTaiSan?: ChiTietBaoTriGeneralResponse[]
                // We split them back to devices and components based on type
                const chiTietTaiSan = selectedRecord.chiTietTaiSan || [];
                const thietBiList = chiTietTaiSan
                    .filter(item => item.loai === 'THIET_BI')
                    .map(item => ({
                        idDanhSachThietBiPhanCung: item.idTaiSanGoc,
                        tenMauTaiSan: item.tenMauTaiSan,
                        loaiHinhXuLy: item.loaiHinhXuLy,
                        idNhaCungCap: item.idNhaCungCap,
                        tinhTrangThietBi: item.tinhTrangThietBi,
                        chiPhi: item.chiPhi ? Number(item.chiPhi) : 0,
                    }));

                const linhKienList = chiTietTaiSan
                    .filter(item => item.loai === 'LINH_KIEN')
                    .map(item => ({
                        idLinhKienPhanCung: item.idTaiSanGoc,
                        tenMauTaiSan: item.tenMauTaiSan,
                        loaiHinhXuLy: item.loaiHinhXuLy,
                        idNhaCungCap: item.idNhaCungCap,
                        tinhTrangThietBi: item.tinhTrangThietBi,
                        chiPhi: item.chiPhi ? Number(item.chiPhi) : 0,
                    }));

                form.setFieldsValue({
                    keHoachBaoTriId: selectedRecord.keHoachBaoTriId,
                    thoiGianBatDau: selectedRecord.thoiGianBatDau ? dayjs(selectedRecord.thoiGianBatDau) as any : undefined,
                    thoiGianHoanThanhDuKien: selectedRecord.thoiGianHoanThanhDuKien ? dayjs(selectedRecord.thoiGianHoanThanhDuKien) as any : undefined,
                    ghiChu: selectedRecord.ghiChu,
                    danhSachThietBi: thietBiList,
                    danhSachLinhKien: linhKienList,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, selectedRecord, form]);

    useEffect(() => {
        if (!open) return;

        if (keHoachBaoTriId) {
            layKeHoachDetail(keHoachBaoTriId).then(async (res) => {
                if (res.data && res.data.chiTietPhanVi) {
                    const assetIds = res.data.chiTietPhanVi
                        .map(x => x.idTaiSanPhanCung)
                        .filter(Boolean) as number[];

                    if (assetIds.length > 0) {
                        const tbPromises = assetIds.map(id => layThietBiOptions({ idTaiSanPhanCung: id }));
                        const lkPromises = assetIds.map(id => layLinhKienOptions({ idTaiSanPhanCung: id }));

                        const [tbResults, lkResults] = await Promise.all([
                            Promise.all(tbPromises),
                            Promise.all(lkPromises)
                        ]);

                        const mergedTb: SelectOption[] = [];
                        const seenTbIds = new Set<number>();
                        tbResults.forEach(r => {
                            r.data?.forEach(opt => {
                                if (!seenTbIds.has(opt.id!)) {
                                    seenTbIds.add(opt.id!);
                                    mergedTb.push(opt);
                                }
                            });
                        });

                        const mergedLk: SelectOption[] = [];
                        const seenLkIds = new Set<number>();
                        lkResults.forEach(r => {
                            r.data?.forEach(opt => {
                                if (!seenLkIds.has(opt.id!)) {
                                    seenLkIds.add(opt.id!);
                                    mergedLk.push(opt);
                                }
                            });
                        });

                        setThietBiOptions(mergedTb);
                        setLinhKienOptions(mergedLk);
                    } else {
                        setThietBiOptions([]);
                        setLinhKienOptions([]);
                    }
                }
            }).catch(() => {
                // If it fails, fallback to loading all
                Promise.all([layThietBiOptions(), layLinhKienOptions()]).then(([tbRes, lkRes]) => {
                    if (tbRes.data) setThietBiOptions(tbRes.data);
                    if (lkRes.data) setLinhKienOptions(lkRes.data);
                });
            });
        } else {
            // Load all options
            Promise.all([layThietBiOptions(), layLinhKienOptions()]).then(([tbRes, lkRes]) => {
                if (tbRes.data) setThietBiOptions(tbRes.data);
                if (lkRes.data) setLinhKienOptions(lkRes.data);
            });
        }
    }, [keHoachBaoTriId, open]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                thoiGianBatDau: values.thoiGianBatDau ? dayjs(values.thoiGianBatDau).format('YYYY-MM-DD[T]00:00:00') : undefined,
                thoiGianHoanThanhDuKien: values.thoiGianHoanThanhDuKien ? dayjs(values.thoiGianHoanThanhDuKien).format('YYYY-MM-DD[T]00:00:00') : undefined,
            };
            await onSave(payload as any);
        } catch (e) {
            // Validation failed
        }
    };

    const getTitle = () => {
        if (isView) return t('phieuSuaChuaFormModal.chi_tiet_phieu_sua');
        return selectedRecord ? t('phieuSuaChuaFormModal.cap_nhat_phieu_sua') : t('phieuSuaChuaFormModal.lap_phieu_sua_chua');
    };

    const loaiHinhOptions = [
        { value: 'GUI_BAO_HANH', label: t('phieuSuaChuaFormModal.gui_bao_hanh_chinh') },
        { value: 'SUA_CHUA_DICH_VU', label: t('phieuSuaChuaFormModal.sua_chua_dich_vu') },
        { value: 'THAY_THE_MOI', label: t('phieuSuaChuaFormModal.thay_the_moi_hoan') },
    ];

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
                        {selectedRecord ? t('phieuNhapTaiSanFormModal.luu_cap_nhat') : t('phieuSuaChuaFormModal.tao_phieu_sua')}
                    </Button>
                ]
            }
            width={1100}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Divider orientation={'left' as any}>{t('phieuSuaChuaFormModal.thong_tin_chung_chung')}</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="keHoachBaoTriId"
                            label={t('phieuSuaChuaFormModal.ke_hoach_bao_tri')}
                            rules={[{ required: true, message: t('phieuSuaChuaFormModal.vui_long_chon_ke') }]}
                        >
                            <Select
                                disabled={isView || !!selectedRecord}
                                placeholder={t('phieuSuaChuaFormModal.chon_ke_hoach_bao')}
                                showSearch
                                optionFilterProp="children"
                            >
                                {keHoachOptions.map(kh => (
                                    <Select.Option key={kh.id} value={kh.id}>
                                        {`[${kh.maKeHoach}] ${kh.tenKeHoach}`}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="thoiGianBatDau"
                            label={t('phieuSuaChuaFormModal.ngay_bat_dau_sua')}
                            rules={[{ required: true, message: t('phieuSuaChuaFormModal.vui_long_chon_ngay') }]}
                        >
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="thoiGianHoanThanhDuKien"
                            label={t('phieuSuaChuaFormModal.ngay_hoan_thanh_du')}
                        >
                            <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="ghiChu" label={t('phieuSuaChuaFormModal.ghi_chu_mo_ta')}>
                    <Input.TextArea disabled={isView} rows={2} placeholder={t('phieuSuaChuaFormModal.noi_dung_ghi_chu')} />
                </Form.Item>

                <Divider orientation={'left' as any}>{t('phieuSuaChuaFormModal.danh_sach_thiet_bi')}</Divider>
                <Form.List name="danhSachThietBi">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 8 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'tenMauTaiSan']}
                                                label={t('phieuSuaChuaFormModal.thiet_bi_phan_cung')}
                                                rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_thiet_bi') }]}
                                            >
                                                <Select
                                                    disabled={isView || !!selectedRecord}
                                                    showSearch
                                                    filterOption={false}
                                                    onSearch={handleThietBiSearch}
                                                    placeholder={t('phieuSuaChuaFormModal.chon_thiet_bi')}
                                                    options={thietBiOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'loaiHinhXuLy']}
                                                label={t('phieuSuaChuaFormModal.hinh_thuc_xu_ly')}
                                                rules={[{ required: true, message: t('phieuSuaChuaFormModal.chon_hinh_thuc') }]}
                                            >
                                                <Select disabled={isView} placeholder={t('phieuSuaChuaPage.hinh_thuc')} options={loaiHinhOptions} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'idNhaCungCap']}
                                                label={t('phieuSuaChuaFormModal.nha_cung_cap_thuc')}
                                            >
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    filterOption={false}
                                                    onSearch={ncc.handleSearch}
                                                    loading={ncc.loading}
                                                    placeholder={t('donHangMuaSamPage.nha_cung_cap')}
                                                    options={ncc.options.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'tinhTrangThietBi']}
                                                label={t('phieuSuaChuaFormModal.tinh_trang_hong_hoc')}
                                                rules={[{ required: true, message: t('phieuSuaChuaFormModal.nhap_tinh_trang') }]}
                                            >
                                                <Input disabled={isView} placeholder={t('phieuSuaChuaFormModal.vi_du_hong_nguon')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'chiPhi']}
                                                label={t('phieuSuaChuaFormModal.chi_phi_du_kien')}
                                            >
                                                <InputNumber
                                                    disabled={isView}
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        {!isView && !selectedRecord && (
                                            <Col span={1} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
                                                <MinusCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && !selectedRecord && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm thiết bị cần sửa chữa
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                <Divider orientation={'left' as any}>{t('phieuSuaChuaFormModal.danh_sach_linh_kien')}</Divider>
                <Form.List name="danhSachLinhKien">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card size="small" key={key} style={{ marginBottom: 8 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'tenMauTaiSan']}
                                                label={t('phieuSuaChuaFormModal.linh_kien_thuc_the')}
                                                rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_linh_kien') }]}
                                            >
                                                <Select
                                                    disabled={isView || !!selectedRecord}
                                                    showSearch
                                                    filterOption={false}
                                                    onSearch={handleLinhKienSearch}
                                                    placeholder={t('phieuSuaChuaFormModal.chon_linh_kien')}
                                                    options={linhKienOptions.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'loaiHinhXuLy']}
                                                label={t('phieuSuaChuaFormModal.hinh_thuc_xu_ly')}
                                                rules={[{ required: true, message: t('phieuSuaChuaFormModal.chon_hinh_thuc') }]}
                                            >
                                                <Select disabled={isView} placeholder={t('phieuSuaChuaPage.hinh_thuc')} options={loaiHinhOptions} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'idNhaCungCap']}
                                                label={t('phieuSuaChuaFormModal.nha_cung_cap_thuc')}
                                            >
                                                <Select
                                                    disabled={isView}
                                                    showSearch
                                                    filterOption={false}
                                                    onSearch={ncc.handleSearch}
                                                    loading={ncc.loading}
                                                    placeholder={t('donHangMuaSamPage.nha_cung_cap')}
                                                    options={ncc.options.map(opt => ({ value: opt.id, label: opt.ten }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'tinhTrangThietBi']}
                                                label={t('phieuSuaChuaFormModal.tinh_trang_linh_kien')}
                                                rules={[{ required: true, message: t('phieuSuaChuaFormModal.nhap_tinh_trang') }]}
                                            >
                                                <Input disabled={isView} placeholder={t('phieuSuaChuaFormModal.vi_du_pin_chai')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'chiPhi']}
                                                label={t('phieuSuaChuaFormModal.chi_phi_du_kien')}
                                            >
                                                <InputNumber
                                                    disabled={isView}
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        {!isView && !selectedRecord && (
                                            <Col span={1} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
                                                <MinusCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} onClick={() => remove(name)} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            ))}
                            {!isView && !selectedRecord && (
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm linh kiện cần xử lý
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
