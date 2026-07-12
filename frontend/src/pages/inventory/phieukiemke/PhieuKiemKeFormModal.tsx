import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Button, Row, Col, Tabs, Card, Input, Space, Divider, Typography } from 'antd';
import { PlusOutlined, MinusCircleOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { authStore } from '../../../stores/AuthStore';
import type { PhieuKiemKeResponse } from '../../../api-generated/models/phieuKiemKeResponse';
import type { PhieuKiemKeRequest } from '../../../api-generated/models/phieuKiemKeRequest';
import type { ExecuteKiemKeRequest } from '../../../api-generated/models/executeKiemKeRequest';
import type { LuaChonDotKiemKeResponse } from '../../../api-generated/models/luaChonDotKiemKeResponse';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import { layDotKiemKeKichHoat, layTaiSanTheoPhongBan } from '../../../api-generated/endpoints/phieu-kiem-ke-controller/phieu-kiem-ke-controller';
import { laySelectOptions4 as layPhongBanOptions } from '../../../api-generated/endpoints/phong-ban-controller/phong-ban-controller';
import { layDanhSach as layViTriOptions } from '../../../api-generated/endpoints/vi-tri-controller/vi-tri-controller';
import { laySelectOptions6 as layNguoiDungOptions } from '../../../api-generated/endpoints/nguoi-dung-controller/nguoi-dung-controller';
import { laySelectOptions1 as layThietBiPhanCungOptions } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-cung-controller/danh-sach-thiet-bi-phan-cung-controller';
import { laySelectOptions8 as layLinhKienPhanCungOptions } from '../../../api-generated/endpoints/linh-kien-phan-cung-controller/linh-kien-phan-cung-controller';
import { laySelectOptions as layPhanMemOptions } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-mem-controller/danh-sach-thiet-bi-phan-mem-controller';
import { useSearchableSelect } from '../../../hooks/useSearchableSelect';

const { Text } = Typography;

interface PhieuKiemKeFormModalProps {
    open: boolean;
    onCancel: () => void;
    selectedRecord: PhieuKiemKeResponse | null;
    mode: 'add' | 'edit' | 'view' | 'execute';
    onSaveBasic: (values: PhieuKiemKeRequest) => Promise<void>;
    onSaveExecute: (values: ExecuteKiemKeRequest) => Promise<void>;
    loading: boolean;
}

export const PhieuKiemKeFormModal: React.FC<PhieuKiemKeFormModalProps> = ({
    open,
    onCancel,
    selectedRecord,
    mode,
    onSaveBasic,
    onSaveExecute,
    loading,
}) => {
  const { t } = useTranslation();
    const [form] = Form.useForm<any>();
    const isView = mode === 'view';
    const isExecute = mode === 'execute';

    // Options dropdowns
    const [dotKiemKeKichHoat, setDotKiemKeKichHoat] = useState<LuaChonDotKiemKeResponse[]>([]);
    const phongBan = useSearchableSelect(layPhongBanOptions as any);
    const [viTriList, setViTriList] = useState<any[]>([]);
    const nguoiDung = useSearchableSelect(layNguoiDungOptions as any);

    // Dropdowns for Assets (used in execute mode when room is empty or custom adding is needed)
    const [thietBiOptions, setThietBiOptions] = useState<SelectOption[]>([]);
    const [linhKienOptions, setLinhKienOptions] = useState<SelectOption[]>([]);
    const [phanMemOptions, setPhanMemOptions] = useState<SelectOption[]>([]);

    useEffect(() => {
        if (open) {
            // Load base lists
            layDotKiemKeKichHoat().then(res => {
                if (res.data) setDotKiemKeKichHoat(res.data);
            }).catch(() => { });

            phongBan.fetchOptions().catch(() => { });

            layViTriOptions({ size: 1000 }).then(res => {
                if (res.data && (res.data as any).content) {
                    setViTriList((res.data as any).content);
                }
            }).catch(() => { });

            if (isExecute && selectedRecord) {
                nguoiDung.fetchOptions().catch(() => { });

                const details = selectedRecord.danhSachChiTiet || [];

                if (selectedRecord.idPhongBanKiemKe) {
                    layTaiSanTheoPhongBan({ idPhongBan: selectedRecord.idPhongBanKiemKe })
                        .then(res => {
                            if (res.data) {
                                // Merge hardware devices
                                const tbMap = new Map<number, string>();
                                details.filter(x => x.loaiTaiSan === 'THIET_BI').forEach(x => {
                                    if (x.id) tbMap.set(x.id, `[${x.maTheTaiSan || 'N/A'}] ${x.tenTaiSan} (S/N: ${x.soSerial || 'N/A'})`);
                                });
                                (res.data.danhSachPhanCung || []).forEach(x => {
                                    const detail = details.find(d => d.loaiTaiSan === 'THIET_BI' && d.idTaiSanGoc === x.idTaiSanGoc);
                                    const optId = detail ? detail.id! : x.idTaiSanGoc!;
                                    tbMap.set(optId, `[${x.maTheTaiSan || 'N/A'}] ${x.tenTaiSan} (S/N: ${x.soSerial || 'N/A'})`);
                                });
                                setThietBiOptions(Array.from(tbMap.entries()).map(([id, ten]) => ({ id, ten })));

                                // Merge components
                                const lkMap = new Map<number, string>();
                                details.filter(x => x.loaiTaiSan === 'LINH_KIEN').forEach(x => {
                                    if (x.id) lkMap.set(x.id, `${x.tenTaiSan} (S/N: ${x.soSerial || 'N/A'})`);
                                });
                                (res.data.danhSachLinhKien || []).forEach(x => {
                                    const detail = details.find(d => d.loaiTaiSan === 'LINH_KIEN' && d.idTaiSanGoc === x.idTaiSanGoc);
                                    const optId = detail ? detail.id! : x.idTaiSanGoc!;
                                    lkMap.set(optId, `${x.tenTaiSan} (S/N: ${x.soSerial || 'N/A'})`);
                                });
                                setLinhKienOptions(Array.from(lkMap.entries()).map(([id, ten]) => ({ id, ten })));

                                // Merge software
                                const pmMap = new Map<number, string>();
                                details.filter(x => x.loaiTaiSan === 'PHAN_MEM').forEach(x => {
                                    if (x.id) pmMap.set(x.id, `${x.tenTaiSan} (Key: ${x.soSerial || 'N/A'})`);
                                });
                                (res.data.danhSachPhanMem || []).forEach(x => {
                                    const detail = details.find(d => d.loaiTaiSan === 'PHAN_MEM' && d.idTaiSanGoc === x.idTaiSanGoc);
                                    const optId = detail ? detail.id! : x.idTaiSanGoc!;
                                    pmMap.set(optId, `${x.tenTaiSan} (Key: ${x.soSerial || 'N/A'})`);
                                });
                                setPhanMemOptions(Array.from(pmMap.entries()).map(([id, ten]) => ({ id, ten })));
                            }
                        })
                        .catch(() => {});
                } else {
                    // Initialize from details as base
                    const tbMap = new Map<number, string>();
                    details.filter(x => x.loaiTaiSan === 'THIET_BI').forEach(x => {
                        if (x.id) tbMap.set(x.id, `[${x.maTheTaiSan || 'N/A'}] ${x.tenTaiSan} (S/N: ${x.soSerial || 'N/A'})`);
                    });

                    const lkMap = new Map<number, string>();
                    details.filter(x => x.loaiTaiSan === 'LINH_KIEN').forEach(x => {
                        if (x.id) lkMap.set(x.id, `${x.tenTaiSan} (S/N: ${x.soSerial || 'N/A'})`);
                    });

                    const pmMap = new Map<number, string>();
                    details.filter(x => x.loaiTaiSan === 'PHAN_MEM').forEach(x => {
                        if (x.id) pmMap.set(x.id, `${x.tenTaiSan} (Key: ${x.soSerial || 'N/A'})`);
                    });

                    // Fetch unit-wide options and merge
                    layThietBiPhanCungOptions().then(res => {
                        if (res.data) {
                            res.data.forEach(x => {
                                const detail = details.find(d => d.loaiTaiSan === 'THIET_BI' && d.idTaiSanGoc === x.id);
                                const optId = detail ? detail.id! : x.id!;
                                tbMap.set(optId, x.ten || t('phieuSuaChuaFormModal.thiet_bi_phan_cung'));
                            });
                            setThietBiOptions(Array.from(tbMap.entries()).map(([id, ten]) => ({ id, ten })));
                        }
                    }).catch(() => { });

                    layLinhKienPhanCungOptions().then(res => {
                        if (res.data) {
                            res.data.forEach(x => {
                                const detail = details.find(d => d.loaiTaiSan === 'LINH_KIEN' && d.idTaiSanGoc === x.id);
                                const optId = detail ? detail.id! : x.id!;
                                lkMap.set(optId, x.ten || t('phieuCapPhatFormModal.linh_kien_phan_cung'));
                            });
                            setLinhKienOptions(Array.from(lkMap.entries()).map(([id, ten]) => ({ id, ten })));
                        }
                    }).catch(() => { });

                    layPhanMemOptions().then(res => {
                        if (res.data) {
                            res.data.forEach(x => {
                                const detail = details.find(d => d.loaiTaiSan === 'PHAN_MEM' && d.idTaiSanGoc === x.id);
                                const optId = detail ? detail.id! : x.id!;
                                pmMap.set(optId, x.ten || t('phieuThanhLyFormModal.ban_quyen_phan_mem'));
                            });
                            setPhanMemOptions(Array.from(pmMap.entries()).map(([id, ten]) => ({ id, ten })));
                        }
                    }).catch(() => { });
                }
            }

            if (selectedRecord) {
                if (isExecute) {
                    // Populate Form arrays for execution mode
                    const details = selectedRecord.danhSachChiTiet || [];
                    const danhSachThietBi = details.filter(x => x.loaiTaiSan === 'THIET_BI').map(x => ({
                        idChiTiet: x.id,
                        tinhTrangThucTe: x.tinhTrangHoacBanQuyen,
                        ketLuan: x.ketLuan || 'KHOP',
                        ghiChu: x.ghiChu,
                        idNhanVienSuDungThucTe: undefined, // default
                    }));
                    const danhSachLinhKien = details.filter(x => x.loaiTaiSan === 'LINH_KIEN').map(x => ({
                        idChiTiet: x.id,
                        viTriThucTe: x.viTriHoacThietBiCaiDat,
                        tinhTrangThucTe: x.tinhTrangHoacBanQuyen,
                        ketLuan: x.ketLuan || 'KHOP',
                        ghiChu: x.ghiChu,
                    }));
                    const danhSachPhanMem = details.filter(x => x.loaiTaiSan === 'PHAN_MEM').map(x => ({
                        idChiTiet: x.id,
                        trangThaiBanQuyen: x.tinhTrangHoacBanQuyen || 'ACTIVE',
                        ketLuan: x.ketLuan || 'KHOP',
                        ghiChu: x.ghiChu,
                    }));

                    form.setFieldsValue({
                        danhSachThietBi,
                        danhSachLinhKien,
                        danhSachPhanMem,
                    });
                } else {
                    // Populate basic form
                    form.setFieldsValue({
                        dotKiemKeId: selectedRecord.dotKiemKeId,
                        idPhongBanKiemKe: selectedRecord.idPhongBanKiemKe,
                        // idKhoKiemKe: selectedRecord.idKhoKiemKe,
                    });
                }
            } else {
                form.resetFields();
                // Set default department from current user
                if (authStore.currentUserProfile?.idPhongBan) {
                    form.setFieldsValue({
                        idPhongBanKiemKe: authStore.currentUserProfile.idPhongBan,
                    });
                }
            }
        }
    }, [open, selectedRecord, form, isExecute]);

    const handleSaveBasicClick = async () => {
        try {
            const values = await form.validateFields();
            await onSaveBasic(values);
        } catch (e) {
            // Validate fail
        }
    };

    const handleSaveExecuteClick = async (submit: boolean) => {
        try {
            const values = await form.validateFields();
            const payload: ExecuteKiemKeRequest = {
                isSubmit: submit,
                danhSachThietBi: values.danhSachThietBi || [],
                danhSachLinhKien: values.danhSachLinhKien || [],
                danhSachPhanMem: values.danhSachPhanMem || [],
            };
            await onSaveExecute(payload);
        } catch (e) {
            // Validate fail
        }
    };

    const getTitle = () => {
        if (isExecute) return t('phieuKiemKeFormModal.thuc_hien_doi_soat_hien', { maPhieuKiemKe: selectedRecord?.maPhieuKiemKe });
        if (isView) return t('phieuKiemKeFormModal.chi_tiet_phieu_kiem');
        return selectedRecord ? t('phieuKiemKeFormModal.cap_nhat_phieu_kiem') : t('phieuKiemKeFormModal.lap_phieu_kiem_ke');
    };

    // Helper to render asset label by idChiTiet or fallback
    const getAssetLabel = (idChiTiet: number, type: 'THIET_BI' | 'LINH_KIEN' | 'PHAN_MEM') => {
        const item = selectedRecord?.danhSachChiTiet?.find(x => x.id === idChiTiet);
        if (item) {
            return `[S/N: ${item.soSerial || 'N/A'}] ${item.tenTaiSan}`;
        }
        return t('phieuKiemKeFormModal.tai_san_khong_xac');
    };

    return (
        <Modal
            title={getTitle()}
            open={open}
            onCancel={onCancel}
            confirmLoading={loading}
            footer={
                isExecute ? [
                    <Button key="cancel" onClick={onCancel} disabled={loading}>{t('appLayout.cancel')}</Button>,
                    <Button key="draft" icon={<SaveOutlined />} onClick={() => handleSaveExecuteClick(false)} loading={loading}>
                        Lưu nháp tiến độ
                    </Button>,
                    <Button key="submit" type="primary" icon={<SendOutlined />} onClick={() => handleSaveExecuteClick(true)} loading={loading}>
                        Gửi báo cáo hoàn thành
                    </Button>
                ] : isView ? [
                    <Button key="close" onClick={onCancel}>{t('phieuNhapTaiSanFormModal.dong')}</Button>
                ] : [
                    <Button key="cancel" onClick={onCancel} disabled={loading}>{t('appLayout.cancel')}</Button>,
                    <Button key="submit" type="primary" onClick={handleSaveBasicClick} loading={loading}>
                        {selectedRecord ? t('phieuNhapTaiSanFormModal.luu_cap_nhat') : t('phieuThuHoiFormModal.tao_phieu')}
                    </Button>
                ]
            }
            width={isExecute ? 950 : 600}
            style={{ top: isExecute ? 20 : 80 }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                {!isExecute ? (
                    <>
                        <Form.Item
                            name="dotKiemKeId"
                            label={t('phieuKiemKeFormModal.dot_kiem_ke_tong')}
                            rules={[{ required: true, message: t('phieuKiemKeFormModal.vui_long_chon_dot') }]}
                        >
                            <Select disabled={isView || !!selectedRecord} placeholder={t('phieuKiemKeFormModal.chon_dot_kiem_ke')}>
                                {dotKiemKeKichHoat.map(opt => (
                                    <Select.Option key={opt.id} value={opt.id}>{opt.label}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="idPhongBanKiemKe"
                            label={t('phieuKiemKeFormModal.phong_ban_kiem_ke')}
                        >
                            <Select
                                disabled
                                placeholder={t('phieuKiemKeFormModal.tu_dong_nhan_dien')}
                                showSearch
                                filterOption={false}
                                onSearch={phongBan.handleSearch}
                                loading={phongBan.loading}
                                options={phongBan.options.map(pb => ({ value: pb.id, label: pb.ten }))}
                            />
                        </Form.Item>

                        {/* <Form.Item name="idKhoKiemKe" label={t('phieuKiemKeFormModal.vi_tri_kho_doi')}>
                            <Select disabled={isView} placeholder={t('phieuKiemKeFormModal.chon_vi_tri_kho')} allowClear>
                                {viTriList.map(vt => (
                                    <Select.Option key={vt.id} value={vt.id}>{vt.tenViTri}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item> */}
                    </>
                ) : (
                    <Tabs defaultActiveKey="1" style={{ minHeight: 400 }}>
                        <Tabs.TabPane tab={t('phieuKiemKeFormModal.1_thiet_bi_phan')} key="1">
                            <Form.List name="danhSachThietBi">
                                {(fields) => (
                                    <>
                                        {fields.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>{t('phieuKiemKeFormModal.khong_co_thiet_bi')}</div>}
                                        {fields.map(({ key, name, ...restField }) => {
                                            const idChiTiet = form.getFieldValue(['danhSachThietBi', name, 'idChiTiet']);
                                            return (
                                                <Card size="small" key={key} style={{ marginBottom: 12, borderLeft: '4px solid #1890ff' }}>
                                                    <Row gutter={12}>
                                                        <Col span={24}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'idChiTiet']}
                                                                label={t('phieuKiemKeFormModal.thiet_bi_phan_cung')}
                                                                rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_thiet_bi') }]}
                                                            >
                                                                <Select placeholder={t('phieuKiemKeFormModal.chon_thiet_bi')} disabled={isView}>
                                                                    {thietBiOptions.map(opt => (
                                                                        <Select.Option key={opt.id} value={opt.id}>{opt.ten}</Select.Option>
                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>

                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'tinhTrangThucTe']}
                                                                label={t('phieuKiemKeFormModal.tinh_trang_thuc_te')}
                                                            >
                                                                <Input placeholder={t('phieuKiemKeFormModal.tot_hong_khac')} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'ketLuan']}
                                                                label={t('phieuKiemKeFormModal.ket_luan_doi_soat')}
                                                                rules={[{ required: true, message: t('phieuKiemKeFormModal.chon_ket_luan') }]}
                                                            >
                                                                <Select>
                                                                    <Select.Option value="KHOP">{t('phieuKiemKeFormModal.khop_khop')}</Select.Option>
                                                                    <Select.Option value="THIEU_HUT">{t('phieuKiemKeFormModal.thieu_hut_thuc_te')}</Select.Option>
                                                                    <Select.Option value="SAI_VI_TRI">{t('phieuKiemKeFormModal.sai_vi_tri')}</Select.Option>
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'idNhanVienSuDungThucTe']}
                                                                label={t('phieuKiemKeFormModal.nhan_vien_su_dung')}
                                                            >
                                                                <Select
                                                                      placeholder={t('phieuKiemKeFormModal.chon_nhan_vien')}
                                                                      allowClear
                                                                      showSearch
                                                                      filterOption={false}
                                                                      onSearch={nguoiDung.handleSearch}
                                                                      loading={nguoiDung.loading}
                                                                      options={nguoiDung.options.map(nd => ({ value: nd.id, label: nd.ten }))}
                                                                  />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'ghiChu']}
                                                                label={t('loaiTaiSanFormModal.ghi_chu')}
                                                            >
                                                                <Input placeholder={t('phieuKiemKeFormModal.nhap_ghi_chu_them')} />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            );
                                        })}
                                    </>
                                )}
                            </Form.List>
                        </Tabs.TabPane>

                        <Tabs.TabPane tab={t('phieuKiemKeFormModal.2_linh_kien_phan')} key="2">
                            <Form.List name="danhSachLinhKien">
                                {(fields) => (
                                    <>
                                        {fields.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>{t('phieuKiemKeFormModal.khong_co_linh_kien')}</div>}
                                        {fields.map(({ key, name, ...restField }) => {
                                            const idChiTiet = form.getFieldValue(['danhSachLinhKien', name, 'idChiTiet']);
                                            return (
                                                <Card size="small" key={key} style={{ marginBottom: 12, borderLeft: '4px solid #722ed1' }}>
                                                    <Row gutter={12}>
                                                        <Col span={24}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'idChiTiet']}
                                                                label={t('phieuKiemKeFormModal.linh_kien_doi_soat')}
                                                                rules={[{ required: true, message: t('phieuNhapTaiSanFormModal.chon_linh_kien') }]}
                                                            >
                                                                <Select placeholder={t('phieuKiemKeFormModal.chon_linh_kien')} disabled={isView}>
                                                                    {linhKienOptions.map(opt => (
                                                                        <Select.Option key={opt.id} value={opt.id}>{opt.ten}</Select.Option>
                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>

                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'tinhTrangThucTe']}
                                                                label={t('phieuKiemKeFormModal.tinh_trang_thuc_te')}
                                                            >
                                                                <Input placeholder={t('phieuKiemKeFormModal.tot_hong_thao_do')} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'viTriThucTe']}
                                                                label={t('phieuKiemKeFormModal.vi_tri_thuc_te')}
                                                            >
                                                                <Input placeholder={t('phieuKiemKeFormModal.vi_du_may_chu')} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'ketLuan']}
                                                                label={t('phieuKiemKeFormModal.ket_luan_doi_soat')}
                                                                rules={[{ required: true, message: t('phieuKiemKeFormModal.chon_ket_luan') }]}
                                                            >
                                                                <Select>
                                                                    <Select.Option value="KHOP">{t('phieuKiemKeFormModal.khop_khop')}</Select.Option>
                                                                    <Select.Option value="THIEU_HUT">{t('phieuKiemKeFormModal.thieu_hut_thuc_te')}</Select.Option>
                                                                    <Select.Option value="SAI_VI_TRI">{t('phieuKiemKeFormModal.sai_vi_tri')}</Select.Option>
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'ghiChu']}
                                                                label={t('loaiTaiSanFormModal.ghi_chu')}
                                                            >
                                                                <Input placeholder={t('phieuKiemKeFormModal.nhap_ghi_chu_them')} />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            );
                                        })}
                                    </>
                                )}
                            </Form.List>
                        </Tabs.TabPane>

                        <Tabs.TabPane tab={t('phieuKiemKeFormModal.3_ban_quyen_phan')} key="3">
                            <Form.List name="danhSachPhanMem">
                                {(fields) => (
                                    <>
                                        {fields.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>{t('phieuKiemKeFormModal.khong_co_ban_quyen')}</div>}
                                        {fields.map(({ key, name, ...restField }) => {
                                            const idChiTiet = form.getFieldValue(['danhSachPhanMem', name, 'idChiTiet']);
                                            return (
                                                <Card size="small" key={key} style={{ marginBottom: 12, borderLeft: '4px solid #52c41a' }}>
                                                    <Row gutter={12}>
                                                        <Col span={24}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'idChiTiet']}
                                                                label={t('phieuKiemKeFormModal.ban_quyen_phan_mem')}
                                                                rules={[{ required: true, message: t('donHangMuaSamFormModal.chon_phan_mem') }]}
                                                            >
                                                                <Select placeholder={t('phieuKiemKeFormModal.chon_phan_mem')} disabled={isView}>
                                                                    {phanMemOptions.map(opt => (
                                                                        <Select.Option key={opt.id} value={opt.id}>{opt.ten}</Select.Option>
                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>

                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'trangThaiBanQuyen']}
                                                                label={t('phieuKiemKeFormModal.trang_thai_ban_quyen')}
                                                                rules={[{ required: true, message: t('phieuKiemKeFormModal.chon_trang_thai') }]}
                                                            >
                                                                <Select>
                                                                    <Select.Option value="ACTIVE">{t('phieuKiemKeFormModal.hoat_dong_active')}</Select.Option>
                                                                    <Select.Option value="EXPIRED">{t('phieuKiemKeFormModal.het_han_expired')}</Select.Option>
                                                                    <Select.Option value="ILLEGAL">{t('phieuKiemKeFormModal.khong_hop_le_vi')}</Select.Option>
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'ketLuan']}
                                                                label={t('phieuKiemKeFormModal.ket_luan_doi_soat')}
                                                                rules={[{ required: true, message: t('phieuKiemKeFormModal.chon_ket_luan') }]}
                                                            >
                                                                <Select>
                                                                    <Select.Option value="KHOP">{t('phieuKiemKeFormModal.khop_khop')}</Select.Option>
                                                                    <Select.Option value="THIEU_HUT">{t('phieuKiemKeFormModal.thieu_hut_khong_su')}</Select.Option>
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'ghiChu']}
                                                                label={t('loaiTaiSanFormModal.ghi_chu')}
                                                            >
                                                                <Input placeholder={t('phieuKiemKeFormModal.nhap_ghi_chu_them')} />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            );
                                        })}
                                    </>
                                )}
                            </Form.List>
                        </Tabs.TabPane>
                    </Tabs>
                )}
            </Form>
        </Modal>
    );
};
