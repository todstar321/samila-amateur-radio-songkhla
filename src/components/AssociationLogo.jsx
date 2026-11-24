import React, { useState, useEffect } from 'react';

export default function AssociationLogo({ 
  customUrl, 
  className = "w-14 h-14",
  clickable = true,
  onClick
}) {
  // If customUrl is provided as a prop, use it directly
  // Otherwise, read from localStorage and listen to real-time changes
  const [activeUrl, setActiveUrl] = useState(() => {
    if (customUrl !== undefined) return customUrl;
    try {
      const saved = localStorage.getItem('samila_radio_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.customLogoUrl || '';
      }
    } catch (e) {}
    return '';
  });

  useEffect(() => {
    if (customUrl !== undefined) {
      setActiveUrl(customUrl);
      return;
    }

    const handleSettingsChange = (e) => {
      if (e?.detail?.customLogoUrl !== undefined) {
        setActiveUrl(e.detail.customLogoUrl || '');
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'samila_radio_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setActiveUrl(parsed.customLogoUrl || '');
        } catch (err) {}
      }
    };

    window.addEventListener('samila_settings_changed', handleSettingsChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('samila_settings_changed', handleSettingsChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [customUrl]);

  const handleClick = (e) => {
    if (!clickable) return;
    if (onClick) {
      onClick(e);
      return;
    }
    // Prevent default navigation (e.g., if inside an <a> tag) and open lightbox modal
    e.preventDefault();
    e.stopPropagation();
    try {
      window.dispatchEvent(new CustomEvent('samila_open_logo_modal', { detail: { customUrl: activeUrl } }));
    } catch (err) {}
  };

  const interactionClasses = clickable 
    ? "cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200" 
    : "";

  // 1. Custom Uploaded Logo: pure circular image WITHOUT ANY artificial blue border
  if (activeUrl) {
    return (
      <img
        src={activeUrl}
        alt="ตราสัญลักษณ์สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา"
        onClick={handleClick}
        title={clickable ? "คลิกเพื่อดูภาพขยายและบันทึกตราสัญลักษณ์สมาคม" : undefined}
        className={`${className} ${interactionClasses} object-cover rounded-full shadow-md select-none`}
      />
    );
  }

  // 2. Official Emblem Vector: Radio Tower, Radio Waves, Songkhla Mermaid tail & Sea Waves, Gold & Deep Blue colors
  return (
    <div 
      onClick={handleClick}
      title={clickable ? "คลิกเพื่อดูภาพขยายและบันทึกตราสัญลักษณ์สมาคม" : undefined}
      className={`${className} ${interactionClasses} relative flex items-center justify-center shrink-0 select-none`}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="samilaBlueGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0B2545" />
            <stop offset="0.5" stopColor="#134074" />
            <stop offset="1" stopColor="#001B3A" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCD34D" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Outer Circle with Gold Ring */}
        <circle cx="60" cy="60" r="58" fill="url(#samilaBlueGrad)" stroke="url(#goldGrad)" strokeWidth="3.5" />
        <circle cx="60" cy="60" r="51" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />

        {/* Radio Waves at Top */}
        <path d="M38 32 A 28 28 0 0 1 82 32" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
        <path d="M46 39 A 18 18 0 0 1 74 39" stroke="#7DD3FC" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
        <path d="M53 45 A 9 9 0 0 1 67 45" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />

        {/* Antenna Mast */}
        <circle cx="60" cy="48" r="4" fill="#F59E0B" />
        <line x1="60" y1="52" x2="60" y2="92" stroke="#F1F5F9" strokeWidth="3" strokeLinecap="round" />
        {/* Mast Crossbars */}
        <line x1="48" y1="64" x2="72" y2="64" stroke="#F1F5F9" strokeWidth="2" />
        <line x1="52" y1="74" x2="68" y2="74" stroke="#F1F5F9" strokeWidth="2" />
        <line x1="44" y1="84" x2="76" y2="84" stroke="#F1F5F9" strokeWidth="2" />
        <line x1="48" y1="64" x2="72" y2="84" stroke="#94A3B8" strokeWidth="1" />
        <line x1="72" y1="64" x2="48" y2="84" stroke="#94A3B8" strokeWidth="1" />

        {/* Sea Waves / Samila Mermaid representation */}
        <path
          d="M20 92 Q 40 85 60 92 T 100 92"
          stroke="url(#goldGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M26 98 Q 44 93 60 98 T 94 98"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Small Spark / Signal Beacon */}
        <polygon points="60,18 62,23 67,25 62,27 60,32 58,27 53,25 58,23" fill="#FCD34D" />
      </svg>
    </div>
  );
}
