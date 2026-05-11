import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import { Fire, Star, BookOpen, CheckCircle, Lock } from '@phosphor-icons/react'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../context/ProfileContext'
import { fetchLessonsByLanguage } from '../../lib/fetchers'
import {
  colors, fonts, fontWeights, fontSizes, radii, spacing, characters,
} from '../../lib/theme'

// Kenya MVP — language list scoped to KE. Will come from Supabase (fetchLanguagesByCountry)
// once country onboarding is wired (Task 2.2). Colour scheme intentional per brand guide.
const KE_LANGUAGES = [
  { id: 'sw',  name: 'Kiswahili', flag: '🇰🇪', bg: colors.brandFaint, accent: colors.brand },
  { id: 'ki',  name: 'Kikuyu',    flag: '🌿',   bg: colors.greenLight,  accent: colors.green },
  { id: 'luo', name: 'Dholuo',    flag: '🌊',   bg: colors.blueLight,   accent: colors.blue },
  { id: 'luy', name: 'Luhya',     flag: '☀️',   bg: colors.yellowLight, accent: colors.yellow },
]

function timeGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Level thresholds ─────────────────────────────────────────────────────────
function pointsToLevel(points = 0) {
  if (points < 100)  return 1
  if (points < 250)  return 2
  if (points < 500)  return 3
  if (points < 1000) return 4
  return 5
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { activeProfile, setActiveProfile } = useProfile()
  const [activeLang, setActiveLang] = useState(KE_LANGUAGES[0].id)

  // Lessons for the selected language — fetched with SWR
  const swrKey = activeLang ? ['lessons', activeLang] : null
  const { data: lessons, isLoading, error } = useSWR(
    swrKey,
    ([, langId]) => fetchLessonsByLanguage(langId),
    { revalidateOnFocus: false },
  )

  const lang = useMemo(() => KE_LANGUAGES.find(l => l.id === activeLang), [activeLang])

  // Profile fallback so UI never crashes mid-onboarding
  const profile = activeProfile ?? { name: 'Learner', avatar_character: 'ziki', points: 0, streaks: 0 }
  const character = characters[profile.avatar_character] ?? characters.ziki
  const level = pointsToLevel(profile.points)

  return (
    <div style={{ minHeight: '100dvh', background: colors.greyFaint, fontFamily: fonts.kids }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header style={{
        background: colors.brand,
        padding: `${spacing.base}px ${spacing.base}px ${spacing['2xl']}px`,
      }}>
        {/* Greeting row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.65)', margin: 0, fontFamily: fonts.body }}>
              {timeGreeting()} 👋
            </p>
            <p style={{
              fontSize: fontSizes.xl, fontWeight: fontWeights.black,
              color: colors.white, margin: '2px 0 0', lineHeight: 1.1,
            }}>
              {character.emoji} {profile.name}!
            </p>
          </div>
          {/* Settings / sign-out */}
          <button
            onClick={() => navigate('/settings')}
            aria-label="Settings"
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: radii.full, width: 40, height: 40,
              fontSize: 18, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            ⚙️
          </button>
        </div>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.md }}>
          <StatPill icon={<Fire weight="fill" color={colors.orange} size={14} />} label={`${profile.streaks} day streak`} />
          <StatPill icon={<Star weight="fill" color={colors.yellow} size={14} />} label={`${profile.points} XP`} />
          <StatPill icon={<BookOpen weight="fill" color={colors.green} size={14} />} label={`Level ${level}`} />
        </div>
      </header>

      {/* Pulls content up to overlap the purple header */}
      <main style={{ marginTop: -spacing.xl, padding: `0 ${spacing.base}px ${spacing['3xl']}px` }}>

        {/* ── Language tabs ─────────────────────────────────────────────── */}
        <section aria-label="Choose language">
          <div style={{
            display: 'flex', gap: spacing.sm,
            overflowX: 'auto', paddingBottom: 4,
            // hide scrollbar
            scrollbarWidth: 'none', msOverflowStyle: 'none',
          }}>
            {KE_LANGUAGES.map(l => (
              <LanguageTab
                key={l.id}
                language={l}
                active={activeLang === l.id}
                onClick={() => setActiveLang(l.id)}
              />
            ))}
          </div>
        </section>

        {/* ── Lessons ───────────────────────────────────────────────────── */}
        <section aria-label="Lessons" style={{ marginTop: spacing.base }}>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <LessonGrid key="skeleton">
                {Array.from({ length: 4 }, (_, i) => <LessonSkeleton key={i} />)}
              </LessonGrid>
            ) : error ? (
              <ErrorCard key="error" message="Couldn't load lessons. Tap to retry." onRetry={() => {}} />
            ) : lessons?.length ? (
              <LessonGrid key={activeLang}>
                {lessons.map((lesson, i) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    accent={lang.accent}
                    index={i}
                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                  />
                ))}
              </LessonGrid>
            ) : (
              <EmptyLessons key="empty" langName={lang.name} />
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ icon, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      background: 'rgba(255,255,255,0.15)',
      padding: '5px 10px', borderRadius: radii.full,
    }}>
      {icon}
      <span style={{ fontSize: fontSizes.xs, color: colors.white, fontFamily: fonts.body, fontWeight: fontWeights.semibold }}>
        {label}
      </span>
    </div>
  )
}

