import React from 'react';
import { Form, Input, Button, Card, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const DemoFormPage: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    console.log('Submitted values:', values);
  };

  return (
    <Card 
      title={t('asset.title')} 
      extra={<LanguageSwitcher />}
      style={{ maxWidth: 600, margin: '50px auto' }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>{t('demoFormPage.truong_nhap_ma_tai_san')}<Form.Item
          label={t('asset.tag')}
          name="assetTag"
          rules={[{ required: true, message: t('asset.validation.tag_required') }]}
        >
          <Input placeholder={t('asset.tag')} />
        </Form.Item>{t('demoFormPage.truong_nhap_ten_mau_tai_san')}<Form.Item
          label={t('asset.name')}
          name="assetName"
          rules={[{ required: true, message: t('asset.validation.name_required') }]}
        >
          <Input placeholder={t('asset.name')} />
        </Form.Item>{t('demoFormPage.bo_chon_loai_trang_thai')}<Form.Item label={t('asset.type')} name="status" initialValue="active">
          <Select>
            <Select.Option value="active">{t('asset.status.active')}</Select.Option>
            <Select.Option value="inactive">{t('asset.status.inactive')}</Select.Option>
            <Select.Option value="maintenance">{t('asset.status.maintenance')}</Select.Option>
          </Select>
        </Form.Item>{t('demoFormPage.cac_nut_bam_hanh_dong')}<Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button style={{ marginRight: 8 }}>
            {t('common.cancel')}
          </Button>
          <Button type="primary" htmlType="submit">
            {t('common.submit')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default DemoFormPage;
