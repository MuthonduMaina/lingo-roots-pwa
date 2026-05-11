import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { colors, fonts, fontWeights, radii, spacing } from '../../lib/theme'
import AuthShell from './AuthShell'

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth()
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle="We've sent a reset link">
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: fonts.body, lineHeight: 1.6 }}>
            We sent a password reset link to <strong style={{ color: colors.text }}>{email}</strong>.
            Check your inbox and follow the link.
          </p>
          <p style={{ fontSize: 12, color: colors.greyLight, marginTop: 12, fontFamily: fonts.body }}>
            Didn't receive it? Check your spam folder.
          </p>
        </div>
        <Link
          to="/sign-in"
          style={{
            display: 'block', textAlign: 'center', marginTop: 8,
            fontSize: 14, color: colors.brand, fontWeight: fontWeights.bold,
            textDecoration: 'none', fontFamily: fonts.body,
          }}
        >
          ← Back to sign in
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Reset password" subtitle="We'll send you a reset link">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: fontWeights.bold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: fonts.body }}>
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%', boxSizing: 'border-box', padding: '13px 16px',
              border: `1.5px solid ${email ? colors.brand : colors.border}`,
              borderRadius: radii.md, fontSize: 15, fontFamily: fonts.body,
              color: colors.text, background: colors.white, outline: 'none',
            }}
          />
        </div>

        {error && (
          <p style={{
            fontSize: 13, color: colors.coral, background: colors.coralLight,
            padding: '10px 14px', borderRadius: radii.md,
            fontFamily: fonts.body, margin: 0,
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!email || loading}
          style={{
            width: '100%', padding: '14px',
            background: email && !loading ? colors.brand : colors.greyLight,
            color: colors.white, border: 'none', borderRadius: radii.md,
            fontSize: 15, fontWeight: fontWeights.bold,
            fontFamily: fonts.body, cursor: email && !loading ? 'pointer' : 'default',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Sending…' : 'Send reset link'}
        </button>

        <Link
          to="/sign-in"
          style={{
            textAlign: 'center', fontSize: 13, color: colors.brand,
            fontWeight: fontWeights.semibold, textDecoration: 'none',
            fontFamily: fonts.body, display: 'block',
          }}
        >
          ← Back to sign in
        </Link>
      </form>
    </AuthShell>
  )
}
