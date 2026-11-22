import { defaultSectionThemes, overlayThemes } from '../data/mockData';

/**
 * Retrieves the theme configuration for a given section key
 * (e.g. 'hero', 'news', 'repeaters', 'services', 'contact', 'admin')
 */
export function getSectionTheme(settings, sectionKey) {
  const defaultTheme = defaultSectionThemes[sectionKey] || {
    id: sectionKey,
    name: sectionKey,
    bgUrl: defaultSectionThemes.hero.bgUrl,
    opacity: 50,
    overlayType: 'ocean-wave'
  };

  if (!settings || !settings.sectionThemes || !settings.sectionThemes[sectionKey]) {
    // If it's hero section and heroBgUrl exists, respect heroBgUrl
    if (sectionKey === 'hero' && settings?.heroBgUrl) {
      return {
        ...defaultTheme,
        bgUrl: settings.heroBgUrl,
        overlayType: settings.overlayColor || defaultTheme.overlayType
      };
    }
    return defaultTheme;
  }

  const customTheme = settings.sectionThemes[sectionKey];
  return {
    ...defaultTheme,
    ...customTheme,
    bgUrl: customTheme.bgUrl || defaultTheme.bgUrl,
    opacity: typeof customTheme.opacity === 'number' ? customTheme.opacity : defaultTheme.opacity,
    overlayType: customTheme.overlayType || defaultTheme.overlayType,
  };
}

/**
 * Returns Tailwind gradient classes for an overlay type
 */
export function getOverlayGradient(overlayType, fallback = 'ocean-wave') {
  const match = overlayThemes.find(t => t.id === overlayType);
  if (match) {
    return match.gradient;
  }
  // Fallbacks
  switch (overlayType) {
    case 'ocean-deep':
      return 'from-[#011f38]/80 via-[#013b63]/55 to-[#012644]/80';
    case 'cyan-breeze':
      return 'from-[#013554]/70 via-[#0077b6]/45 to-[#014066]/70';
    case 'emerald-sea':
      return 'from-[#012d38]/75 via-[#025b68]/50 to-[#013440]/75';
    case 'midnight-marine':
      return 'from-[#011424]/85 via-[#01233d]/60 to-[#01182b]/85';
    case 'ocean-light':
      return 'from-sky-50/85 via-cyan-50/75 to-sky-100/85';
    case 'ocean-footer':
      return 'from-[#012a4a]/85 via-[#011f38]/85 to-[#011424]/90';
    case 'ocean-admin':
      return 'from-slate-50/92 via-sky-50/80 to-slate-100/92';
    case 'ocean-wave':
    default:
      return 'from-[#012038]/75 via-[#013a63]/50 to-[#012644]/75';
  }
}
