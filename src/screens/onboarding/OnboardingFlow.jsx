/**
 * Onboarding flow — Task 2.1
 * 5-step wizard that creates a child profile and saves it to Supabase.
 * Steps: Character → Name → Age → Language → Done
 *
 * Designed for parents setting up a profile for their child (ages 4–12).
 * Completion upserts a row into child_profiles, then navigates home.
 */
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../context/ProfileContext'
import { supabase } from '../../lib/supabase'
import {
  colors, fonts, fontWeights, fontSizes, radii, spacing, characters,
} from '../../lib/theme'

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHARACTERS = Object.entries(characters).map(([key, val]) => ({ key, ...val }))

// Kenya MVP — matches KE_LANGUAGES in HomeScreen
const LANGUAGES = [
  { id: 'sw',  name: 'Kiswahili', flag: '🇰🇪', blurb: 'Kenya\'s national language' },
  { id: 'ki',  name: 'Kikuyu',    flag: '🌿',   blurb: 'Spoken by the Kikuyu people' },
  { id: 'luo', name: 'Dholuo',    flag: '🌊',   blurb: 'Language of the Luo community' },
  { id: 'luy', name: 'Luhya',     flag: '☀️',   blurb: 'Luhya language group' },
]

const AGE_GROUPS = [
  { label: '4–5', value: 4, emoji: '🐣' },
  { label: '6–7', value: 6, emoji: '🌱' },
  { label: '8–9', value: 8, emoji: '🌟' },
  { label: '10–12', value: 10, emoji: '🚀' },
]

const TOTAL_STEPS = 5  // character, name, age, language, done

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setActiveProfile } = useProfile()

  const [step, setStep]     = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const [form, setForm] = useState({
    character: '',
    name: '',
    age: null,
    language: '',
  })

  const update = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  function next() { setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)) }
  function back() { setStep(s => Math.max(s - 1, 0)) }

  async function finish() {
    setSaving(true)
    setError('')
    try {
      const { data, error: dbErr } = await supabase
        .from('child_profiles')
        .insert({
          parent_user_id: user.id,
          name: form.name.trim(),
          avatar_character: form.character,
          age: form.age,
          language_ids: [form.language],
          points: 0,
          streaks: 0,
          awards: [],
          level: 1,
        })
        .select()
        .single()

      if (dbErr) throw dbErr
      setActiveProfile(data)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const stepProps = { form, update, next, back, finish, saving, error }

  return (
    <div style={{
      minHeight: '100dvh',
      background: colors.brand,
      display: 'flex', flexDirection: 'column',
      fontFamily: fonts.kids,
      overflow: 'hidden',
    }}>
      {/* Progress bar */}
      {step < TOTAL_STEPS - 1 && (
        <ProgressBar step={step} total={TOTAL_STEPS - 1} />
      )}

      {/* Step content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {step === 0 && <StepCharacter {...stepProps} />}
            {step === 1 && <StepName {...stepProps} />}
            {step === 2 && <StepAge {...stepProps} />}
            {step === 3 && <StepLanguage {...stepProps} />}
            {step === 4 && <StepDone {...stepProps} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }) {
  const pct = ((step + 1) / total) * 100
  return (
    <div style={{ padding: `${spacing.base}px ${spacing.base}px 0` }}>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: radii.full }}>
        <motion.div
          style={{ height: '100%', background: colors.white, borderRadius: radii.full }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}

// ─── Shared card wrapper ───────────────────────────────────────────────────────

function StepCard({ emoji, title, subtitle, children, footer }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: `${spacing['2xl']}px ${spacing.base}px ${spacing.base}px`,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: spacing.xl }}>
        {emoji && <div style={{ fontSize: 56, lineHeight: 1, marginBottom: spacing.sm }}>{emoji}</div>}
        <h1 style={{
          fontSize: fontSizes['2xl'], fontWeight: fontWeights.black,
          color: colors.white, margin: 0, lineHeight: 1.15,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.7)',
            margin: `${spacing.sm}px 0 0`, fontFamily: fonts.body, lineHeight: 1.5,
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1 }}>{children}</div>

      {/* CTA */}
      {footer && <div style={{ marginTop: spacing.lg }}>{footer}</div>}
    </div>
  )
}

// ─── Primary button ────────────────────────────────────────────────────────────

function PrimaryBtn({ label, onClick, disabled }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.97 }}
      style={{
        width: '100%', padding: '16px',
        background: disabled ? 'rgba(255,255,255,0.25)' : colors.white,
        color: disabled ? 'rgba(255,255,255,0.5)' : colors.brand,
        border: 'none', borderRadius: radii.xl,
        fontSize: fontSizes.base, fontWeight: fontWeights.black,
        fontFamily: fonts.kids, cursor: disabled ? 'default' : 'pointer',
        transition: 'background 0.15s',
      }}
    >
      {label}
    </motion.button>
  )
}

