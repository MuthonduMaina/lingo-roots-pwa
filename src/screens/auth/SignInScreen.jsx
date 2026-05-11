import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { colors, fonts, fontWeights, radii, spacing } from '../../lib/theme'
import AuthShell from './AuthShell'

export default function SignInScreen() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    try {
      await signIn({ email, password })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    try { await signInWithGoogle() }
    catch (err) { setError(err.message) }
  }

  const canSubmit = email && password && !loading

  return (
    <AuthShell title="Welcome back">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>

        <Field label="Email">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle(!!email)}
          />
        </Field>

        <Field label="Password">
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ ...inputStyle(!!password), paddingRight: 52 }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: fontWeights.semibold,
                color: colors.textMuted, fontFamily: fonts.body,
              }}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>

        <div style={{ textAlign: 'right', marginTop: -4 }}>
          <Link to="/forgot-password" style={{ fontSize: 12, color: colors.brand, textDecoration: 'none', fontFamily: fonts.body }}>
            Forgot password?
          </Link>
        </div>

        {error && (
          <p style={{
            fontSize: 13, color: colors.coral, background: colors.coralLight,
            padding: '10px 14px', borderRadius: radii.md, fontFamily: fonts.body,
            margin: 0,
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          style={primaryBtn(canSubmit)}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <Divider />

        <button type="button" onClick={handleGoogle} style={socialBtn}>
          <GoogleIcon />
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: colors.textMuted, fontFamily: fonts.body, margin: 0 }}>
          No account?{' '}
          <Link to="/sign-up" style={{ color: colors.brand, fontWeight: fontWeights.bold, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>

      </form>
    </AuthShell>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: fontWeights.bold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: fonts.body }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: colors.border }} />
      <span style={{ fontSize: 11, color: colors.greyLight, fontFamily: fonts.body }}>or</span>
      <div style={{ flex: 1, height: 1, background: colors.border }} />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

function inputStyle(hasValue) {
  return {
    width: '100%', boxSizing: 'border-box',
    padding: '13px 16px',
    border: `1.5px solid ${hasValue ? colors.brand : colors.border}`,
    borderRadius: radii.md,
    fontSize: 15, fontFamily: fonts.body, color: colors.text,
    background: colors.white, outline: 'none',
    transition: 'border-color 0.15s',
  }
}

function primaryBtn(active) {
  return {
    width: '100%', padding: '14px',
    background: active ? colors.brand : colors.greyLight,
    color: colors.white,
    border: 'none', borderRadius: radii.md,
    fontSize: 15, fontWeight: fontWeights.bold,
    fontFamily: fonts.body, cursor: active ? 'pointer' : 'default',
    transition: 'background 0.15s',
  }
}

const socialBtn = {
  width: '100%', padding: '13px',
  background: colors.white,
  border: `1.5px solid ${colors.border}`,
  borderRadius: radii.md,
  fontSize: 14, fontWeight: fontWeights.semibold,
  fontFamily: fonts.body, color: colors.text,
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: 10,
}
