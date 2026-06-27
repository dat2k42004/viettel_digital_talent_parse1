import React, { useEffect, useState } from 'react';
import { Modal, Collapse, Checkbox, Row, Col, Tooltip, Typography } from 'antd';
import type { VaiTroResponse } from '../../../api-generated/models/vaiTroResponse';
import type { QuyenResponse } from '../../../api-generated/models/quyenResponse';
import type { VaiTroQuyenUpdateRequest } from '../../../api-generated/models/vaiTroQuyenUpdateRequest';

const { Text, Paragraph } = Typography;

interface RoleMatrixModalProps {
  open: boolean;
  onCancel: () => void;
  selectedRole: VaiTroResponse | null;
  maTranQuyen: Record<string, QuyenResponse[]>;
  onSave: (values: VaiTroQuyenUpdateRequest) => Promise<void>;
}

export const RoleMatrixModal: React.FC<RoleMatrixModalProps> = ({
  open,
  onCancel,
  selectedRole,
  maTranQuyen,
  onSave
}) => {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && selectedRole) {
      const existingIds = selectedRole.danhSachQuyen?.map(q => q.id).filter(Boolean) as number[] || [];
      setSelectedPermissionIds(existingIds);
    }
  }, [open, selectedRole]);

  const handleCheckboxChange = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedPermissionIds(prev => [...prev, id]);
    } else {
      setSelectedPermissionIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave({ danhSachIdQuyen: selectedPermissionIds });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Thiết lập Ma trận quyền hạn: ${selectedRole?.tenVaiTro}`}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Lưu cấu hình"
      cancelText="Hủy bỏ"
      width={650}
    >
      <Paragraph type="secondary" style={{ marginTop: 12 }}>
        Lựa chọn phân chia quyền năng hệ thống theo nhóm chức năng. Tích chọn để trao quyền và bỏ tích để thu hồi quyền ngay lập tức.
      </Paragraph>

      <Collapse defaultActiveKey={Object.keys(maTranQuyen)} style={{ marginTop: 16, maxHeight: 400, overflowY: 'auto' }}>
        {Object.entries(maTranQuyen).map(([tenNhom, danhSachQuyenCon]) => (
          <Collapse.Panel
            header={<Text strong style={{ textTransform: 'uppercase' }}>Phân hệ {tenNhom}</Text>}
            key={tenNhom}
          >
            <Row gutter={[16, 8]}>
              {danhSachQuyenCon.map((quyen: QuyenResponse) => {
                if (!quyen.id) return null;
                return (
                  <Col span={12} key={quyen.id}>
                    <Checkbox
                      checked={selectedPermissionIds.includes(quyen.id)}
                      onChange={(e) => quyen.id && handleCheckboxChange(quyen.id, e.target.checked)}
                    >
                      <Tooltip title={quyen.maQuyen}>
                        <span>{quyen.tenQuyen || quyen.maQuyen}</span>
                      </Tooltip>
                    </Checkbox>
                  </Col>
                );
              })}
            </Row>
          </Collapse.Panel>
        ))}
      </Collapse>
    </Modal>
  );
};

export default RoleMatrixModal;
