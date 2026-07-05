import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Typography, message, Row, Col, Select, DatePicker, Tabs, Form, Input, Divider } from 'antd';
import { SearchOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined, ApartmentOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { authStore, QUYEN } from '../../stores/AuthStore';
import { axiosInstance } from '../../api/axiosInstance';
import {
  layBaoCaoTonKho,
  layBaoCaoCapPhat,
  layBaoCaoBaoTri,
  layTongHopToanSanSuperAdmin
} from '../../api-generated/endpoints/bao-cao-controller/bao-cao-controller';
import { laySelectOptions4 as layPhongBanOptions } from '../../api-generated/endpoints/phong-ban-controller/phong-ban-controller';
import { layDanhSach as layViTriDanhSach } from '../../api-generated/endpoints/vi-tri-controller/vi-tri-controller';

import type { BaoCaoTonKhoResponse } from '../../api-generated/models/baoCaoTonKhoResponse';
import type { BaoCaoCapPhatResponse } from '../../api-generated/models/baoCaoCapPhatResponse';
import type { BaoCaoBaoTriResponse } from '../../api-generated/models/baoCaoBaoTriResponse';
import type { BaoCaoToanSanSuperAdminResponse } from '../../api-generated/models/baoCaoToanSanSuperAdminResponse';
import type { SelectOption } from '../../api-generated/models/selectOption';
import type { ViTriResponse } from '../../api-generated/models/viTriResponse';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const BaoCaoPage: React.FC = observer(() => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('TON_KHO');

  // State loading & data
  const [loading, setLoading] = useState<boolean>(false);
  const [phongBanList, setPhongBanList] = useState<SelectOption[]>([]);
  const [viTriList, setViTriList] = useState<ViTriResponse[]>([]);

  // Dữ liệu báo cáo
  const [dataTonKho, setDataTonKho] = useState<BaoCaoTonKhoResponse[]>([]);
  const [dataCapPhat, setDataCapPhat] = useState<BaoCaoCapPhatResponse[]>([]);
  const [dataBaoTri, setDataBaoTri] = useState<BaoCaoBaoTriResponse[]>([]);
  const [dataToanSan, setDataToanSan] = useState<BaoCaoToanSanSuperAdminResponse[]>([]);

  // Phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Load dropdown options
  useEffect(() => {
    if (authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO)) {
      layPhongBanOptions()
        .then((res) => {
          if (res.data) setPhongBanList(res.data);
        })
        .catch(() => {});

      layViTriDanhSach({ page: 0, size: 1000 })
        .then((res) => {
          if (res.data && res.data.content) {
            setViTriList(res.data.content);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Xác định tab active mặc định khi vào trang dựa trên quyền hạn
  useEffect(() => {
    if (!authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO) && authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN)) {
      setActiveTab('TOAN_SAN');
    } else {
      setActiveTab('TON_KHO');
    }
  }, []);

  // Gọi API tải dữ liệu báo cáo
  const taiDuLieuBaoCao = async (page: number, size: number, tabKey: string) => {
    setLoading(true);
    const filterValues = form.getFieldsValue();
    const [tuNgay, denNgay] = filterValues.rangePicker || [];

    const requestParams: any = {
      idPhongBan: filterValues.idPhongBan || undefined,
      idViTri: filterValues.idViTri || undefined,
      tuNgay: tuNgay ? dayjs(tuNgay).format('YYYY-MM-DD') : undefined,
      denNgay: denNgay ? dayjs(denNgay).format('YYYY-MM-DD') : undefined,
      tuKhoaTimKiem: filterValues.tuKhoaTimKiem || undefined,
    };

    try {
      if (tabKey === 'TON_KHO') {
        const res = await layBaoCaoTonKho({
          request: { loaiBaoCao: 'TON_KHO', ...requestParams },
          page: page - 1,
          size,
        });
        if (res.code === 200 && res.data) {
          setDataTonKho((res.data as any).content || []);
          setTotalElements((res.data as any).page_info?.total_elements || 0);
        }
      } else if (tabKey === 'CAP_PHAT') {
        const res = await layBaoCaoCapPhat({
          request: { loaiBaoCao: 'CAP_PHAT', ...requestParams },
          page: page - 1,
          size,
        });
        if (res.code === 200 && res.data) {
          setDataCapPhat((res.data as any).content || []);
          setTotalElements((res.data as any).page_info?.total_elements || 0);
        }
      } else if (tabKey === 'BAO_TRI') {
        const res = await layBaoCaoBaoTri({
          request: { loaiBaoCao: 'BAO_TRI', ...requestParams },
          page: page - 1,
          size,
        });
        if (res.code === 200 && res.data) {
          setDataBaoTri((res.data as any).content || []);
          setTotalElements((res.data as any).page_info?.total_elements || 0);
        }
      } else if (tabKey === 'TOAN_SAN') {
        const res = await layTongHopToanSanSuperAdmin({
          page: page - 1,
          size,
        });
        if (res.code === 200 && res.data) {
          setDataToanSan((res.data as any).content || []);
          setTotalElements((res.data as any).page_info?.total_elements || 0);
        }
      }
    } catch (error: any) {
      message.error(error?.message || 'Không thể lấy dữ liệu báo cáo!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    taiDuLieuBaoCao(currentPage, pageSize, activeTab);
  }, [currentPage, pageSize, activeTab]);

  const handleTimKiem = () => {
    setCurrentPage(1);
    taiDuLieuBaoCao(1, pageSize, activeTab);
  };

  const handleLamMoi = () => {
    form.resetFields();
    setCurrentPage(1);
    taiDuLieuBaoCao(1, pageSize, activeTab);
  };

  // Xuất file báo cáo đơn vị (Excel / PDF)
  const handleXuatFile = async (dinhDangFile: 'xlsx' | 'pdf') => {
    setLoading(true);
    const filterValues = form.getFieldsValue();
    const [tuNgay, denNgay] = filterValues.rangePicker || [];

    const params = {
      loaiBaoCao: activeTab,
      idPhongBan: filterValues.idPhongBan || undefined,
      idViTri: filterValues.idViTri || undefined,
      tuNgay: tuNgay ? dayjs(tuNgay).format('YYYY-MM-DD') : undefined,
      denNgay: denNgay ? dayjs(denNgay).format('YYYY-MM-DD') : undefined,
      tuKhoaTimKiem: filterValues.tuKhoaTimKiem || undefined,
    };

    try {
      const response = await axiosInstance.get('/api/bao-cao/xuat-file', {
        params: {
          request: params,
          dinhDangFile: dinhDangFile.toUpperCase(),
        },
        responseType: 'blob',
      });

      const fileExtension = dinhDangFile === 'xlsx' ? '.xlsx' : '.pdf';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bao_cao_${activeTab.toLowerCase()}_${dayjs().format('YYYYMMDD_HHmmss')}${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success(`Xuất file báo cáo dạng ${dinhDangFile.toUpperCase()} thành công!`);
    } catch (error: any) {
      message.error(error?.message || 'Có lỗi xảy ra khi xuất file báo cáo!');
    } finally {
      setLoading(false);
    }
  };

  // Xuất file tổng hợp toàn sản cho Super Admin
  const handleXuatFileToanSan = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/bao-cao/toan-san/xuat-file', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bao_cao_toan_san_superadmin_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Xuất báo cáo toàn sản thành công!');
    } catch (error: any) {
      message.error(error?.message || 'Có lỗi xảy ra khi xuất báo cáo toàn sản!');
    } finally {
      setLoading(false);
    }
  };

  // Định nghĩa các cột cho Table Tồn Kho
  const columnsTonKho = [
    { title: 'Mã danh mục', dataIndex: 'maTaiSanDanhMuc', key: 'maTaiSanDanhMuc', render: (val: string) => <Text strong>{val}</Text> },
    { title: 'Tên danh mục tài sản', dataIndex: 'tenTaiSanDanhMuc', key: 'tenTaiSanDanhMuc' },
    {
      title: 'Loại tài sản',
      dataIndex: 'loaiTaiSan',
      key: 'loaiTaiSan',
      render: (val: string) => {
        const color = val === 'PHAN_CUNG' ? 'blue' : val === 'LINH_KIEN' ? 'purple' : 'orange';
        return <Tag color={color}>{val}</Tag>;
      },
    },
    { title: 'Vị trí kho', dataIndex: 'tenViTri', key: 'tenViTri', render: (val: string) => val || 'Chưa xác định' },
    {
      title: 'Số lượng tồn',
      dataIndex: 'soLuongTonKho',
      key: 'soLuongTonKho',
      render: (val: number) => <Tag color={val > 0 ? 'green' : 'red'} style={{ fontSize: 14 }}>{val}</Tag>,
    },
    {
      title: 'Cập nhật cuối',
      dataIndex: 'thoiGianCapNhat',
      key: 'thoiGianCapNhat',
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—',
    },
  ];

  // Hàng mở rộng cho Table Tồn Kho (Chi tiết các tài sản cụ thể)
  const expandedRowTonKho = (record: BaoCaoTonKhoResponse) => {
    const detailColumns = [
      { title: 'Mã thẻ tài sản', dataIndex: 'maTheTaiSan', key: 'maTheTaiSan', render: (val: string) => <Text copyable>{val}</Text> },
      { title: 'Tên tài sản cụ thể', dataIndex: 'tenTaiSanCuThe', key: 'tenTaiSanCuThe' },
      { title: 'Số Serial', dataIndex: 'soSerial', key: 'soSerial', render: (val: string) => val || '—' },
      { title: 'Vị trí cụ thể', dataIndex: 'viTriKho', key: 'viTriKho' },
      {
        title: 'Trạng thái',
        dataIndex: 'trangThai',
        key: 'trangThai',
        render: (val: string) => {
          let color = 'default';
          if (val === 'SAN_SANG') color = 'green';
          else if (val === 'DANG_CAP_PHAT') color = 'blue';
          else if (val === 'BAO_TRI') color = 'orange';
          else if (val === 'HONG') color = 'red';
          return <Tag color={color}>{val}</Tag>;
        },
      },
      { title: 'Đợt kiểm kê gần nhất', dataIndex: 'tenDotKiemKeGanNhat', key: 'tenDotKiemKeGanNhat', render: (val: string) => val || 'Chưa kiểm kê' },
      { title: 'Ghi chú', dataIndex: 'ghiChu', key: 'ghiChu', render: (val: string) => val || '—' },
      {
        title: 'Thời gian ghi nhận',
        dataIndex: 'thoiGianGhiNhan',
        key: 'thoiGianGhiNhan',
        render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—',
      },
    ];

    return (
      <Table
        columns={detailColumns}
        dataSource={record.danhSachChiTiet || []}
        pagination={false}
        size="small"
        bordered
        rowKey="id"
      />
    );
  };

  // Định nghĩa các cột cho Table Cấp Phát
  const columnsCapPhat = [
    { title: 'Mã danh mục', dataIndex: 'maTaiSanDanhMuc', key: 'maTaiSanDanhMuc', render: (val: string) => <Text strong>{val}</Text> },
    { title: 'Tên danh mục tài sản', dataIndex: 'tenTaiSanDanhMuc', key: 'tenTaiSanDanhMuc' },
    { title: 'Phòng ban nhận', dataIndex: 'tenPhongBan', key: 'tenPhongBan' },
    {
      title: 'Loại tài sản',
      dataIndex: 'loaiTaiSan',
      key: 'loaiTaiSan',
      render: (val: string) => {
        const color = val === 'PHAN_CUNG' ? 'blue' : val === 'LINH_KIEN' ? 'purple' : 'orange';
        return <Tag color={color}>{val}</Tag>;
      },
    },
    { title: 'Số lượng cấp', dataIndex: 'soLuongCap', key: 'soLuongCap', render: (val: number) => <Text strong>{val}</Text> },
    {
      title: 'Tổng giá trị cấp',
      dataIndex: 'tongGiaTriCap',
      key: 'tongGiaTriCap',
      render: (val: number) => <Text type="danger" strong>{val ? val.toLocaleString('vi-VN') + ' VND' : '0 VND'}</Text>,
    },
    {
      title: 'Thời gian cấp',
      dataIndex: 'thoiGianCapNhat',
      key: 'thoiGianCapNhat',
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—',
    },
  ];

  // Hàng mở rộng cho Table Cấp Phát (Chi tiết sử dụng của nhân viên)
  const expandedRowCapPhat = (record: BaoCaoCapPhatResponse) => {
    const detailColumns = [
      { title: 'Mã thẻ tài sản', dataIndex: 'maTheTaiSan', key: 'maTheTaiSan', render: (val: string) => <Text copyable>{val}</Text> },
      { title: 'Tên tài sản cụ thể', dataIndex: 'tenTaiSanCuThe', key: 'tenTaiSanCuThe' },
      { title: 'Số Serial', dataIndex: 'soSerial', key: 'soSerial', render: (val: string) => val || '—' },
      { title: 'Nhân viên tiếp nhận', dataIndex: 'hoTenNhanVienTiepNhan', key: 'hoTenNhanVienTiepNhan' },
      { title: 'Mã chứng từ gốc', dataIndex: 'maChungTuGoc', key: 'maChungTuGoc', render: (val: string) => val || '—' },
      { title: 'Tình trạng bàn giao', dataIndex: 'tinhTrangBanGiao', key: 'tinhTrangBanGiao', render: (val: string) => val || 'Bình thường' },
      {
        title: 'Thời gian bàn giao',
        dataIndex: 'thoiGianThucHien',
        key: 'thoiGianThucHien',
        render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—',
      },
    ];

    return (
      <Table
        columns={detailColumns}
        dataSource={record.danhSachChiTiet || []}
        pagination={false}
        size="small"
        bordered
        rowKey="id"
      />
    );
  };

  // Định nghĩa các cột cho Table Bảo Trì
  const columnsBaoTri = [
    { title: 'Mã danh mục', dataIndex: 'maTaiSanDanhMuc', key: 'maTaiSanDanhMuc', render: (val: string) => <Text strong>{val}</Text> },
    { title: 'Tên danh mục tài sản', dataIndex: 'tenTaiSanDanhMuc', key: 'tenTaiSanDanhMuc' },
    {
      title: 'Loại tài sản',
      dataIndex: 'loaiTaiSan',
      key: 'loaiTaiSan',
      render: (val: string) => {
        const color = val === 'PHAN_CUNG' ? 'blue' : val === 'LINH_KIEN' ? 'purple' : 'orange';
        return <Tag color={color}>{val}</Tag>;
      },
    },
    { title: 'Số lượng bảo trì', dataIndex: 'soLuong', key: 'soLuong' },
    {
      title: 'Tổng chi phí bảo trì',
      dataIndex: 'tongChiPhi',
      key: 'tongChiPhi',
      render: (val: number) => <Text type="danger" strong>{val ? val.toLocaleString('vi-VN') + ' VND' : '0 VND'}</Text>,
    },
    {
      title: 'Tổng thời gian gián đoạn',
      dataIndex: 'tongThoiGian',
      key: 'tongThoiGian',
      render: (val: number) => <Tag color="warning">{val ? `${val} giờ` : '0 giờ'}</Tag>,
    },
    {
      title: 'Cập nhật cuối',
      dataIndex: 'thoiGianCapNhat',
      key: 'thoiGianCapNhat',
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—',
    },
  ];

  // Hàng mở rộng cho Table Bảo Trì (Chi tiết lịch sử sửa chữa/bảo trì)
  const expandedRowBaoTri = (record: BaoCaoBaoTriResponse) => {
    const detailColumns = [
      { title: 'Mã thẻ tài sản', dataIndex: 'maTheTaiSan', key: 'maTheTaiSan', render: (val: string) => <Text copyable>{val}</Text> },
      { title: 'Tên tài sản cụ thể', dataIndex: 'tenTaiSanCuThe', key: 'tenTaiSanCuThe' },
      { title: 'Mã phiếu sửa chữa', dataIndex: 'maPhieuSuaChua', key: 'maPhieuSuaChua' },
      {
        title: 'Chi phí thực tế',
        dataIndex: 'chiPhiThucTe',
        key: 'chiPhiThucTe',
        render: (val: number) => <Text strong>{val ? val.toLocaleString('vi-VN') + ' VND' : '—'}</Text>,
      },
      { title: 'Thời gian gián đoạn', dataIndex: 'thoiGianGianDoan', key: 'thoiGianGianDoan', render: (val: number) => val ? `${val} giờ` : '—' },
      { title: 'Nội dung khắc phục', dataIndex: 'noiDungKhacPhuc', key: 'noiDungKhacPhuc', render: (val: string) => val || '—' },
      {
        title: 'Thời gian nghiệm thu',
        dataIndex: 'thoiGianNghiemThu',
        key: 'thoiGianNghiemThu',
        render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—',
      },
    ];

    return (
      <Table
        columns={detailColumns}
        dataSource={record.danhSachChiTiet || []}
        pagination={false}
        size="small"
        bordered
        rowKey="id"
      />
    );
  };

  // Định nghĩa các cột cho Table Toàn Sản (Super Admin)
  const columnsToanSan = [
    { title: 'ID Đơn vị', dataIndex: 'idDonVi', key: 'idDonVi', render: (val: number) => <Text strong>{val}</Text> },
    { title: 'Tên đơn vị (Tenant)', dataIndex: 'tenDonVi', key: 'tenDonVi', render: (val: string) => <Text type="secondary" strong>{val}</Text> },
    {
      title: 'Tổng số lượng phần cứng',
      dataIndex: 'tongSoLuongPhanCung',
      key: 'tongSoLuongPhanCung',
      render: (val: number) => <Tag color="blue">{val || 0}</Tag>,
    },
    {
      title: 'Tổng số lượng phần mềm',
      dataIndex: 'tongSoLuongPhanMem',
      key: 'tongSoLuongPhanMem',
      render: (val: number) => <Tag color="orange">{val || 0}</Tag>,
    },
    {
      title: 'Tổng giá trị ước tính',
      dataIndex: 'tongGiaTriUocTinhVnd',
      key: 'tongGiaTriUocTinhVnd',
      render: (val: number) => <Text type="danger" strong>{val ? val.toLocaleString('vi-VN') + ' VND' : '0 VND'}</Text>,
    },
  ];

  // Render content theo tab
  const renderTableContent = () => {
    const commonPagination = {
      current: currentPage,
      pageSize: pageSize,
      total: totalElements,
      showSizeChanger: true,
      pageSizeOptions: ['5', '10', '20', '50'],
      onChange: (page: number, size: number) => {
        setCurrentPage(page);
        setPageSize(size);
      },
    };

    switch (activeTab) {
      case 'TON_KHO':
        return (
          <Table
            columns={columnsTonKho}
            dataSource={dataTonKho}
            loading={loading}
            pagination={commonPagination}
            expandable={{
              expandedRowRender: expandedRowTonKho,
              rowExpandable: (record) => !!record.danhSachChiTiet && record.danhSachChiTiet.length > 0,
            }}
            rowKey="id"
            bordered
          />
        );
      case 'CAP_PHAT':
        return (
          <Table
            columns={columnsCapPhat}
            dataSource={dataCapPhat}
            loading={loading}
            pagination={commonPagination}
            expandable={{
              expandedRowRender: expandedRowCapPhat,
              rowExpandable: (record) => !!record.danhSachChiTiet && record.danhSachChiTiet.length > 0,
            }}
            rowKey="id"
            bordered
          />
        );
      case 'BAO_TRI':
        return (
          <Table
            columns={columnsBaoTri}
            dataSource={dataBaoTri}
            loading={loading}
            pagination={commonPagination}
            expandable={{
              expandedRowRender: expandedRowBaoTri,
              rowExpandable: (record) => !!record.danhSachChiTiet && record.danhSachChiTiet.length > 0,
            }}
            rowKey="id"
            bordered
          />
        );
      case 'TOAN_SAN':
        return (
          <Table
            columns={columnsToanSan}
            dataSource={dataToanSan}
            loading={loading}
            pagination={commonPagination}
            rowKey="idDonVi"
            bordered
          />
        );
      default:
        return null;
    }
  };

  // Các tabs được phân quyền hiển thị
  const items = [];
  if (authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO)) {
    items.push(
      { key: 'TON_KHO', label: 'Báo cáo tồn kho' },
      { key: 'CAP_PHAT', label: 'Báo cáo cấp phát' },
      { key: 'BAO_TRI', label: 'Báo cáo sửa chữa & bảo trì' }
    );
  }
  if (authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN)) {
    items.push({ key: 'TOAN_SAN', label: 'Tổng hợp toàn sản hệ thống (SuperAdmin)' });
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Hệ thống Báo cáo & Thống kê tài sản
          </Title>
          <Text type="secondary">
            Tổng hợp dữ liệu tồn kho, phân bổ cấp phát, sửa chữa bảo trì, và giá trị tài sản trong đơn vị.
          </Text>
        </div>
        {activeTab === 'TOAN_SAN' ? (
          authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN) && (
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleXuatFileToanSan}
              loading={loading}
              style={{ background: '#107c41', borderColor: '#107c41' }}
            >
              Xuất Excel Toàn Sản
            </Button>
          )
        ) : (
          authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO) && (
            <Space>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={() => handleXuatFile('xlsx')}
                loading={loading}
                style={{ background: '#107c41', borderColor: '#107c41' }}
              >
                Xuất Excel
              </Button>
              <Button
                type="primary"
                danger
                icon={<FilePdfOutlined />}
                onClick={() => handleXuatFile('pdf')}
                loading={loading}
              >
                Xuất PDF
              </Button>
            </Space>
          )
        )}
      </div>

      {/* FILTER PANEL */}
      {activeTab !== 'TOAN_SAN' && authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO) && (
        <Card style={{ marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <Form form={form} layout="vertical" onFinish={handleTimKiem}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="idPhongBan" label="Lọc theo Phòng ban">
                  <Select
                    placeholder="Chọn phòng ban nhận"
                    allowClear
                    suffixIcon={<ApartmentOutlined />}
                    options={phongBanList.map((x) => ({ value: x.id, label: x.ten }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="idViTri" label="Lọc theo Vị trí / Kho">
                  <Select
                    placeholder="Chọn vị trí lưu trữ"
                    allowClear
                    suffixIcon={<EnvironmentOutlined />}
                    options={viTriList.map((x) => ({ value: x.id, label: x.tenViTri }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="rangePicker" label="Thời gian giao dịch">
                  <RangePicker style={{ width: '100%' }} placeholder={['Từ ngày', 'Đến ngày']} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="tuKhoaTimKiem" label="Tìm theo Tag / Serial">
                  <Input placeholder="Mã Asset Tag, Số Serial..." prefix={<SearchOutlined />} allowClear />
                </Form.Item>
              </Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            <Row justify="end">
              <Space>
                <Button icon={<ReloadOutlined />} onClick={handleLamMoi}>
                  Đặt lại bộ lọc
                </Button>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit" loading={loading}>
                  Áp dụng bộ lọc
                </Button>
              </Space>
            </Row>
          </Form>
        </Card>
      )}

      {/* TABS CONTAINER */}
      <Card style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setCurrentPage(1);
          }}
          items={items}
        />
        <div style={{ marginTop: 16 }}>{renderTableContent()}</div>
      </Card>
    </div>
  );
});

export default BaoCaoPage;
