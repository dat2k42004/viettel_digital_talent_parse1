import React from 'react';
import { Dropdown, Button, Space } from 'antd';
import type { MenuProps } from 'antd';
import { GlobalOutlined, DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'vi',
      label: t('languageSwitcher.tieng_viet_vi'),
      disabled: i18n.language === 'vi',
      onClick: () => handleLanguageChange('vi'),
    },
    {
      key: 'en',
      label: 'English (EN)',
      disabled: i18n.language === 'en',
      onClick: () => handleLanguageChange('en'),
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
      <Button type="text">
        <Space>
          <GlobalOutlined />
          <span>{i18n.language.toUpperCase()}</span>
          <DownOutlined style={{ fontSize: '10px' }} />
        </Space>
      </Button>
    </Dropdown>
  );
};
