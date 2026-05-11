// Shared wrapper for all auth screens — logo, card, brand header
import { colors, fonts, fontWeights, radii } from '../../lib/theme'

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: colors.greyFaint,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      fontFamily: fonts.body,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{
          background: colors.white,
          borderRadius: radii['2xl'],
          boxShadow: '0 20px 60px rgba(57,56,147,0.12)',
          overflow: 'hidden',
        }}>
          {/* Brand header */}
          <div style={{
            background: colors.brand,
            padding: '40px 32px 36px',
            textAlign: 'center',
          }}>
            <div style={{ marginBottom: 4 }}>
              <p style={{ fontSize: 10, fontWeight: fontWeights.bold, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>
                Lingo Roots
              </p>
              <p style={{ fontSize: 22, fontWeight: fontWeights.black, color: colors.white, fontFamily: fonts.kids, margin: 0 }}>
                {title}
              </p>
              {subtitle && (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Form area */}
          <div style={{ padding: '32px 32px 36px' }}>
            {children}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: colors.greyLight, marginTop: 20 }}>
          Lingo Roots · For families everywhere
        </p>
      </div>
    </div>
  )
}
