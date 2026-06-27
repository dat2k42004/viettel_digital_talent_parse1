import React, { useState } from 'react';
import { Card, Row, Col, List, Tag, Button, Modal, Input, Table, Typography, Form, Space, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../components/protected/QuyenHanGuard';

const { Title, Paragraph, Text } = Typography;

export type LoaiPhieu = 'CAP_PHAT' | 'THU_HOI' | 'DIEU_CHUYEN' | 'THANH_LY';
export type TrangThaiPhieu = 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI' | 'HOAN_THANH';
export type TrangThaiVanHanh = 'HOAT_DONG' | 'KHOA' | 'CAP_PHAT';

interface ThietBiTrongPhieu {
  id: number;
  tenThietBi: string;
  soSerial: string;
  maTheTaiSan: string;
  trangThaiVanHanh: TrangThaiVanHanh;
}

interface ChungTu {
  id: number;
  maPhieu: string;
  loaiPhieu: LoaiPhieu;
  tenNguoiLap: string;
  tenNguoiNhan: string;
  trangThai: TrangThaiPhieu;
  ngayTao: string;
  lyDoTuChoi?: string;
  danhSachThietBi: ThietBiTrongPhieu[];
}

export const LifecyclePage: React.FC = observer(() => {
  const [danhSachChungTu, setDanhSachChungTu] = useState<ChungTu[]>([
    {
      id: 1,
      maPhieu: 'CP-2026-0001',
      loaiPhieu: 'CAP_PHAT',
      tenNguoiLap: 'Nguyen Van IT',
      tenNguoiNhan: 'Tran Van Nhan Vien A',
      trangThai: 'CHO_DUYET',
      ngayTao: '2026-06-27',
      danhSachThietBi: [
        { id: 101, tenThietBi: 'Laptop Dell Latitude 7420', soSerial: 'DELL7420XX', maTheTaiSan: 'TS-001', trangThaiVanHanh: 'KHOA' },
        { id: 102, tenThietBi: 'Màn hình Dell UltraSharp 24', soSerial: 'DELL-US-24', maTheTaiSan: 'TS-002', trangThaiVanHanh: 'KHOA' }
      ],
    },
    {
      id: 2,
      maPhieu: 'TH-2026-0002',
      loaiPhieu: 'THU_HOI',
      tenNguoiLap: 'Nguyen Van IT',
      tenNguoiNhan: 'Le Thi Nhan Vien B',
      trangThai: 'DA_DUYET',
      ngayTao: '2026-06-25',
      danhSachThietBi: [
        { id: 103, tenThietBi: 'Laptop HP ProBook 440 G8', soSerial: 'HP440G8YY', maTheTaiSan: 'TS-003', trangThaiVanHanh: 'CAP_PHAT' }
      ],
    },
    {
      id: 3,
      maPhieu: 'DC-2026-0003',
      loaiPhieu: 'DIEU_CHUYEN',
      tenNguoiLap: 'Tran Thi Admin',
      tenNguoiNhan: 'Phòng Kế Hoạch',
      trangThai: 'TU_CHOI',
      ngayTao: '2026-06-24',
      lyDoTuChoi: 'Thiết bị vẫn còn đang sử dụng để làm dự án quan trọng, không thể điều chuyển lúc này.',
      danhSachThietBi: [
        { id: 104, tenThietBi: 'MacBook Air M1', soSerial: 'APPLEAIRM1', maTheTaiSan: 'TS-004', trangThaiVanHanh: 'HOAT_DONG' }
      ],
    }
  ]);

  const [phieuDangChon, setPhieuDangChon] = useState<ChungTu | null>(danhSachChungTu[0]);
  const [modalTuChoiOpen, setModalTuChoiOpen] = useState(false);
  const [formTuChoi] = Form.useForm();

  const handlePheDuyet = (id: number) => {
    setDanhSachChungTu(prev =>
      prev.map(ct => {
        if (ct.id === id) {
          return {
            ...ct,
            trangThai: 'DA_DUYET',
            danhSachThietBi: ct.danhSachThietBi.map(tb => ({
              ...tb,
              trangThaiVanHanh: ct.loaiPhieu === 'THU_HOI' ? 'HOAT_DONG' : 'CAP_PHAT',
            })),
          };
        }
        return ct;
      })
    );

    const updated = danhSachChungTu.find(c => c.id === id);
    if (updated) {
      setPhieuDangChon({
        ...updated,
        trangThai: 'DA_DUYET',
        danhSachThietBi: updated.danhSachThietBi.map(tb => ({
          ...tb,
          trangThaiVanHanh: updated.loaiPhieu === 'THU_HOI' ? 'HOAT_DONG' : 'CAP_PHAT',
        })),
      });
    }

    message.success(`Đã phê duyệt chứng từ thành công. Trạng thái thiết bị cập nhật tương ứng.`);
  };

  const handleOpenTuChoi = () => {
    setModalTuChoiOpen(true);
  };

  const handleXacNhanTuChoi = (values: { lyDoTuChoi: string }) => {
    if (!phieuDangChon) return;

    const id = phieuDangChon.id;
    setDanhSachChungTu(prev =>
      prev.map(ct => {
        if (ct.id === id) {
          return {
            ...ct,
            trangThai: 'TU_CHOI',
            lyDoTuChoi: values.lyDoTuChoi,
            danhSachThietBi: ct.danhSachThietBi.map(tb => ({
              ...tb,
              trangThaiVanHanh: 'HOAT_DONG',
            })),
          };
        }
        return ct;
      })
    );

    setPhieuDangChon(prev => {
      if (!prev) return null;
      return {
        ...prev,
        trangThai: 'TU_CHOI',
        lyDoTuChoi: values.lyDoTuChoi,
        danhSachThietBi: prev.danhSachThietBi.map(tb => ({
          ...tb,
          trangThaiVanHanh: 'HOAT_DONG',
        })),
      };
    });

    message.warning(`Đã từ chối phê duyệt chứng từ ${phieuDangChon.maPhieu}. Đã Rollback thiết bị về trạng thái HOAT_DONG.`);
    setModalTuChoiOpen(false);
    formTuChoi.resetFields();
  };

  const layTagMauChungTu = (trangThai: TrangThaiPhieu) => {
    const maps: Record<TrangThaiPhieu, string> = {
      CHO_DUYET: 'orange',
      DA_DUYET: 'green',
      TU_CHOI: 'red',
      HOAN_THANH: 'blue',
    };
    return maps[trangThai] || 'default';
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý vòng đời tài sản (Chứng từ)</Title>
        <Paragraph type="secondary">
          Vận hành luồng đi của chứng từ cấp phát, thu hồi, điều chuyển nội bộ và thanh lý tài sản.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        {/* Left Column: Master List */}
        <Col xs={24} md={10}>
          <Card title="Danh sách chứng từ đề xuất" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <List
              itemLayout="horizontal"
              dataSource={danhSachChungTu}
              renderItem={(item) => (
                <List.Item
                  onClick={() => setPhieuDangChon(item)}
                  style={{
                    cursor: 'pointer',
                    padding: '12px 16px',
                    borderRadius: 4,
                    marginBottom: 8,
                    background: phieuDangChon?.id === item.id ? '#f0f5ff' : 'transparent',
                    border: phieuDangChon?.id === item.id ? '1px solid #adc6ff' : '1px solid #f0f0f0',
                    transition: 'all 0.3s',
                  }}
                >
                  <List.Item.Meta
                    title={<Text strong>{item.maPhieu}</Text>}
                    description={
                      <Space direction="vertical" size={2}>
                        <Text type="secondary">Loại phiếu: <Tag color="blue">{item.loaiPhieu}</Tag></Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>Ngày lập: {item.ngayTao}</Text>
                      </Space>
                    }
                  />
                  <div>
                    <Tag color={layTagMauChungTu(item.trangThai)}>{item.trangThai}</Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Right Column: Details Pane */}
        <Col xs={24} md={14}>
          {phieuDangChon ? (
            <Card
              title={`Chi tiết chứng từ: ${phieuDangChon.maPhieu}`}
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div style={{ marginBottom: 20 }}>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Text type="secondary">Người lập: </Text>
                    <Text strong>{phieuDangChon.tenNguoiLap}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Người nhận bàn giao: </Text>
                    <Text strong>{phieuDangChon.tenNguoiNhan}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Ngày đề xuất: </Text>
                    <Text>{phieuDangChon.ngayTao}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Trạng thái phiếu: </Text>
                    <Tag color={layTagMauChungTu(phieuDangChon.trangThai)}>{phieuDangChon.trangThai}</Tag>
                  </Col>
                </Row>
              </div>

              {/* Show warning rollback detail log if voucher was rejected */}
              {phieuDangChon.trangThai === 'TU_CHOI' && (
                <Card
                  type="inner"
                  title={<Text type="danger" strong>Thông báo từ chối duyệt (Rollback log)</Text>}
                  style={{ marginBottom: 20, background: '#fff2f0', borderColor: '#ffccc7' }}
                >
                  <Paragraph style={{ margin: 0, color: '#ff4d4f' }}>
                    {phieuDangChon.lyDoTuChoi}
                  </Paragraph>
                </Card>
              )}

              <Title level={5} style={{ marginBottom: 12 }}>Danh sách máy móc linh kiện đi kèm</Title>
              <Table
                dataSource={phieuDangChon.danhSachThietBi}
                rowKey="id"
                pagination={false}
                columns={[
                  { title: 'Mã TSCN', dataIndex: 'maTheTaiSan', key: 'maTheTaiSan' },
                  { title: 'Tên thiết bị', dataIndex: 'tenThietBi', key: 'tenThietBi' },
                  { title: 'Số Serial', dataIndex: 'soSerial', key: 'soSerial' },
                  {
                    title: 'Trạng thái vận hành',
                    dataIndex: 'trangThaiVanHanh',
                    key: 'trangThaiVanHanh',
                    render: (val: string) => {
                      const colors: Record<string, string> = {
                        KHOA: 'red',
                        HOAT_DONG: 'cyan',
                        CAP_PHAT: 'green',
                      };
                      return <Tag color={colors[val] || 'default'}>{val}</Tag>;
                    },
                  },
                ]}
              />

              {phieuDangChon.trangThai === 'CHO_DUYET' && (
                <div style={{ marginTop: 24, textAlign: 'right' }}>
                  <QuyenHanGuard quyenYeuCau="THAO_TAC_TAI_SAN">
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => handlePheDuyet(phieuDangChon.id)}
                      >
                        Phê duyệt chứng từ
                      </Button>
                      <Button
                        type="primary"
                        danger
                        onClick={handleOpenTuChoi}
                      >
                        Từ chối phê duyệt
                      </Button>
                    </Space>
                  </QuyenHanGuard>
                </div>
              )}
            </Card>
          ) : (
            <Card style={{ textAlign: 'center', color: '#999', padding: 48 }}>
              Chọn chứng từ ở danh sách bên trái để hiển thị chi tiết.
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal form từ chối duyệt bắt buộc nhập lý do phục vụ rollback DB */}
      <Modal
        title="Từ chối phê duyệt chứng từ"
        open={modalTuChoiOpen}
        onCancel={() => setModalTuChoiOpen(false)}
        footer={null}
      >
        <Form form={formTuChoi} onFinish={handleXacNhanTuChoi} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="lyDoTuChoi"
            label="Lý do từ chối phê duyệt (Bắt buộc)"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối để rollback trạng thái thiết bị!' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập lý do để khôi phục máy móc từ KHOA về HOAT_DONG dưới cơ sở dữ liệu..."
            />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalTuChoiOpen(false)}>Hủy</Button>
              <Button type="primary" danger htmlType="submit">
                Xác nhận từ chối
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

export default LifecyclePage;
