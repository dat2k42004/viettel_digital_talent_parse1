import { useTranslation } from 'react-i18next';
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
import { layDanhSach29 as layDanhSachDonVi } from '../../api-generated/endpoints/don-vi-controller/don-vi-controller';

import type { BaoCaoTonKhoResponse } from '../../api-generated/models/baoCaoTonKhoResponse';
import type { BaoCaoCapPhatResponse } from '../../api-generated/models/baoCaoCapPhatResponse';
import type { BaoCaoBaoTriResponse } from '../../api-generated/models/baoCaoBaoTriResponse';
import type { BaoCaoToanSanSuperAdminResponse } from '../../api-generated/models/baoCaoToanSanSuperAdminResponse';
import type { SelectOption } from '../../api-generated/models/selectOption';
import type { ViTriResponse } from '../../api-generated/models/viTriResponse';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const BaoCaoPage: React.FC = observer(() => {
  const { t } = useTranslation();
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

  // State danh sách đơn vị của Super Admin
  const [donViList, setDonViList] = useState<any[]>([]);
  const selectedDonViId = Form.useWatch('idDonVi', form);

  // Load danh sách đơn vị nếu là Super Admin
  useEffect(() => {
    if (authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN)) {
      layDanhSachDonVi({ page: 0, size: 1000 })
        .then((res) => {
          if (res && res.data && res.data.content) {
            setDonViList(res.data.content);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Load dropdown options
  useEffect(() => {
    const laSuperAdmin = authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN);
    const coTheTaiOptions = authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO) || (laSuperAdmin && selectedDonViId);

    if (coTheTaiOptions) {
      const optionParams = laSuperAdmin ? { idDonVi: selectedDonViId } : {};

      layPhongBanOptions(optionParams)
        .then((res) => {
          if (res.data) setPhongBanList(res.data);
        })
        .catch(() => {
          setPhongBanList([]);
        });

      layViTriDanhSach({ page: 0, size: 1000, ...optionParams })
        .then((res) => {
          if (res.data && res.data.content) {
            setViTriList(res.data.content);
          }
        })
        .catch(() => {
          setViTriList([]);
        });
    } else {
      setPhongBanList([]);
      setViTriList([]);
    }
  }, [selectedDonViId]);

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
      idDonVi: filterValues.idDonVi || undefined,
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
      message.error(error?.message || t('baoCaoPage.khong_the_lay_du'));
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
      idDonVi: filterValues.idDonVi || undefined,
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
      message.success(t('baoCaoPage.xuat_file_bao_cao_dang', { toUpperCase: dinhDangFile.toUpperCase() }));
    } catch (error: any) {
      message.error(error?.message || t('baoCaoPage.co_loi_xay_ra_khi_xuat_file_bao_cao'));
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
      message.success(t('baoCaoPage.xuat_bao_cao_toan'));
    } catch (error: any) {
      message.error(error?.message || t('baoCaoPage.co_loi_xay_ra'));
    } finally {
      setLoading(false);
    }
  };

  // Định nghĩa các cột cho Table Tồn Kho
  const columnsTonKho = [
    { title: t('baoCaoPage.ma_danh_muc'), dataIndex: 'maTaiSanDanhMuc', key: 'maTaiSanDanhMuc', render: (val: string) => <Text strong>{val}</Text> },
    { title: t('baoCaoPage.ten_danh_muc_tai'), dataIndex: 'tenTaiSanDanhMuc', key: 'tenTaiSanDanhMuc' },
    {
      title: t('baoCaoPage.loai_tai_san'),
      dataIndex: 'loaiTaiSan',
      key: 'loaiTaiSan',
      render: (val: string) => {
        const color = val === 'PHAN_CUNG' ? 'blue' : val === 'LINH_KIEN' ? 'purple' : 'orange';
        return <Tag color={color}>{val}</Tag>;
      },
    },
    { title: t('baoCaoPage.vi_tri_kho'), dataIndex: 'tenViTri', key: 'tenViTri', render: (val: string) => val || t('baoCaoPage.chua_xac_dinh') },
    {
      title: t('baoCaoPage.so_luong_ton'),
      dataIndex: 'soLuongTonKho',
      key: 'soLuongTonKho',
      render: (val: number) => <Tag color={val > 0 ? 'green' : 'red'} style={{ fontSize: 14 }}>{val}</Tag>,
    },
    {
      title: t('baoCaoPage.cap_nhat_cuoi'),
      dataIndex: 'thoiGianCapNhat',
      key: 'thoiGianCapNhat',
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—',
    },
  ];

  // Hàng mở rộng cho Table Tồn Kho (Chi tiết các tài sản cụ thể)
  const expandedRowTonKho = (record: BaoCaoTonKhoResponse) => {
    const detailColumns = [
      { title: t('baoCaoPage.ma_the_tai_san'), dataIndex: 'maTheTaiSan', key: 'maTheTaiSan', render: (val: string) => <Text copyable>{val}</Text> },
      { title: t('baoCaoPage.ten_tai_san_cu'), dataIndex: 'tenTaiSanCuThe', key: 'tenTaiSanCuThe' },
      { title: t('baoCaoPage.so_serial'), dataIndex: 'soSerial', key: 'soSerial', render: (val: string) => val || '—' },
      { title: t('baoCaoPage.vi_tri_cu_the'), dataIndex: 'viTriKho', key: 'viTriKho' },
      {
        title: t('loaiTaiSanFormModal.trang_thai'),
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
      { title: t('baoCaoPage.dot_kiem_ke_gan'), dataIndex: 'tenDotKiemKeGanNhat', key: 'tenDotKiemKeGanNhat', render: (val: string) => val || t('baoCaoPage.chua_kiem_ke') },
      { title: t('loaiTaiSanFormModal.ghi_chu'), dataIndex: 'ghiChu', key: 'ghiChu', render: (val: string) => val || '—' },
      {
        title: t('baoCaoPage.thoi_gian_ghi_nhan'),
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
    { title: t('baoCaoPage.ma_danh_muc'), dataIndex: 'maTaiSanDanhMuc', key: 'maTaiSanDanhMuc', render: (val: string) => <Text strong>{val}</Text> },
    { title: t('baoCaoPage.ten_danh_muc_tai'), dataIndex: 'tenTaiSanDanhMuc', key: 'tenTaiSanDanhMuc' },
    { title: t('phieuCapPhatPage.phong_ban_nhan'), dataIndex: 'tenPhongBan', key: 'tenPhongBan' },
    {
      title: t('baoCaoPage.loai_tai_san'),
      dataIndex: 'loaiTaiSan',
      key: 'loaiTaiSan',
      render: (val: string) => {
        const color = val === 'PHAN_CUNG' ? 'blue' : val === 'LINH_KIEN' ? 'purple' : 'orange';
        return <Tag color={color}>{val}</Tag>;
      },
    },
    { title: t('baoCaoPage.so_luong_cap'), dataIndex: 'soLuongCap', key: 'soLuongCap', render: (val: number) => <Text strong>{val}</Text> },
    {
      title: t('baoCaoPage.tong_gia_tri_cap'),
      dataIndex: 'tongGiaTriCap',
      key: 'tongGiaTriCap',
      render: (val: number) => <Text type="danger" strong>{val ? val.toLocaleString('vi-VN') + ' VND' : '0 VND'}</Text>,
    },
    {
      title: t('baoCaoPage.thoi_gian_cap'),
      dataIndex: 'thoiGianCapNhat',
      key: 'thoiGianCapNhat',
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—',
    },
  ];

  // Hàng mở rộng cho Table Cấp Phát (Chi tiết sử dụng của nhân viên)
  const expandedRowCapPhat = (record: BaoCaoCapPhatResponse) => {
    const detailColumns = [
      { title: t('baoCaoPage.ma_the_tai_san'), dataIndex: 'maTheTaiSan', key: 'maTheTaiSan', render: (val: string) => <Text copyable>{val}</Text> },
      { title: t('baoCaoPage.ten_tai_san_cu'), dataIndex: 'tenTaiSanCuThe', key: 'tenTaiSanCuThe' },
      { title: t('baoCaoPage.so_serial'), dataIndex: 'soSerial', key: 'soSerial', render: (val: string) => val || '—' },
      { title: t('phieuDieuChuyenFormModal.nhan_vien_tiep_nhan'), dataIndex: 'hoTenNhanVienTiepNhan', key: 'hoTenNhanVienTiepNhan' },
      { title: t('baoCaoPage.ma_chung_tu_goc'), dataIndex: 'maChungTuGoc', key: 'maChungTuGoc', render: (val: string) => val || '—' },
      { title: t('baoCaoPage.tinh_trang_ban_giao'), dataIndex: 'tinhTrangBanGiao', key: 'tinhTrangBanGiao', render: (val: string) => val || t('baoCaoPage.binh_thuong') },
      {
        title: t('baoCaoPage.thoi_gian_ban_giao'),
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
    { title: t('baoCaoPage.ma_danh_muc'), dataIndex: 'maTaiSanDanhMuc', key: 'maTaiSanDanhMuc', render: (val: string) => <Text strong>{val}</Text> },
    { title: t('baoCaoPage.ten_danh_muc_tai'), dataIndex: 'tenTaiSanDanhMuc', key: 'tenTaiSanDanhMuc' },
    {
      title: t('baoCaoPage.loai_tai_san'),
      dataIndex: 'loaiTaiSan',
      key: 'loaiTaiSan',
      render: (val: string) => {
        const color = val === 'PHAN_CUNG' ? 'blue' : val === 'LINH_KIEN' ? 'purple' : 'orange';
        return <Tag color={color}>{val}</Tag>;
      },
    },
    { title: t('baoCaoPage.so_luong_bao_tri'), dataIndex: 'soLuong', key: 'soLuong' },
    {
      title: t('baoCaoPage.tong_chi_phi_bao'),
      dataIndex: 'tongChiPhi',
      key: 'tongChiPhi',
      render: (val: number) => <Text type="danger" strong>{val ? val.toLocaleString('vi-VN') + ' VND' : '0 VND'}</Text>,
    },
    {
      title: t('baoCaoPage.tong_thoi_gian_gian'),
      dataIndex: 'tongThoiGian',
      key: 'tongThoiGian',
      render: (val: number) => <Tag color="warning">{t('baoCaoPage.val_val_gio_0')}</Tag>,
    },
    {
      title: t('baoCaoPage.cap_nhat_cuoi'),
      dataIndex: 'thoiGianCapNhat',
      key: 'thoiGianCapNhat',
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—',
    },
  ];

  // Hàng mở rộng cho Table Bảo Trì (Chi tiết lịch sử sửa chữa/bảo trì)
  const expandedRowBaoTri = (record: BaoCaoBaoTriResponse) => {
    const detailColumns = [
      { title: t('baoCaoPage.ma_the_tai_san'), dataIndex: 'maTheTaiSan', key: 'maTheTaiSan', render: (val: string) => <Text copyable>{val}</Text> },
      { title: t('baoCaoPage.ten_tai_san_cu'), dataIndex: 'tenTaiSanCuThe', key: 'tenTaiSanCuThe' },
      { title: t('baoCaoPage.ma_phieu_sua_chua'), dataIndex: 'maPhieuSuaChua', key: 'maPhieuSuaChua' },
      {
        title: t('baoCaoPage.chi_phi_thuc_te'),
        dataIndex: 'chiPhiThucTe',
        key: 'chiPhiThucTe',
        render: (val: number) => <Text strong>{val ? val.toLocaleString('vi-VN') + ' VND' : '—'}</Text>,
      },
      { title: t('baoCaoPage.thoi_gian_gian_doan'), dataIndex: 'thoiGianGianDoan', key: 'thoiGianGianDoan', render: (val: number) => val ? t('baoCaoPage.val_gio', { val: val }) : '—' },
      { title: t('baoCaoPage.noi_dung_khac_phuc'), dataIndex: 'noiDungKhacPhuc', key: 'noiDungKhacPhuc', render: (val: string) => val || '—' },
      {
        title: t('baoCaoPage.thoi_gian_nghiem_thu'),
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
    { title: t('baoCaoPage.id_don_vi'), dataIndex: 'idDonVi', key: 'idDonVi', render: (val: number) => <Text strong>{val}</Text> },
    { title: t('baoCaoPage.ten_don_vi_tenant'), dataIndex: 'tenDonVi', key: 'tenDonVi', render: (val: string) => <Text type="secondary" strong>{val}</Text> },
    {
      title: t('baoCaoPage.tong_so_luong_phan_cung'),
      dataIndex: 'tongSoLuongPhanCung',
      key: 'tongSoLuongPhanCung',
      render: (val: number) => <Tag color="blue">{val || 0}</Tag>,
    },
    {
      title: t('baoCaoPage.tong_so_luong_phan'),
      dataIndex: 'tongSoLuongPhanMem',
      key: 'tongSoLuongPhanMem',
      render: (val: number) => <Tag color="orange">{val || 0}</Tag>,
    },
    {
      title: t('dashboardPage.tong_gia_tri_uoc'),
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
            scroll={{ x: 'max-content' }}
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
            scroll={{ x: 'max-content' }}
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
            scroll={{ x: 'max-content' }}
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
            scroll={{ x: 'max-content' }}
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
  if (authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO) || authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN)) {
    items.push(
      { key: 'TON_KHO', label: t('baoCaoPage.bao_cao_ton_kho') },
      { key: 'CAP_PHAT', label: t('baoCaoPage.bao_cao_cap_phat') },
      { key: 'BAO_TRI', label: t('baoCaoPage.bao_cao_sua_chua') }
    );
  }
  if (authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN)) {
    items.push({ key: 'TOAN_SAN', label: t('baoCaoPage.tong_hop_toan_san') });
  }

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <div className="page-header">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {t('baoCaoPage.he_thong_bao_cao_thong_ke_tai_san')}
          </Title>
          <Text type="secondary">
            {t('baoCaoPage.tong_hop_du_lieu_ton')}
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
              {t('baoCaoPage.xuat_excel_toan_san')}
            </Button>
          )
        ) : (
          authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO) && (
            <Space wrap>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={() => handleXuatFile('xlsx')}
                loading={loading}
                style={{ background: '#107c41', borderColor: '#107c41' }}
              >
                {t('baoCaoPage.xuat_excel')}
              </Button>
              <Button
                type="primary"
                danger
                icon={<FilePdfOutlined />}
                onClick={() => handleXuatFile('pdf')}
                loading={loading}
              >
                {t('baoCaoPage.xuat_pdf')}
              </Button>
            </Space>
          )
        )}
      </div>

      {/* FILTER PANEL */}
      {activeTab !== 'TOAN_SAN' && (authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO) || authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN)) && (
        <Card style={{ marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <Form form={form} layout="vertical" onFinish={handleTimKiem}>
            <Row gutter={[16, 16]}>
              {authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN) && (
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="idDonVi" label={t('baoCaoPage.chon_don_vi_thanh_vien')} rules={[{ required: true, message: t('baoCaoPage.vui_long_chon_don_vi') }]}>
                    <Select
                      placeholder={t('baoCaoPage.chon_don_vi')}
                      allowClear
                      onChange={() => {
                        form.setFieldsValue({ idPhongBan: undefined, idViTri: undefined });
                      }}
                      options={donViList.map((x) => ({
                        value: x.id,
                        label: x.tenThuongMai || x.tenDangKy || `Đơn vị #${x.id}`
                      }))}
                    />
                  </Form.Item>
                </Col>
              )}
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="idPhongBan" label={t('baoCaoPage.loc_theo_phong_ban')}>
                  <Select
                    placeholder={t('baoCaoPage.chon_phong_ban_nhan')}
                    allowClear
                    suffixIcon={<ApartmentOutlined />}
                    options={phongBanList.map((x) => ({ value: x.id, label: x.ten }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="idViTri" label={t('baoCaoPage.loc_theo_vi_tri')}>
                  <Select
                    placeholder={t('baoCaoPage.chon_vi_tri_luu')}
                    allowClear
                    suffixIcon={<EnvironmentOutlined />}
                    options={viTriList.map((x) => ({ value: x.id, label: x.tenViTri }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="rangePicker" label={t('baoCaoPage.thoi_gian_giao_dich')}>
                  <RangePicker style={{ width: '100%' }} placeholder={[t('phieuKiemKePage.tu_ngay'), t('phieuKiemKePage.den_ngay')]} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="tuKhoaTimKiem" label={t('baoCaoPage.tim_theo_tag_serial')}>
                  <Input placeholder={t('baoCaoPage.ma_asset_tag_so')} prefix={<SearchOutlined />} allowClear />
                </Form.Item>
              </Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            <Row justify="end">
              <Space>
                <Button icon={<ReloadOutlined />} onClick={handleLamMoi}>
                  {t('baoCaoPage.dat_lai_bo_loc')}
                </Button>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit" loading={loading}>
                  {t('baoCaoPage.ap_dung_bo_loc')}
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