// ─── Step 0: Character select ─────────────────────────────────────────────────

function StepCharacter({ form, update, next }) {
  return (
    <StepCard
      emoji="🌍"
      title="Pick your guide!"
      subtitle="Your companion will cheer you on every step of the way."
      footer={<PrimaryBtn label="Let's go →" onClick={next} disabled={!form.character} />}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
        {CHARACTERS.map(c => {
          const active = form.character === c.key
          return (
            <motion.button
              key={c.key}
              onClick={() => update('character', c.key)}
              whileTap={{ scale: 0.94 }}
              style={{
                background: active ? colors.white : 'rgba(255,255,255,0.12)',
                border: active ? `3px solid ${colors.white}` : '3px solid transparent',
                borderRadius: radii.xl,
                padding: `${spacing.lg}px ${spacing.base}px`,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 44, lineHeight: 1 }}>{c.emoji}</div>
              <p style={{
                fontSize: fontSizes.base, fontWeight: fontWeights.bold,
                color: active ? colors.brand : colors.white,
                margin: `${spacing.sm}px 0 0`, fontFamily: fonts.kids,
              }}>
                {c.name}
              </p>
              <p style={{
                fontSize: fontSizes.xs, color: active ? colors.textMuted : 'rgba(255,255,255,0.6)',
                margin: `2px 0 0`, fontFamily: fonts.body,
              }}>
                {c.personality}
              </p>
            </motion.button>
          )
        })}
      </div>
    </StepCard>
  )
}

// ─── Step 1: Child's name ─────────────────────────────────────────────────────

function StepName({ form, update, next, back }) {
  const character = characters[form.character] ?? characters.ziki
  return (
    <StepCard
      emoji={character.emoji}
      title={`Hi! I'm ${character.name}.`}
      subtitle="What's the name of the child I'll be learning with?"
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          <PrimaryBtn label="Next →" onClick={next} disabled={!form.name.trim()} />
          <BackBtn onClick={back} />
        </div>
      }
    >
      <input
        type="text"
        autoFocus
        autoComplete="off"
        value={form.name}
        onChange={e => update('name', e.target.value)}
        placeholder="Child's first name"
        maxLength={32}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '16px 18px',
          background: 'rgba(255,255,255,0.15)',
          border: form.name ? `2px solid ${colors.white}` : '2px solid rgba(255,255,255,0.3)',
          borderRadius: radii.xl,
          fontSize: fontSizes.lg, fontFamily: fonts.kids,
          color: colors.white, outline: 'none',
        }}
        onKeyDown={e => { if (e.key === 'Enter' && form.name.trim()) next() }}
      />
      <p style={{ fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontFamily: fonts.body }}>
        This is just for personalisation — it stays private.
      </p>
    </StepCard>
  )
}

// ─── Step 2: Age group ────────────────────────────────────────────────────────

