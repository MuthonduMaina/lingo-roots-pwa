import { colors, fonts } from '../../lib/theme'

export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: colors.brand,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48,
          height: 48,
          border: `3px solid rgba(255,255,255,0.2)`,
          borderTopColor: colors.white,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: fonts.body }}>
          Loading…
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
