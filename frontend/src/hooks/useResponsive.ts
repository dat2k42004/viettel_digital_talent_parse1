import { Grid } from 'antd';

const { useBreakpoint } = Grid;

export const useResponsive = () => {
  const screens = useBreakpoint();

  // Screen breakpoints in Ant Design:
  // xs: <576px, sm: >=576px, md: >=768px, lg: >=992px, xl: >=1200px, xxl: >=1600px
  // Treat screens < 992px (tablets & mobile / split-screen windows) as compact/mobile layout
  const isMobile = screens.lg === false || (Object.keys(screens).length === 0 && typeof window !== 'undefined' && window.innerWidth < 992);
  const isTablet = !!(screens.md && !screens.xl);
  const isDesktop = !!screens.lg;

  return {
    isMobile,
    isTablet,
    isDesktop,
    screens,
  };
};
