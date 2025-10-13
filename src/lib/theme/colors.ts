// Theme color definitions with full scales
export type ThemeColor = 'orange' | 'red' | 'cyan' | 'yellow' | 'lime';

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

// Full HSL color scales for each theme
export const themeColors: Record<ThemeColor, ColorScale> = {
  orange: {
    50: '22 100% 96%',
    100: '22 100% 92%',
    200: '22 100% 84%',
    300: '22 100% 73%',
    400: '22 100% 61%',
    500: '22 100% 52%',
    600: '22 100% 47%',
    700: '22 100% 42%',
    800: '22 87% 35%',
    900: '22 85% 28%',
    950: '22 90% 15%',
  },
  red: {
    50: '342 100% 97%',
    100: '342 100% 94%',
    200: '342 96% 88%',
    300: '342 94% 76%',
    400: '342 90% 62%',
    500: '342 87% 48%',
    600: '342 87% 42%',
    700: '342 85% 36%',
    800: '342 80% 30%',
    900: '342 75% 24%',
    950: '342 85% 12%',
  },
  cyan: {
    50: '189 100% 96%',
    100: '189 100% 91%',
    200: '189 100% 80%',
    300: '189 100% 66%',
    400: '189 100% 52%',
    500: '189 100% 41%',
    600: '189 100% 35%',
    700: '189 100% 29%',
    800: '189 85% 24%',
    900: '189 80% 20%',
    950: '189 90% 10%',
  },
  yellow: {
    50: '52 100% 96%',
    100: '52 100% 91%',
    200: '52 100% 80%',
    300: '52 100% 68%',
    400: '52 100% 56%',
    500: '52 100% 50%',
    600: '52 100% 44%',
    700: '52 95% 38%',
    800: '52 85% 32%',
    900: '52 80% 26%',
    950: '52 85% 14%',
  },
  lime: {
    50: '74 100% 96%',
    100: '74 100% 91%',
    200: '74 95% 82%',
    300: '74 90% 68%',
    400: '74 88% 54%',
    500: '74 85% 40%',
    600: '74 85% 34%',
    700: '74 80% 28%',
    800: '74 75% 23%',
    900: '74 70% 19%',
    950: '74 80% 10%',
  },
};

// Apply theme color using data-theme attribute
export function applyThemeColor(color: ThemeColor): void {
  if (typeof window === 'undefined') return;

  // Set the data-theme attribute on the document root
  // This will trigger the CSS rules defined in app.css
  document.documentElement.setAttribute('data-theme', color);
}