import { createContext, useContext, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [activeProfile, setActiveProfile] = useState(null)

  // Optimistic point increment — updates local state immediately, persists to DB
  const addPoints = useCallback(async (amount) => {
    if (!activeProfile) return
    setActiveProfile(prev => ({ ...prev, points: prev.points + amount }))
    await supabase.rpc('increment_points', { profile_id: activeProfile.id, amount })
  }, [activeProfile])

  // Update streak on lesson completion
  const recordActivity = useCallback(async () => {
    if (!activeProfile) return
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('child_profiles')
      .update({ last_active_date: today })
      .eq('id', activeProfile.id)
      .select('streaks, last_active_date')
      .single()
    if (data) setActiveProfile(prev => ({ ...prev, streaks: data.streaks }))
  }, [activeProfile])

  return (
    <ProfileContext.Provider value={{ activeProfile, setActiveProfile, addPoints, recordActivity }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider')
  return ctx
}
