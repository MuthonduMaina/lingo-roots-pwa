/**
 * Quiz screen — multiple-choice quiz after each lesson (Task 3.5)
 *
 * Flow: Question 1 … N → Result splash
 * Each question shows up to 4 options. Tap → instant feedback → next.
 * Correct answers glow green; wrong glows red (shows correct answer too).
 * XP awarded on completion via ProfileContext.addPoints.
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import { CheckCircle, XCircle, X } from '@phosphor-icons/react'
import { useProfile } from '../../context/ProfileContext'
import { fetchQuizQuestions, fetchLessonWithCards, upsertLessonProgress } from '../../lib/fetchers'
import {
  colors, fonts, fontWeights, fontSizes, radii, spacing, characters,
} from '../../lib/theme'

export default function QuizScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeProfile, addPoints, recordActivity } = useProfile()

  const { data: questions, isLoading } = useSWR(
    id ? ['quiz', id] : null,
    ([, lessonId]) => fetchQuizQuestions(lessonId),
    { revalidateOnFocus: false },
  )
  const { data: lesson } = useSWR(
    id ? ['lesson', id] : null,
    ([, lessonId]) => fetchLessonWithCards(lessonId),
    { revalidateOnFocus: false },
  )

  const [qIndex, setQIndex]   = useState(0)
  const [chosen, setChosen]   = useState(null)   // index of tapped option
  const [score, setScore]     = useState(0)
  const [phase, setPhase]     = useState('quiz') // 'quiz' | 'result'
  const [saving, setSaving]   = useState(false)

  const character = characters[activeProfile?.avatar_character ?? 'ziki']
  const q = questions?.[qIndex]

  function handleAnswer(optionIndex) {
    if (chosen !== null) return  // already answered
    setChosen(optionIndex)

    const correct = optionIndex === q.answer_index
    const newScore = correct ? score + 1 : score
    if (correct) setScore(newScore)

    setTimeout(() => {
      if (qIndex < (questions?.length ?? 0) - 1) {
        setQIndex(i => i + 1)
        setChosen(null)
      } else {
        finishQuiz(newScore)
      }
    }, 1000)
  }

  async function finishQuiz(finalScore) {
    setPhase('result')
    setSaving(true)
    const xp = lesson?.xp ?? 10
    const passed = finalScore >= Math.ceil((questions?.length ?? 1) * 0.6)

    try {
      await upsertLessonProgress({
        childProfileId: activeProfile?.id,
        lessonId: id,
        completed: passed,
        pointsEarned: passed ? xp : 0,
      })
      if (passed) {
        await addPoints(xp)
        await recordActivity()
      }
    } catch (_) {
      // best-effort — don't crash the result screen
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <QuizLoading />
  if (!questions?.length) return <NoQuiz onHome={() => navigate('/')} />

  return (
    <div style={{
      minHeight: '100dvh', background: colors.greyFaint,
      display: 'flex', flexDirection: 'column', fontFamily: fonts.kids,
    }}>

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: spacing.base,
        padding: spacing.base,
        background: colors.white, borderBottom: `1px solid ${colors.border}`,
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/')}
          aria-label="Exit quiz"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <X size={22} color={colors.textMuted} />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.text }}>
            Quiz — {lesson?.title ?? '…'}
          </p>
          {phase === 'quiz' && (
            <QuizProgress current={qIndex} total={questions.length} />
          )}
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          {phase === 'quiz' && q && (
            <QuizQuestion
              key={qIndex}
              question={q}
              chosen={chosen}
              onAnswer={handleAnswer}
            />
          )}
          {phase === 'result' && (
            <ResultSplash
              key="result"
              score={score}
              total={questions.length}
              xp={lesson?.xp ?? 10}
              character={character}
              saving={saving}
              onHome={() => navigate('/')}
              onRetry={() => {
                setQIndex(0)
                setChosen(null)
                setScore(0)
                setPhase('quiz')
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

// ─── Quiz question ─────────────────────────────────────────────────────────────

function QuizQuestion({ question, chosen, onAnswer }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.2 }}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: spacing.base, gap: spacing.base,
      }}
    >
      {/* Question text */}
      <div style={{
        background: colors.white, borderRadius: radii.xl,
        padding: `${spacing.xl}px ${spacing.base}px`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: fontSizes.lg, fontWeight: fontWeights.black,
          color: colors.text, margin: 0, lineHeight: 1.35,
        }}>
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        {question.options.map((option, i) => {
          const isChosen  = chosen === i
          const isCorrect = i === question.answer_index
          const isWrong   = isChosen && !isCorrect
          const showRight = chosen !== null && isCorrect

          let bg        = colors.white
          let border    = colors.border
          let textColor = colors.text

          if (showRight) { bg = colors.greenLight; border = colors.green; textColor = colors.green }
          if (isWrong)   { bg = colors.coralLight; border = colors.coral; textColor = colors.coral }

          return (
            <motion.button
              key={i}
              whileTap={chosen !== null ? {} : { scale: 0.97 }}
              onClick={() => onAnswer(i)}
              disabled={chosen !== null}
              style={{
                display: 'flex', alignItems: 'center', gap: spacing.base,
                background: bg, border: `2px solid ${border}`,
                borderRadius: radii.xl,
                padding: `${spacing.md}px ${spacing.base}px`,
                cursor: chosen !== null ? 'default' : 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: radii.full,
                background: border + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {showRight
                  ? <CheckCircle size={20} color={colors.green} weight="fill" />
                  : isWrong
                    ? <XCircle size={20} color={colors.coral} weight="fill" />
                    : <span style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.textMuted }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                }
              </div>
              <span style={{
                fontSize: fontSizes.base, fontWeight: fontWeights.semibold,
                color: textColor, fontFamily: fonts.body, textAlign: 'left',
              }}>
                {option}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Result splash ─────────────────────────────────────────────────────────────

function ResultSplash({ score, total, xp, character, saving, onHome, onRetry }) {
  const pct    = Math.round((score / total) * 100)
  const passed = score >= Math.ceil(total * 0.6)
  const emoji  = pct === 100 ? '🏆' : passed ? '🎊' : '💪'

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
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ fontSize: 80 }}
      >
        {emoji}
      </motion.div>

      <div>
        <h1 style={{
          fontSize: fontSizes['2xl'], fontWeight: fontWeights.black,
          color: colors.text, margin: 0,
        }}>
          {pct === 100 ? 'Perfect!' : passed ? 'Well done!' : 'Keep going!'}
        </h1>
        <p style={{
          fontSize: fontSizes.base, color: colors.textMuted,
          margin: `${spacing.sm}px 0 0`, fontFamily: fonts.body,
        }}>
          {score} / {total} correct — {pct}%
        </p>
      </div>

      {passed && (
        <div style={{
          background: colors.yellowLight, borderRadius: radii.xl,
          padding: `${spacing.sm}px ${spacing.lg}px`,
          display: 'flex', alignItems: 'center', gap: spacing.sm,
        }}>
          <span style={{ fontSize: 20 }}>⭐</span>
          <p style={{
            fontSize: fontSizes.sm, fontWeight: fontWeights.bold,
            color: colors.yellow, margin: 0, fontFamily: fonts.body,
          }}>
            {saving ? 'Saving…' : `+${xp} XP earned!`}
          </p>
        </div>
      )}

      <div style={{
        background: passed ? colors.greenLight : colors.brandFaint,
        borderRadius: radii.xl,
        padding: `${spacing.sm}px ${spacing.base}px`,
        display: 'flex', alignItems: 'center', gap: spacing.sm,
      }}>
        <span style={{ fontSize: 24 }}>{character.emoji}</span>
        <p style={{
          fontSize: fontSizes.sm,
          color: passed ? colors.green : colors.brand,
          margin: 0, fontFamily: fonts.body,
        }}>
          {passed
            ? `${character.name} is so proud of you!`
            : `${character.name} says: try again — you've got this!`}
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onHome}
          style={{
            width: '100%', padding: '15px',
            background: colors.brand, border: 'none', borderRadius: radii.xl,
            fontSize: fontSizes.base, fontWeight: fontWeights.black,
            color: colors.white, cursor: 'pointer', fontFamily: fonts.kids,
          }}
        >
          Back to home →
        </motion.button>
        {!passed && (
          <button
            onClick={onRetry}
            style={{
              width: '100%', padding: '12px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: fontSizes.sm, color: colors.textMuted, fontFamily: fonts.body,
            }}
          >
            Try again
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function QuizProgress({ current, total }) {
  const pct = ((current + 1) / total) * 100
  return (
    <div style={{ height: 4, background: colors.border, borderRadius: radii.full, marginTop: 4, overflow: 'hidden' }}>
      <motion.div
        style={{ height: '100%', background: colors.brand, borderRadius: radii.full }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}

// ─── Edge states ──────────────────────────────────────────────────────────────

function QuizLoading() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: colors.greyFaint,
    }}>
      <p style={{ fontSize: fontSizes.base, color: colors.textMuted, fontFamily: fonts.body }}>
        Loading quiz…
      </p>
    </div>
  )
}

function NoQuiz({ onHome }) {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: spacing.base,
      background: colors.greyFaint, textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: spacing.base }}>📝</div>
      <p style={{ fontSize: fontSizes.base, color: colors.text, fontFamily: fonts.kids, margin: 0 }}>
        No quiz for this lesson yet
      </p>
      <button
        onClick={onHome}
        style={{
          marginTop: spacing.lg, padding: '14px 32px',
          background: colors.brand, border: 'none', borderRadius: radii.xl,
          fontSize: fontSizes.base, fontWeight: fontWeights.black,
          color: colors.white, cursor: 'pointer', fontFamily: fonts.kids,
        }}
      >
        Back to home
      </button>
    </div>
  )
}
