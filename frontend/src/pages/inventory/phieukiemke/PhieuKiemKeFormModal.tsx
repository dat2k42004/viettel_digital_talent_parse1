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
    const [form] = Form.useForm<any>();
    const isView = mode === 'view';
    const isExecute = mode === 'execute';

    // Options dropdowns
    const [dotKiemKeKichHoat, setDotKiemKeKichHoat] = useState<LuaChonDotKiemKeResponse[]>([]);
    const [phongBanList, setPhongBanList] = useState<SelectOption[]>([]);
    const [viTriList, setViTriList] = useState<any[]>([]);
    const [nguoiDungList, setNguoiDungList] = useState<SelectOption[]>([]);

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

            layPhongBanOptions().then(res => {
                if (res.data) setPhongBanList(res.data);
            }).catch(() => { });

            layViTriOptions({ size: 1000 }).then(res => {
                if (res.data && (res.data as any).content) {
                    setViTriList((res.data as any).content);
                }
            }).catch(() => { });

            if (isExecute && selectedRecord) {
                layNguoiDungOptions().then(res => {
                    if (res.data) setNguoiDungList(res.data);
                }).catch(() => { });

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
                                tbMap.set(optId, x.ten || 'Thiết bị phần cứng');
                            });
                            setThietBiOptions(Array.from(tbMap.entries()).map(([id, ten]) => ({ id, ten })));
                        }
                    }).catch(() => { });

                    layLinhKienPhanCungOptions().then(res => {
                        if (res.data) {
                            res.data.forEach(x => {
                                const detail = details.find(d => d.loaiTaiSan === 'LINH_KIEN' && d.idTaiSanGoc === x.id);
                                const optId = detail ? detail.id! : x.id!;
                                lkMap.set(optId, x.ten || 'Linh kiện phần cứng');
                            });
                            setLinhKienOptions(Array.from(lkMap.entries()).map(([id, ten]) => ({ id, ten })));
                        }
                    }).catch(() => { });

                    layPhanMemOptions().then(res => {
                        if (res.data) {
                            res.data.forEach(x => {
                                const detail = details.find(d => d.loaiTaiSan === 'PHAN_MEM' && d.idTaiSanGoc === x.id);
                                const optId = detail ? detail.id! : x.id!;
                                pmMap.set(optId, x.ten || 'Bản quyền phần mềm');
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
        if (isExecute) return `Thực hiện đối soát hiện trường phiếu: ${selectedRecord?.maPhieuKiemKe}`;
        if (isView) return 'Chi tiết Phiếu kiểm kê tài sản';
        return selectedRecord ? 'Cập nhật Phiếu kiểm kê tài sản' : 'Lập Phiếu kiểm kê tài sản mới';
    };

    // Helper to render asset label by idChiTiet or fallback
    const getAssetLabel = (idChiTiet: number, type: 'THIET_BI' | 'LINH_KIEN' | 'PHAN_MEM') => {
        const item = selectedRecord?.danhSachChiTiet?.find(x => x.id === idChiTiet);
        if (item) {
            return `[S/N: ${item.soSerial || 'N/A'}] ${item.tenTaiSan}`;
        }
        return 'Tài sản không xác định';
    };

    return (
        <Modal
            title={getTitle()}
            open={open}
            onCancel={onCancel}
            confirmLoading={loading}
            footer={
                isExecute ? [
                    <Button key="cancel" onClick={onCancel} disabled={loading}>Hủy bỏ</Button>,
                    <Button key="draft" icon={<SaveOutlined />} onClick={() => handleSaveExecuteClick(false)} loading={loading}>
                        Lưu nháp tiến độ
                    </Button>,
                    <Button key="submit" type="primary" icon={<SendOutlined />} onClick={() => handleSaveExecuteClick(true)} loading={loading}>
                        Gửi báo cáo hoàn thành
                    </Button>
                ] : isView ? [
                    <Button key="close" onClick={onCancel}>Đóng</Button>
                ] : [
                    <Button key="cancel" onClick={onCancel} disabled={loading}>Hủy bỏ</Button>,
                    <Button key="submit" type="primary" onClick={handleSaveBasicClick} loading={loading}>
                        {selectedRecord ? 'Lưu cập nhật' : 'Tạo phiếu'}
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
                            label="Đợt kiểm kê tổng hợp (đang kích hoạt)"
                            rules={[{ required: true, message: 'Vui lòng chọn đợt kiểm kê!' }]}
                        >
                            <Select disabled={isView || !!selectedRecord} placeholder="Chọn đợt kiểm kê">
                                {dotKiemKeKichHoat.map(opt => (
                                    <Select.Option key={opt.id} value={opt.id}>{opt.label}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="idPhongBanKiemKe"
                            label="Phòng ban kiểm kê"
                        >
                            <Select disabled placeholder="Tự động nhận diện theo tài khoản của bạn">
                                {phongBanList.map(pb => (
                                    <Select.Option key={pb.id} value={pb.id}>{pb.ten}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* <Form.Item name="idKhoKiemKe" label="Vị trí kho đối soát (Tùy chọn)">
                            <Select disabled={isView} placeholder="Chọn vị trí kho vật lý" allowClear>
                                {viTriList.map(vt => (
                                    <Select.Option key={vt.id} value={vt.id}>{vt.tenViTri}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item> */}
                    </>
                ) : (
                    <Tabs defaultActiveKey="1" style={{ minHeight: 400 }}>
                        <Tabs.TabPane tab="1. Thiết bị phần cứng" key="1">
                            <Form.List name="danhSachThietBi">
                                {(fields) => (
                                    <>
                                        {fields.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>Không có thiết bị phần cứng nào cần kiểm kê trong phòng ban này.</div>}
                                        {fields.map(({ key, name, ...restField }) => {
                                            const idChiTiet = form.getFieldValue(['danhSachThietBi', name, 'idChiTiet']);
                                            return (
                                                <Card size="small" key={key} style={{ marginBottom: 12, borderLeft: '4px solid #1890ff' }}>
                                                    <Row gutter={12}>
                                                        <Col span={24}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'idChiTiet']}
                                                                label="Thiết bị phần cứng đối soát"
                                                                rules={[{ required: true, message: 'Chọn thiết bị!' }]}
                                                            >
                                                                <Select placeholder="Chọn thiết bị..." disabled={isView}>
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
                                                                label="Tình trạng thực tế"
                                                            >
                                                                <Input placeholder="Tốt / Hỏng / Khác..." />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'ketLuan']}
                                                                label="Kết luận đối soát"
                                                                rules={[{ required: true, message: 'Chọn kết luận!' }]}
                                                            >
                                                                <Select>
                                                                    <Select.Option value="KHOP">Khớp khớp</Select.Option>
                                                                    <Select.Option value="THIEU_HUT">Thiếu hụt thực tế</Select.Option>
                                                                    <Select.Option value="SAI_VI_TRI">Sai vị trí</Select.Option>
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'idNhanVienSuDungThucTe']}
                                                                label="Nhân viên sử dụng"
                                                            >
                                                                <Select placeholder="Chọn nhân viên" allowClear showSearch optionFilterProp="label">
                                                                    {nguoiDungList.map(nd => (
                                                                        <Select.Option key={nd.id} value={nd.id} label={nd.ten}>{nd.ten}</Select.Option>
                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'ghiChu']}
                                                                label="Ghi chú"
                                                            >
                                                                <Input placeholder="Nhập ghi chú thêm..." />
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

                        <Tabs.TabPane tab="2. Linh kiện phần cứng rời" key="2">
                            <Form.List name="danhSachLinhKien">
                                {(fields) => (
                                    <>
                                        {fields.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>Không có linh kiện nào cần kiểm kê trong phòng ban này.</div>}
                                        {fields.map(({ key, name, ...restField }) => {
                                            const idChiTiet = form.getFieldValue(['danhSachLinhKien', name, 'idChiTiet']);
                                            return (
                                                <Card size="small" key={key} style={{ marginBottom: 12, borderLeft: '4px solid #722ed1' }}>
                                                    <Row gutter={12}>
                                                        <Col span={24}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'idChiTiet']}
                                                                label="Linh kiện đối soát"
                                                                rules={[{ required: true, message: 'Chọn linh kiện!' }]}
                                                            >
                                                                <Select placeholder="Chọn linh kiện..." disabled={isView}>
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
                                                                label="Tình trạng thực tế"
                                                            >
                                                                <Input placeholder="Tốt / Hỏng / Tháo dỡ..." />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'viTriThucTe']}
                                                                label="Vị trí thực tế lắp đặt"
                                                            >
                                                                <Input placeholder="Ví dụ: Máy chủ PC01..." />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'ketLuan']}
                                                                label="Kết luận đối soát"
                                                                rules={[{ required: true, message: 'Chọn kết luận!' }]}
                                                            >
                                                                <Select>
                                                                    <Select.Option value="KHOP">Khớp khớp</Select.Option>
                                                                    <Select.Option value="THIEU_HUT">Thiếu hụt thực tế</Select.Option>
                                                                    <Select.Option value="SAI_VI_TRI">Sai vị trí</Select.Option>
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'ghiChu']}
                                                                label="Ghi chú"
                                                            >
                                                                <Input placeholder="Nhập ghi chú thêm..." />
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

                        <Tabs.TabPane tab="3. Bản quyền phần mềm" key="3">
                            <Form.List name="danhSachPhanMem">
                                {(fields) => (
                                    <>
                                        {fields.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>Không có bản quyền phần mềm nào cần kiểm kê trong phòng ban này.</div>}
                                        {fields.map(({ key, name, ...restField }) => {
                                            const idChiTiet = form.getFieldValue(['danhSachPhanMem', name, 'idChiTiet']);
                                            return (
                                                <Card size="small" key={key} style={{ marginBottom: 12, borderLeft: '4px solid #52c41a' }}>
                                                    <Row gutter={12}>
                                                        <Col span={24}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'idChiTiet']}
                                                                label="Bản quyền phần mềm đối soát"
                                                                rules={[{ required: true, message: 'Chọn phần mềm!' }]}
                                                            >
                                                                <Select placeholder="Chọn phần mềm..." disabled={isView}>
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
                                                                label="Trạng thái bản quyền thực tế"
                                                                rules={[{ required: true, message: 'Chọn trạng thái!' }]}
                                                            >
                                                                <Select>
                                                                    <Select.Option value="ACTIVE">Hoạt động (Active)</Select.Option>
                                                                    <Select.Option value="EXPIRED">Hết hạn (Expired)</Select.Option>
                                                                    <Select.Option value="ILLEGAL">Không hợp lệ / Vi phạm (Illegal)</Select.Option>
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'ketLuan']}
                                                                label="Kết luận đối soát"
                                                                rules={[{ required: true, message: 'Chọn kết luận!' }]}
                                                            >
                                                                <Select>
                                                                    <Select.Option value="KHOP">Khớp khớp</Select.Option>
                                                                    <Select.Option value="THIEU_HUT">Thiếu hụt / Không sử dụng</Select.Option>
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'ghiChu']}
                                                                label="Ghi chú"
                                                            >
                                                                <Input placeholder="Nhập ghi chú thêm..." />
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
