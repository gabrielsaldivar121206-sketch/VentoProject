import React from 'react';

/* ══════════════════════════════════════════════
   SKELETON SCREENS
   - Placeholder while content loads
   - Animated gradient shimmer
   - Variants for different layouts
══════════════════════════════════════════════ */

const shimmerStyle = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeletonShimmer 1.5s ease-in-out infinite',
  borderRadius: '12px',
};

/* Inject animation into document */
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes skeletonShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  if (!document.querySelector('[data-skeleton-style]')) {
    style.setAttribute('data-skeleton-style', '');
    document.head.appendChild(style);
  }
}

export const SkeletonBlock = ({ width = '100%', height = '20px', radius = '12px', style = {} }) => (
  <div style={{ ...shimmerStyle, width, height, borderRadius: radius, ...style }} />
);

export const SkeletonCard = () => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '24px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minHeight: '300px',
  }}>
    {/* Banner */}
    <SkeletonBlock height="120px" radius="16px" />
    {/* Icon + badge row */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <SkeletonBlock width="56px" height="56px" radius="16px" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SkeletonBlock width="60%" height="14px" />
        <SkeletonBlock width="40%" height="10px" />
      </div>
    </div>
    {/* Title */}
    <SkeletonBlock width="80%" height="18px" />
    {/* Tags */}
    <div style={{ display: 'flex', gap: '8px' }}>
      <SkeletonBlock width="70px" height="22px" radius="999px" />
      <SkeletonBlock width="85px" height="22px" radius="999px" />
      <SkeletonBlock width="60px" height="22px" radius="999px" />
    </div>
    {/* Progress bar */}
    <SkeletonBlock height="8px" radius="999px" />
    {/* Button */}
    <SkeletonBlock height="44px" radius="14px" />
  </div>
);

export const SkeletonStatCard = () => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '20px',
    padding: '20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  }}>
    <SkeletonBlock width="32px" height="32px" radius="10px" />
    <SkeletonBlock width="50px" height="24px" />
    <SkeletonBlock width="70px" height="10px" />
  </div>
);

export const SkeletonDashboard = () => (
  <div style={{
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '80px 24px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  }}>
    {/* Hero */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SkeletonBlock width="120px" height="28px" radius="999px" />
        <SkeletonBlock width="70%" height="32px" />
        <SkeletonBlock width="50%" height="16px" />
      </div>
      <SkeletonBlock width="120px" height="120px" radius="50%" />
    </div>
    {/* Stats */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
      {[...Array(4)].map((_, i) => <SkeletonStatCard key={i} />)}
    </div>
    {/* Course cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
      {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  </div>
);

export default SkeletonDashboard;
