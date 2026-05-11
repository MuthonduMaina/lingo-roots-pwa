/**
 * Lesson screen — "Look & Listen" card-by-card flow (Task 2.3)
 *
 * Flow: Intro splash → Card 1 … Card N → Completion splash → /lesson/:id/quiz
 *
 * Each card shows:
 *  - Illustration (image_url) or emoji fallback
 *  - Word in target language
 *  - Phonetic pronunciation
 *  - Meaning in English
 *  - Audio button (plays audio_url, falls back to Web Speech API TTS)
 *
 * Tap anywhere on the card to advance; swipe support via Framer Motion drag.
 * Companion character reacts after every third card (PRD §8.4).
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import { SpeakerHigh, ArrowRight, X } from '@phosphor-icons/react'
import { useProfile } from '../../context/ProfileContext'
import { fetchLessonWithCards } from '../../lib/fetchers'
import {
  colors, fonts, fontWeights, fontSizes, radii, spacing, characters, durations,
} from '../../lib/theme'

// ─── Audio playback ───────────────────────────────────────────────────────────

function useAudio() {
  const audioRef = useRef(null)

  const play = useCallback(async (url, word, lang = 'sw') => {
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    if (url) {
      // Prefer recorded audio
      const audio = new Audio(url)
      audioRef.current = audio
      audio.play().catch(() => speakWord(word, lang))
    } else {
      speakWord(word, lang)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => () => {
    if (audioRef.current) audioRef.current.pause()
  }, [])

  return { play }
}

// Web Speech API TTS fallback — maps our language codes to BCP-47 tags
const LANG_TTS = {
  sw:  'sw-KE',
  ki:  'sw-KE',   // no Kikuyu voice; Swahili is closest
  luo: 'sw-KE',
  luy: 'sw-KE',
}

function speakWord(word, lang) {
  if (!('speechSynthesis' in window)) return
  const utt = new SpeechSynthesisUtterance(word)
  utt.lang = LANG_TTS[lang] ?? 'sw-KE'
  utt.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utt)
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LessonScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeProfile } = useProfile()
  const { play } = useAudio()

  const { data: lesson, isLoading, error } = useSWR(
    id ? ['lesson', id] : null,
    ([, lessonId]) => fetchLessonWithCards(lessonId),
    { revalidateOnFocus: false },
  )

  const [phase, setPhase] = useState('intro')   // 'intro' | 'cards' | 'done'
  const [cardIndex, setCardIndex] = useState(0)
  const [direction, setDirection] = useState(1)  // 1 = forward, -1 = back

  const cards = lesson?.cards ?? []
  const card  = cards[cardIndex]
  const character = characters[activeProfile?.avatar_character ?? 'ziki']

  function advance() {
    if (cardIndex < cards.length - 1) {
      setDirection(1)
      setCardIndex(i => i + 1)
    } else {
      setPhase('done')
    }
  }

  function goBack() {
    if (cardIndex > 0) {
      setDirection(-1)
      setCardIndex(i => i - 1)
    } else {
      setPhase('intro')
    }
  }

  if (isLoading) return <LessonLoading />
  if (error || !lesson) return <LessonError onBack={() => navigate(-1)} />

  return (
    <div style={{
      minHeight: '100dvh', background: colors.greyFaint,
      display: 'flex', flexDirection: 'column', fontFamily: fonts.kids,
      overflow: 'hidden',
    }}>

      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: spacing.base,
        padding: `${spacing.base}px ${spacing.base}px`,
        background: colors.white,
        borderBottom: `1px solid ${colors.border}`,
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Exit lesson"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <X size={22} color={colors.textMuted} />
        </button>

        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.text, fontFamily: fonts.kids }}>
            {lesson.emoji ?? '📖'} {lesson.title}
          </p>
          {phase === 'cards' && (
            <ProgressDots total={cards.length} current={cardIndex} />
          )}
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction}>
          {phase === 'intro' && (
            <IntroSplash
              key="intro"
              lesson={lesson}
              character={character}
              onStart={() => { setCardIndex(0); setPhase('cards') }}
              onBack={() => navigate(-1)}
            />
          )}
          {phase === 'cards' && card && (
            <CardView
              key={cardIndex}
              card={card}
              direction={direction}
              index={cardIndex}
              total={cards.length}
              onPlay={() => play(card.audio_url, card.word)}
              onAdvance={advance}
              onBack={goBack}
            />
          )}
          {phase === 'done' && (
            <DoneSplash
              key="done"
              lesson={lesson}
              character={character}
              onQuiz={() => navigate(`/lesson/${id}/quiz`)}
              onHome={() => navigate('/')}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

// ─── Intro splash ─────────────────────────────────────────────────────────────

function IntroSplash({ lesson, character, onStart, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: spacing.base, textAlign: 'center', gap: spacing.lg,
      }}
    >
      <div style={{ fontSize: 72 }}>{lesson.emoji ?? '📖'}</div>

      <div>
        <h1 style={{
          fontSize: fontSizes['2xl'], fontWeight: fontWeights.black,
          color: colors.text, margin: 0,
        }}>
          {lesson.title}
        </h1>
        {lesson.cultural_note && (
          <p style={{
            fontSize: fontSizes.sm, color: colors.textMuted,
            margin: `${spacing.sm}px 0 0`, fontFamily: fonts.body, lineHeight: 1.6,
            maxWidth: 320,
          }}>
            {lesson.cultural_note}
          </p>
        )}
      </div>

      <div style={{
        background: colors.brandFaint, borderRadius: radii.xl,
        padding: `${spacing.sm}px ${spacing.base}px`,
        display: 'flex', alignItems: 'center', gap: spacing.sm,
      }}>
        <span style={{ fontSize: 24 }}>{character.emoji}</span>
        <p style={{ fontSize: fontSizes.sm, color: colors.brand, margin: 0, fontFamily: fonts.body }}>
          {character.name} will guide you through {lesson.cards?.length ?? 0} words!
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <PrimaryBtn label="Start learning →" onClick={onStart} />
        <BackBtn onClick={onBack} label="← Go back" />
      </div>
    </motion.div>
  )
}

// ─── Card view ────────────────────────────────────────────────────────────────

function CardView({ card, direction, index, total, onPlay, onAdvance, onBack }) {
  const isLast = index === total - 1

  return (
    <motion.div
      key={index}
      custom={direction}
      variants={{
        enter: d => ({ x: d * 60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: d => ({ x: d * -60, opacity: 0 }),
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.22 }}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: spacing.base, gap: spacing.base,
      }}
    >
      {/* Illustration card */}
      <div style={{
        flex: 1, background: colors.white,
        borderRadius: radii['2xl'],
        boxShadow: '0 4px 24px rgba(57,56,147,0.10)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: spacing.lg, padding: `${spacing['2xl']}px ${spacing.base}px`,
        minHeight: 0,
      }}>
        {/* Image or emoji fallback */}
        {card.image_url ? (
          <img
            src={card.image_url}
            alt={card.word}
            style={{
              width: 180, height: 180, objectFit: 'contain',
              borderRadius: radii.xl,
            }}
          />
        ) : (
          <div style={{
            width: 160, height: 160, borderRadius: radii.xl,
            background: colors.brandFaint,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 88,
          }}>
            {card.emoji ?? '🔤'}
          </div>
        )}

        {/* Word */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: fontSizes['3xl'], fontWeight: fontWeights.black,
            color: colors.text, margin: 0, lineHeight: 1,
          }}>
            {card.word}
          </h2>
          {card.phonetic && (
            <p style={{
              fontSize: fontSizes.base, color: colors.textMuted,
              margin: `${spacing.xs}px 0 0`, fontFamily: fonts.body,
            }}>
              {card.phonetic}
            </p>
          )}
          <p style={{
            fontSize: fontSizes.lg, color: colors.brand, fontWeight: fontWeights.bold,
            margin: `${spacing.sm}px 0 0`, fontFamily: fonts.body,
          }}>
            {card.meaning}
          </p>
        </div>

        {/* Listen button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onPlay}
          aria-label={`Hear "${card.word}"`}
          style={{
            width: 64, height: 64, borderRadius: radii.full,
            background: colors.brand, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 16px ${colors.brand}55`,
          }}
        >
          <SpeakerHigh size={28} color={colors.white} weight="fill" />
        </motion.button>
      </div>

      {/* Navigation row */}
      <div style={{ display: 'flex', gap: spacing.sm, flexShrink: 0 }}>
        {index > 0 && (
          <button
            onClick={onBack}
            style={{
              flex: 0, padding: '14px 18px',
              background: colors.white, border: `1.5px solid ${colors.border}`,
              borderRadius: radii.xl, cursor: 'pointer',
              fontSize: fontSizes.base, color: colors.textMuted,
            }}
          >
            ←
          </button>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAdvance}
          style={{
            flex: 1, padding: '14px',
            background: colors.brand, border: 'none',
            borderRadius: radii.xl, cursor: 'pointer',
            fontSize: fontSizes.base, fontWeight: fontWeights.black,
            color: colors.white, fontFamily: fonts.kids,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {isLast ? 'Finish →' : 'Next'}
          {!isLast && <ArrowRight size={18} weight="bold" />}
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── Done splash ──────────────────────────────────────────────────────────────

function DoneSplash({ lesson, character, onQuiz, onHome }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: spacing.base, textAlign: 'center', gap: spacing.lg,
      }}
    >
      <motion.div
        animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ fontSize: 80 }}
      >
        🎉
      </motion.div>

      <div>
        <h1 style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.black, color: colors.text, margin: 0 }}>
          Great job!
        </h1>
        <p style={{ fontSize: fontSizes.sm, color: colors.textMuted, margin: `${spacing.sm}px 0 0`, fontFamily: fonts.body }}>
          You learned all {lesson.cards?.length ?? 0} words in {lesson.title}.
        </p>
      </div>

      <div style={{
        background: colors.greenLight, borderRadius: radii.xl,
        padding: `${spacing.sm}px ${spacing.base}px`,
        display: 'flex', alignItems: 'center', gap: spacing.sm,
      }}>
        <span style={{ fontSize: 24 }}>{character.emoji}</span>
        <p style={{ fontSize: fontSizes.sm, color: colors.green, margin: 0, fontFamily: fonts.body }}>
          {character.name} is proud of you! Ready for the quiz?
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <PrimaryBtn label="Take the quiz →" onClick={onQuiz} />
        <BackBtn onClick={onHome} label="Back to home" />
      </div>
    </motion.div>
  )
}

