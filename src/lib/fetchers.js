// All Supabase data fetchers. Each function maps to one SWR key.
// Add new fetchers here — never inline supabase queries in components.

import { supabase } from './supabase'

// ─── Countries ───────────────────────────────────────────────────────────────

export async function fetchActiveCountries() {
  const { data, error } = await supabase
    .from('countries')
    .select('id, name, code, flag_emoji')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data
}

// ─── Languages ────────────────────────────────────────────────────────────────

export async function fetchLanguagesByCountry(countryCode) {
  const { data, error } = await supabase
    .from('languages')
    .select(`
      id, name, code, flag_emoji,
      script, text_direction, has_tts_support,
      countries!inner(code)
    `)
    .eq('countries.code', countryCode)
  if (error) throw error
  return data
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export async function fetchLessonsByLanguage(languageId) {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, emoji, difficulty, xp, content_type, is_premium, status')
    .eq('language_id', languageId)
    .eq('status', 'published')
    .order('created_at')
  if (error) throw error
  return data
}

export async function fetchLessonWithCards(lessonId) {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      id, title, emoji, difficulty, xp, cultural_note,
      cards (
        id, word, meaning, phonetic, phonetic_ipa, emoji,
        audio_url, image_url
      )
    `)
    .eq('id', lessonId)
    .single()
  if (error) throw error
  return data
}

export async function fetchQuizQuestions(lessonId) {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, question, options, answer_index')
    .eq('lesson_id', lessonId)
    .order('created_at')
  if (error) throw error
  return data
}

// ─── Child profiles ───────────────────────────────────────────────────────────

export async function fetchChildProfiles(parentUserId) {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('id, name, avatar_character, language_ids, points, streaks, awards, level')
    .eq('parent_user_id', parentUserId)
    .order('created_at')
  if (error) throw error
  return data
}

// ─── Progress persistence ─────────────────────────────────────────────────────

export async function upsertLessonProgress({ childProfileId, lessonId, completed, pointsEarned }) {
  const { error } = await supabase
    .from('quiz_attempts')
    .upsert({
      child_profile_id: childProfileId,
      lesson_id: lessonId,
      score: completed ? 1 : 0,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'child_profile_id,lesson_id' })
  if (error) throw error

  if (pointsEarned > 0) {
    const { error: pointsError } = await supabase.rpc('increment_points', {
      profile_id: childProfileId,
      amount: pointsEarned,
    })
    if (pointsError) throw pointsError
  }
}
