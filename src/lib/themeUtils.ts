// Convert hex color to HSL values string for CSS variables
function hexToHSL(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Determine if a color is light (for choosing foreground)
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export function applyThemeSettings(config?: { theme?: string; primaryColor?: string }) {
  if (!config) {
    // Try loading from localStorage
    try {
      const stored = localStorage.getItem('hr_site_config');
      if (stored) config = JSON.parse(stored);
    } catch { return; }
  }
  if (!config) return;

  // Apply theme (dark/light/system)
  const root = document.documentElement;
  if (config.theme === 'dark') {
    root.classList.add('dark');
  } else if (config.theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  // Apply primary color
  if (config.primaryColor && config.primaryColor.startsWith('#')) {
    const hsl = hexToHSL(config.primaryColor);
    root.style.setProperty('--primary', hsl);
    root.style.setProperty('--ring', hsl);
    // Set foreground based on brightness
    const fg = isLightColor(config.primaryColor) ? '222 47% 11%' : '0 0% 100%';
    root.style.setProperty('--primary-foreground', fg);

    // Also update sidebar primary
    root.style.setProperty('--sidebar-primary', hsl);
    root.style.setProperty('--sidebar-primary-foreground', fg);
  }
}