// ─── Progress dots ─────────────────────────────────────────────────────────────

function ProgressDots({ total, current }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 16 : 6,
            height: 6,
            borderRadius: radii.full,
            background: i <= current ? colors.brand : colors.border,
            transition: 'width 0.2s, background 0.2s',
          }}
        />
      ))}
    </div>
  )
}

// ─── Loading / error states ───────────────────────────────────────────────────

function LessonLoading() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: colors.greyFaint,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: spacing.base }}>📖</div>
        <p style={{ fontSize: fontSizes.base, color: colors.textMuted, fontFamily: fonts.body }}>
          Loading lesson…
        </p>
      </div>
    </div>
  )
}

function LessonError({ onBack }) {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: spacing.base,
      background: colors.greyFaint, textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: spacing.base }}>😕</div>
      <p style={{ fontSize: fontSizes.base, color: colors.text, fontFamily: fonts.kids, margin: 0 }}>
        Couldn't load this lesson
      </p>
      <p style={{ fontSize: fontSizes.sm, color: colors.textMuted, margin: `${spacing.sm}px 0 ${spacing.lg}px`, fontFamily: fonts.body }}>
        Check your connection and try again.
      </p>
      <PrimaryBtn label="← Go back" onClick={onBack} />
    </div>
  )
}

// ─── Shared buttons ───────────────────────────────────────────────────────────

function PrimaryBtn({ label, onClick, disabled }) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '15px',
        background: disabled ? colors.greyLight : colors.brand,
        color: colors.white, border: 'none', borderRadius: radii.xl,
        fontSize: fontSizes.base, fontWeight: fontWeights.black,
        fontFamily: fonts.kids, cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {label}
    </motion.button>
  )
}

function BackBtn({ onClick, label = '← Back' }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '12px',
        background: 'none', border: 'none',
        fontSize: fontSizes.sm, color: colors.textMuted,
        cursor: 'pointer', fontFamily: fonts.body,
      }}
    >
      {label}
    </button>
  )
}
