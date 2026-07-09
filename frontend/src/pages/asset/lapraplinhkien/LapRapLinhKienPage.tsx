import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select, Space } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, SafetyOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import {
  layDanhSach18,
  themMoi18,
  capNhatThaoDo,
} from '../../../api-generated/endpoints/lap-rap-linh-kien-controller/lap-rap-linh-kien-controller';
import { laySelectOptions1 } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-cung-controller/danh-sach-thiet-bi-phan-cung-controller';
import { laySelectOptions8 } from '../../../api-generated/endpoints/linh-kien-phan-cung-controller/linh-kien-phan-cung-controller';
import type { LapRapLinhKienResponse } from '../../../api-generated/models/lapRapLinhKienResponse';
import type { LapRapLinhKienRequest } from '../../../api-generated/models/lapRapLinhKienRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import { LapRapFormModal } from './LapRapLinhKienFormModal';

const { Title, Text } = Typography;

export const LapRapLinhKienPage: React.FC = observer(() => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [danhSach, setDanhSach] = useState<LapRapLinhKienResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter values
  const [thietBiId, setThietBiId] = useState<number | undefined>(undefined);
  const [linhKienId, setLinhKienId] = useState<number | undefined>(undefined);
  const [trangThaiLienKet, setTrangThaiLienKet] = useState<string | undefined>(undefined);

  // Dropdown options
  const [thietBiOptions, setThietBiOptions] = useState<SelectOption[]>([]);
  const [linhKienOptions, setLinhKienOptions] = useState<SelectOption[]>([]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);

  const taiDuLieu = async (page: number, size: number, filtersOverride?: any) => {
    setLoading(true);
    try {
      const res = await layDanhSach18({
        page: page - 1,
        size,
        // Dùng filter truyền vào (khi reset) hoặc dùng state hiện tại
        thietBiPhanCungId: filtersOverride && 'thietBiId' in filtersOverride ? filtersOverride.thietBiId : thietBiId,
        linhKienPhanCungId: filtersOverride && 'linhKienId' in filtersOverride ? filtersOverride.linhKienId : linhKienId,
        trangThaiLienKet: filtersOverride && 'trangThaiLienKet' in filtersOverride ? filtersOverride.trangThaiLienKet : (trangThaiLienKet || undefined),
      });
      if (res.data) {
        // Handle custom response wrappers
        const content = (res.data as any).content || [];
        const pageInfo = (res.data as any).page_info || {};
        setDanhSach(content);
        setTotalCount(pageInfo.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || t('lapRapLinhKienPage.khong_the_tai_lich'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [tbRes, lkRes] = await Promise.all([
          laySelectOptions1(),
          laySelectOptions8(),
        ]);
        if (tbRes.data) setThietBiOptions(tbRes.data);
        if (lkRes.data) setLinhKienOptions(lkRes.data);
      } catch (e) { }
    };
    fetchFilterOptions();
  }, []);

  // Bỏ các filter (thietBiId, linhKienId, trangThaiLienKet) ra khỏi dependencies
  // Chỉ tự động gọi API khi chuyển trang hoặc đổi số lượng bản ghi
  useEffect(() => {
    taiDuLieu(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Hành động bấm nút Tìm kiếm
  const handleSearch = () => {
    setCurrentPage(1);
    taiDuLieu(1, pageSize);
  };

  // Hành động bấm nút Làm mới
  const handleReset = () => {
    setThietBiId(undefined);
    setLinhKienId(undefined);
    setTrangThaiLienKet(undefined);
    setCurrentPage(1);

    // Gọi API với data rỗng thay vì chờ state cập nhật
    taiDuLieu(1, pageSize, {
      thietBiId: undefined,
      linhKienId: undefined,
      trangThaiLienKet: undefined
    });
  };

  const handleSaveForm = async (values: LapRapLinhKienRequest) => {
    try {
      const res = await themMoi18(values);
      const code = (res as any).code;
      if (code === 200 || (res && !code)) {
        message.success(t('lapRapLinhKienPage.thuc_hien_lap_rap'));
        setIsFormOpen(false);
        taiDuLieu(1, pageSize);
        // Refresh options since linkien might be linked now
        const lkRes = await laySelectOptions8();
        if (lkRes.data) setLinhKienOptions(lkRes.data);
      } else {
        message.error((res as any).message || t('lapRapLinhKienPage.lap_rap_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('lapRapLinhKienPage.loi_khi_ket_noi'));
    }
  };

  const handleThaoDo = async (id: number) => {
    try {
      const res = await capNhatThaoDo(id);
      const code = (res as any).code;
      if (code === 200 || res) {
        message.success(t('lapRapLinhKienPage.thao_do_linh_kien'));
        taiDuLieu(currentPage, pageSize);
        // Refresh options
        const lkRes = await laySelectOptions8();
        if (lkRes.data) setLinhKienOptions(lkRes.data);
      } else {
        message.error((res as any).message || t('lapRapLinhKienPage.thao_do_that_bai'));
      }
    } catch (e: any) {
      message.error(e?.message || t('lapRapLinhKienPage.khong_the_thao_do'));
    }
  };

  const renderLienKetStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Tag color="green">{t('lapRapLinhKienPage.dang_lien_ket_active')}</Tag>;
      case 'INACTIVE':
        return <Tag color="red">{t('lapRapLinhKienPage.da_thao_do_inactive')}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: t('lapRapLinhKienPage.thiet_bi_me_serial'),
      key: 'thietBiMe',
      sorter: (a: any, b: any) => (a.soSerialThietBi || '').localeCompare(b.soSerialThietBi || ''),
      render: (_: any, record: LapRapLienKetThaoDoResponse) => {
        return (
          <div>
            <div><Text strong>{record.soSerialThietBi || 'N/A'}</Text></div>
            <div><Text type="secondary">{t('lapRapLinhKienPage.recordmathetaisanthietbi_khong_co_the')}</Text></div>
          </div>
        );
      },
    },
    {
      title: t('lapRapLinhKienPage.linh_kien_con_serial'),
      dataIndex: 'soSerialLinhKien',
      key: 'soSerialLinhKien',
      sorter: (a: any, b: any) => (a.soSerialLinhKien || '').localeCompare(b.soSerialLinhKien || ''),
      defaultSortOrder: 'ascend' as const,
      render: (val: string) => <Text strong>{val}</Text>,
    },
    {
      title: t('lapRapLinhKienPage.thoi_gian_lap_rap'),
      dataIndex: 'thoiGianLap',
      key: 'thoiGianLap',
      width: 150,
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: t('lapRapLinhKienPage.thoi_gian_thao_do'),
      dataIndex: 'thoiGianThao',
      key: 'thoiGianThao',
      width: 150,
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: t('lapRapLinhKienPage.trang_thai_lien_ket'),
      dataIndex: 'trangThaiLienKet',
      key: 'trangThaiLienKet',
      width: 180,
      render: (val: string) => renderLienKetStatus(val),
    },
    {
      title: t('loaiTaiSanFormModal.ghi_chu'),
      dataIndex: 'ghiChu',
      key: 'ghiChu',
    },
    {
      title: t('viTriManagementPage.hanh_dong'),
      key: 'hanhDong',
      width: 120,
      render: (_: any, record: LapRapLienKetThaoDoResponse) => {
        const isLinked = record.trangThaiLienKet === 'ACTIVE';

        const items: any = [
          isLinked && authStore.kiemTraQuyen(QUYEN.SUA_LAP_RAP_LINH_KIEN)
            ? {
              key: 'disassemble',
              label: (
                <Popconfirm
                  title={t('lapRapLinhKienPage.xac_nhan_thao_do')}
                  description={t('lapRapLinhKienPage.ban_co_chac_chan')}
                  okText={t('lapRapLinhKienPage.xac_nhan_thao')}
                  cancelText={t('viTriManagementPage.huy')}
                  onConfirm={() => handleThaoDo(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>{t('lapRapLinhKienPage.thao_do')}</span>
                </Popconfirm>
              ),
              icon: <SafetyOutlined style={{ color: '#ff4d4f' }} />,
            }
            : null,
        ].filter(Boolean) as MenuProps['items'];

        if (!items || items.length === 0) return '-';

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button size="small">
              Thao tác <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  type LapRapLienKetThaoDoResponse = any; // type alias for mapping custom responses

  return (
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_LAP_RAP_LINH_KIEN}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý lắp ráp linh kiện
            </Title>
            <Text type="secondary">
              Quản lý lắp ráp nâng cấp hoặc tháo dỡ thu hồi linh kiện (RAM, HDD, SSD...) của thiết bị phần cứng.
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_LAP_RAP_LINH_KIEN}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsFormOpen(true)}
            >
              Thực hiện lắp ráp
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={7}>
              <Select
                placeholder={t('lapRapLinhKienPage.chon_thiet_bi_phan')}
                style={{ width: '100%' }}
                value={thietBiId}
                onChange={setThietBiId}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={thietBiOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Col>
            <Col xs={24} md={7}>
              <Select
                placeholder={t('lapRapLinhKienPage.chon_linh_kien_lap')}
                style={{ width: '100%' }}
                value={linhKienId}
                onChange={setLinhKienId}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={linhKienOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Col>
            <Col xs={24} md={5}>
              <Select
                placeholder={t('lapRapLinhKienPage.trang_thai_lien_ket')}
                style={{ width: '100%' }}
                value={trangThaiLienKet}
                onChange={setTrangThaiLienKet}
                allowClear
                options={[
                  { value: 'ACTIVE', label: t('lapRapLinhKienPage.dang_lien_ket') },
                  { value: 'INACTIVE', label: t('lapRapLinhKienPage.da_thao_do') },
                ]}
              />
            </Col>
            <Col xs={24} md={5}>
              <Space>
                <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
                  Tìm kiếm
                </Button>
                <Button onClick={handleReset}>
                  Làm mới
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            dataSource={danhSach}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalCount,
              onChange: (p, s) => {
                setCurrentPage(p);
                setPageSize(s);
              },
              showSizeChanger: true,
            }}
          />
        </Card>

        <LapRapFormModal
          open={isFormOpen}
          onCancel={() => setIsFormOpen(false)}
          onSave={handleSaveForm}
        />
      </div>
    </QuyenHanGuard>
  );
});

export default LapRapLinhKienPage;