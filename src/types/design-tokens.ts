/**
 * 设计令牌类型定义
 * 提供类型安全的设计令牌访问
 */

// 颜色系统
export interface ColorTokens {
  // 主色
  primary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string  // 基准色
    600: string
    700: string
    800: string
    900: string
  }
  
  // 次色
  secondary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string  // 基准色
    600: string
    700: string
    800: string
    900: string
  }
  
  // 辅助色
  success: string
  warning: string
  error: string
  
  // 中性色
  white: string
  gray: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  black: string
}

// 字体系统
export interface TypographyTokens {
  // 字体家族
  fontFamily: {
    sans: string
    sansZh: string
  }
  
  // 字号
  fontSize: {
    xs: string    // 12px
    sm: string    // 14px
    base: string  // 16px
    lg: string    // 18px
    xl: string    // 20px
    '2xl': string // 24px
    '3xl': string // 30px
    '4xl': string // 36px
    '5xl': string // 48px
    '6xl': string // 60px
  }
  
  // 字重
  fontWeight: {
    normal: number   // 400
    medium: number   // 500
    semibold: number // 600
    bold: number     // 700
    extrabold: number // 800
  }
  
  // 行高
  lineHeight: {
    tight: number     // 1.25
    normal: number    // 1.5
    relaxed: number   // 1.6
    loose: number     // 1.75
    extraLoose: number // 2
  }
}

// 间距系统
export interface SpacingTokens {
  0: string    // 0
  1: string    // 4px
  2: string    // 8px
  3: string    // 12px
  4: string    // 16px
  5: string    // 20px
  6: string    // 24px
  8: string    // 32px
  10: string   // 40px
  12: string   // 48px
  15: string   // 60px
  16: string   // 64px
  20: string   // 80px
  24: string   // 96px
}

// 圆角系统
export interface BorderRadiusTokens {
  none: string   // 0
  sm: string     // 4px
  base: string   // 8px
  md: string     // 12px
  lg: string     // 16px
  xl: string     // 20px
  '2xl': string  // 24px
  full: string   // 9999px
}

// 阴影系统
export interface ShadowTokens {
  sm: string    // 轻微阴影
  base: string  // 标准阴影
  md: string    // 中等阴影
  lg: string    // 较深阴影
  xl: string    // 深阴影
}

// 按钮样式
export interface ButtonStyles {
  paddingY: string
  paddingX: string
  fontSize: string
  fontWeight: number
  minHeight: string
  borderRadius: string
}

// 卡片样式
export interface CardStyles {
  padding: string
  borderRadius: string
  shadow: string
  shadowHover: string
}

// 响应式断点
export interface ResponsiveBreakpoints {
  mobile: number    // < 768px
  tablet: number    // 768-1023px
  desktop: number   // >= 1024px
}

// 完整设计令牌配置
export interface DesignTokensConfig {
  colors: ColorTokens
  typography: TypographyTokens
  spacing: SpacingTokens
  borderRadius: BorderRadiusTokens
  shadows: ShadowTokens
  button: ButtonStyles
  card: CardStyles
  breakpoints: ResponsiveBreakpoints
}

// 导出设计令牌常量
export const DESIGN_TOKENS = {
  // 颜色
  colors: {
    primary: {
      50: '#F0F4FF',
      100: '#E0EAFF',
      200: '#C7D7FE',
      300: '#A5B8FC',
      400: '#8B9FF8',
      500: '#667EEA',
      600: '#5568D3',
      700: '#4453B8',
      800: '#3A4694',
      900: '#2E3A75',
    },
    secondary: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#764BA2',
      600: '#6B3FA0',
      700: '#5B3391',
      800: '#4C2A7A',
      900: '#3D2262',
    },
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    black: '#000000',
  },
  
  // 字体
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      sansZh: "'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.6,
      loose: 1.75,
      extraLoose: 2,
    },
  },
  
  // 间距
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    15: '3.75rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },
  
  // 圆角
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    base: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  
  // 阴影
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  
  // 按钮
  button: {
    paddingY: '0.75rem',
    paddingX: '1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    minHeight: '3rem',
    borderRadius: '0.5rem',
  },
  
  // 卡片
  card: {
    padding: '1.5rem',
    borderRadius: '0.75rem',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  
  // 断点
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1024,
  },
} as const

export type DesignTokens = typeof DESIGN_TOKENS