function LanguageTab({ language, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      aria-pressed={active}
      style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '10px 16px',
        background: active ? colors.white : 'rgba(255,255,255,0.85)',
        border: active ? `2.5px solid ${colors.brand}` : `2px solid transparent`,
        borderRadius: radii.full,
        cursor: 'pointer',
        boxShadow: active ? '0 2px 12px rgba(57,56,147,0.18)' : 'none',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
    >
      <span style={{ fontSize: 18 }}>{language.flag}</span>
      <span style={{
        fontSize: fontSizes.sm, fontWeight: active ? fontWeights.bold : fontWeights.medium,
        color: active ? colors.brand : colors.grey,
        fontFamily: fonts.body,
      }}>
        {language.name}
      </span>
    </motion.button>
  )
}

function LessonGrid({ children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: spacing.md,
    }}>
      {children}
    </div>
  )
}

function LessonCard({ lesson, accent, index, onClick }) {
  const isLocked = lesson.is_premium
  const isDone   = lesson.completed  // will come from progress join in Task 2.2

  return (
    <motion.button
      onClick={isLocked ? undefined : onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
      whileTap={isLocked ? {} : { scale: 0.96 }}
      aria-label={`${lesson.title}${isLocked ? ' — locked' : ''}`}
      style={{
        background: colors.white,
        border: `2px solid ${isDone ? accent + '55' : colors.border}`,
        borderRadius: radii.xl,
        padding: spacing.base,
        cursor: isLocked ? 'default' : 'pointer',
        textAlign: 'left',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        opacity: isLocked ? 0.65 : 1,
      }}
    >
      {/* Completion badge */}
      {isDone && (
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <CheckCircle weight="fill" size={20} color={accent} />
        </div>
      )}
      {isLocked && (
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <Lock weight="fill" size={18} color={colors.greyLight} />
        </div>
      )}

      {/* Emoji */}
      <div style={{
        width: 56, height: 56, borderRadius: radii.lg,
        background: accent + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, marginBottom: spacing.sm,
      }}>
        {lesson.emoji ?? '📖'}
      </div>

      {/* Title */}
      <p style={{
        fontSize: fontSizes.base, fontWeight: fontWeights.bold,
        color: colors.text, margin: '0 0 4px',
        lineHeight: 1.25, fontFamily: fonts.kids,
      }}>
        {lesson.title}
      </p>

      {/* XP badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Star weight="fill" size={12} color={colors.yellow} />
        <span style={{ fontSize: fontSizes.xs, color: colors.textMuted, fontFamily: fonts.body }}>
          {lesson.xp ?? 10} XP
        </span>
        {lesson.difficulty && (
          <>
            <span style={{ color: colors.border, fontSize: 10, margin: '0 2px' }}>•</span>
            <span style={{ fontSize: fontSizes.xs, color: colors.textMuted, fontFamily: fonts.body }}>
              {'⭐'.repeat(lesson.difficulty)}
            </span>
          </>
        )}
      </div>
    </motion.button>
  )
}

function LessonSkeleton() {
  return (
    <div style={{
      background: colors.white, borderRadius: radii.xl,
      padding: spacing.base, border: `2px solid ${colors.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ width: 56, height: 56, borderRadius: radii.lg, background: colors.greyFaint, marginBottom: spacing.sm }} />
      <div style={{ height: 16, width: '80%', background: colors.greyFaint, borderRadius: radii.sm, marginBottom: 8 }} />
      <div style={{ height: 12, width: '50%', background: colors.greyFaint, borderRadius: radii.sm }} />
    </div>
  )
}

function EmptyLessons({ langName }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        gridColumn: '1 / -1',
        background: colors.white, borderRadius: radii.xl,
        padding: `${spacing['2xl']}px ${spacing.base}px`,
        textAlign: 'center',
        border: `2px dashed ${colors.border}`,
      }}
    >
      <div style={{ fontSize: 48, marginBottom: spacing.sm }}>📚</div>
      <p style={{ fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: colors.text, margin: 0, fontFamily: fonts.kids }}>
        {langName} lessons coming soon!
      </p>
      <p style={{ fontSize: fontSizes.sm, color: colors.textMuted, marginTop: 6, fontFamily: fonts.body }}>
        We're preparing your lessons. Check back soon.
      </p>
    </motion.div>
  )
}

function ErrorCard({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        gridColumn: '1 / -1',
        background: colors.coralLight, borderRadius: radii.xl,
        padding: spacing.base, textAlign: 'center',
        border: `1.5px solid ${colors.coral}`,
      }}
    >
      <p style={{ fontSize: fontSizes.sm, color: colors.coral, margin: 0, fontFamily: fonts.body }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        style={{
          marginTop: spacing.sm, fontSize: fontSizes.sm, color: colors.coral,
          background: 'none', border: 'none', cursor: 'pointer',
          fontWeight: fontWeights.bold, fontFamily: fonts.body, textDecoration: 'underline',
        }}
      >
        Try again
      </button>
    </motion.div>
  )
}