function StepAge({ form, update, next, back }) {
  return (
    <StepCard
      title={`How old is ${form.name || 'the learner'}?`}
      subtitle="We tailor lessons and vocabulary to the right age level."
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          <PrimaryBtn label="Next →" onClick={next} disabled={form.age === null} />
          <BackBtn onClick={back} />
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
        {AGE_GROUPS.map(ag => {
          const active = form.age === ag.value
          return (
            <motion.button
              key={ag.value}
              onClick={() => update('age', ag.value)}
              whileTap={{ scale: 0.94 }}
              style={{
                background: active ? colors.white : 'rgba(255,255,255,0.12)',
                border: active ? `3px solid ${colors.white}` : '3px solid transparent',
                borderRadius: radii.xl,
                padding: `${spacing.lg}px`,
                cursor: 'pointer', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 36 }}>{ag.emoji}</div>
              <p style={{
                fontSize: fontSizes.lg, fontWeight: fontWeights.black,
                color: active ? colors.brand : colors.white,
                margin: `${spacing.xs}px 0 0`, fontFamily: fonts.kids,
              }}>
                {ag.label}
              </p>
            </motion.button>
          )
        })}
      </div>
    </StepCard>
  )
}

// ─── Step 3: Language select ──────────────────────────────────────────────────

function StepLanguage({ form, update, next, back }) {
  return (
    <StepCard
      title="Which language first?"
      subtitle={`${form.name || 'Your learner'} can always add more later.`}
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          <PrimaryBtn label="Let's start! 🎉" onClick={next} disabled={!form.language} />
          <BackBtn onClick={back} />
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        {LANGUAGES.map(lang => {
          const active = form.language === lang.id
          return (
            <motion.button
              key={lang.id}
              onClick={() => update('language', lang.id)}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: spacing.md,
                background: active ? colors.white : 'rgba(255,255,255,0.12)',
                border: active ? `2.5px solid ${colors.white}` : '2.5px solid transparent',
                borderRadius: radii.xl,
                padding: `${spacing.md}px ${spacing.base}px`,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 32 }}>{lang.flag}</span>
              <div>
                <p style={{
                  fontSize: fontSizes.base, fontWeight: fontWeights.bold,
                  color: active ? colors.brand : colors.white,
                  margin: 0, fontFamily: fonts.kids,
                }}>
                  {lang.name}
                </p>
                <p style={{
                  fontSize: fontSizes.xs, color: active ? colors.textMuted : 'rgba(255,255,255,0.6)',
                  margin: '2px 0 0', fontFamily: fonts.body,
                }}>
                  {lang.blurb}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </StepCard>
  )
}

// ─── Step 4: Done ─────────────────────────────────────────────────────────────

function StepDone({ form, finish, saving, error }) {
  const character = characters[form.character] ?? characters.ziki
  const lang = LANGUAGES.find(l => l.id === form.language)

  return (
    <StepCard
      emoji="🎊"
      title={`Ready, ${form.name}!`}
      subtitle={`${character.emoji} ${character.name} is excited to teach you ${lang?.name ?? ''}!`}
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {error && (
            <p style={{
              fontSize: fontSizes.sm, color: colors.coral,
              background: colors.coralLight, padding: '10px 14px',
              borderRadius: radii.md, margin: 0, fontFamily: fonts.body,
            }}>
              {error}
            </p>
          )}
          <PrimaryBtn
            label={saving ? 'Setting up…' : 'Start learning! →'}
            onClick={finish}
            disabled={saving}
          />
        </div>
      }
    >
      {/* Summary card */}
      <div style={{
        background: 'rgba(255,255,255,0.12)', borderRadius: radii.xl,
        padding: `${spacing.lg}px ${spacing.base}px`,
      }}>
        {[
          { label: 'Name',      value: form.name },
          { label: 'Guide',     value: `${character.emoji} ${character.name}` },
          { label: 'Language',  value: `${lang?.flag} ${lang?.name}` },
        ].map(row => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: `${spacing.sm}px 0`,
            borderBottom: `1px solid rgba(255,255,255,0.12)`,
          }}>
            <span style={{ fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.65)', fontFamily: fonts.body }}>
              {row.label}
            </span>
            <span style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.white, fontFamily: fonts.kids }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </StepCard>
  )
}

// ─── Back button ──────────────────────────────────────────────────────────────

function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '12px',
        background: 'none', border: 'none',
        fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.6)',
        cursor: 'pointer', fontFamily: fonts.body,
      }}
    >
      ← Back
    </button>
  )
}
