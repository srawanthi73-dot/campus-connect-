import { supabase } from './supabase'

const DOMAIN = 'campus.connect'

export const signInWithRollNumber = async (rollNumber, password) => {
  const email = `${rollNumber.toLowerCase()}@${DOMAIN}`
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Get user profile to check role and reset status
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError) throw profileError

  return { user: data.user, profile }
}

export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error

  // Update profile to show password changed
  const { error: profileError } = await supabase
    .from('users')
    .update({ needs_reset: false })
    .eq('id', data.user.id)

  if (profileError) throw profileError

  return data
}

export const signUpWithRollNumber = async (name, rollNumber, password) => {
  const email = `${rollNumber.toLowerCase()}@${DOMAIN}`
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        roll_number: rollNumber
      }
    }
  })

  if (error) throw error

  // Create or update public user profile
  const { error: profileError } = await supabase
    .from('users')
    .upsert([{
      id: data.user.id,
      name,
      roll_number: rollNumber,
      role: 'user',
      needs_reset: false
    }], { onConflict: 'roll_number' })

  if (profileError) throw profileError

  return { user: data.user }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
