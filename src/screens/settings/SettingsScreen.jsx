/**
 * Settings screen — profile info, active child display, sign-out.
 * Minimal for MVP; notification prefs and language management come in Phase 2.
 */
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SignOut, User } from '@phosphor-icons/react'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../context/ProfileContext'
import { colors, fonts, fontWeights, fontSizes, radii, spacing, characters } from '../../lib/theme'

export default function SettingsScreen() {
  const navigate   = useNavigate()
  const { user, signOut } = useAuth()
  const { activeProfile } = useProfile()

  const profile   = activeProfile
  const character = profile ? (characters[profile.avatar_character] ?? characters.ziki) : null

  async function handleSignOut() {
    await signOut()
    navigate('/sign-in', { replace: true })
  }

  return (
    <div style={{ minHeight: '100dvh', background: colors.greyFaint, fontFamily: fonts.body }}>

      {/* Header */}
      <header style={{ background: colors.brand, padding: `${spacing.base}px ${spacing.base}px ${spacing['2xl']}px` }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{
            background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: radii.full, width: 36, height: 36,
            fontSize: 16, cursor: 'pointer', color: colors.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: spacing.base,
          }}
        >
          ←
        </button>
        <h1 style={{
          fontSize: fontSizes.xl, fontWeight: fontWeights.black,
          color: colors.white, margin: 0, fontFamily: fonts.kids,
        }}>
          Settings
        </h1>
      </header>

      <main style={{ marginTop: -spacing.xl, padding: `0 ${spacing.base}px ${spacing['3xl']}px` }}>

        {/* Active child */}
        {profile && (
          <Section title="Active Learner">
            <SettingsRow
              icon={<span style={{ fontSize: 24 }}>{character.emoji}</span>}
              label={profile.name}
              sublabel={`${character.name} · Level ${profile.level ?? 1} · ${profile.points ?? 0} XP`}
              showChevron={false}
            />
          </Section>
        )}

        {/* Account */}
        <Section title="Account">
          <SettingsRow
            icon={<User size={20} color={colors.brand} />}
            label={user?.email ?? '—'}
            sublabel="Signed-in email"
            showChevron={false}
          />
        </Section>

        {/* Sign out */}
        <Section title="">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSignOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: spacing.md,
              background: colors.white, border: 'none',
              borderRadius: radii.xl, padding: `${spacing.base}px`,
              cursor: 'pointer', textAlign: 'left',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: radii.md,
              background: colors.coralLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SignOut size={20} color={colors.coral} />
            </div>
            <span style={{
              fontSize: fontSizes.base, fontWeight: fontWeights.semibold,
              color: colors.coral, fontFamily: fonts.body,
            }}>
              Sign out
            </span>
          </motion.button>
        </Section>

        <p style={{
          textAlign: 'center', fontSize: fontSizes.xs,
          color: colors.greyLight, marginTop: spacing.xl,
          fontFamily: fonts.body,
        }}>
          Lingo Roots · For families everywhere
        </p>
      </main>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: spacing.lg }}>
      {title && (
        <p style={{
          fontSize: fontSizes.xs, fontWeight: fontWeights.bold,
          color: colors.textMuted, textTransform: 'uppercase',
          letterSpacing: '0.08em', margin: `0 0 ${spacing.sm}px ${spacing.sm}px`,
          fontFamily: fonts.body,
        }}>
          {title}
        </p>
      )}
      <div style={{
        background: colors.white, borderRadius: radii.xl,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}

function SettingsRow({ icon, label, sublabel, onClick, showChevron = true }) {
  const content = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: spacing.md,
      padding: `${spacing.md}px ${spacing.base}px`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: radii.md,
        background: colors.brandFaint,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: fontSizes.base, fontWeight: fontWeights.semibold,
          color: colors.text, margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: fonts.body,
        }}>
          {label}
        </p>
        {sublabel && (
          <p style={{ fontSize: fontSizes.xs, color: colors.textMuted, margin: '1px 0 0', fontFamily: fonts.body }}>
            {sublabel}
          </p>
        )}
      </div>
      {showChevron && <span style={{ color: colors.greyLight, fontSize: 12 }}>›</span>}
    </div>
  )

  if (onClick) {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        {content}
      </motion.button>
    )
  }

  return content
}
