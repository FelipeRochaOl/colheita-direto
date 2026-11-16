import { colors } from './colors';
import { radius } from './spacing';
import { fontFamilies } from './typography';

/**
 * Tema do Ant Design (web). Tipado de forma estrutural para não acoplar este pacote ao antd;
 * o objeto é compatível com `ThemeConfig` de `antd`.
 */
export const antDesignTheme = {
  token: {
    colorPrimary: colors.greenDark,
    colorSuccess: colors.greenMedium,
    colorWarning: colors.warning,
    colorError: colors.danger,
    colorInfo: colors.linkBlue,
    colorLink: colors.linkBlue,
    colorTextBase: colors.evergreenDark,
    colorBgBase: colors.white,
    colorBgLayout: colors.lightSurface,
    fontFamily: fontFamilies.sans,
    fontSize: 16,
    borderRadius: radius.small,
    controlHeight: 44,
  },
  components: {
    Button: { borderRadius: radius.pill, fontWeight: 500 },
    Card: { borderRadiusLG: radius.medium },
    Layout: { headerBg: colors.evergreenDark, footerBg: colors.evergreenDark },
  },
};

/** Tema do @ant-design/react-native (formato próprio, diferente do web). */
export const antDesignMobileTheme = {
  brand_primary: colors.greenDark,
  brand_primary_tap: colors.tealDark,
  brand_success: colors.greenMedium,
  brand_warning: colors.warning,
  brand_error: colors.danger,
  color_link: colors.linkBlue,
  fill_body: colors.lightSurface,
  color_text_base: colors.evergreenDark,
  radius_md: radius.small,
  radius_lg: radius.medium,
};
