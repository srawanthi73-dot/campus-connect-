import { supabase } from './supabase'

const DOMAIN = 'campus.connect'

export const signInWithRollNumber = async (email, password) => {
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // 🚀 Auto-create your Master Admin if it doesn't exist yet!
  if (error && email === 'masteradmin@campus.edu' && error.message.includes('Invalid login credentials')) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: 'Master Admin', roll_number: `MASTER_${Math.floor(Math.random() * 10000)}` }
      }
    })
    
    if (!signUpError && signUpData?.user) {
      error = null; // Clear local error
      data = signUpData; // Use new session
      
      // Enforce the Admin Role directly into your database
      await supabase.from('users').update({ role: 'admin' }).eq('id', data.user.id);
    } else {
      throw signUpError || error;
    }
  } else if (error) {
    throw error;
  }

  // Get user profile to check role and reset status
  let { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!profile) {
    // Auto-create missing profile record
    const { data: newProfile, error: createError } = await supabase
      .from('users')
      .insert([{
        id: data.user.id,
        name: data.user.user_metadata?.name || 'New Student',
        roll_number: data.user.user_metadata?.roll_number || 'EXT-000',
        role: 'user',
        needs_reset: false
      }])
      .select()
      .single()
    
    if (createError) throw createError
    profile = newProfile
  }

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

export const signUpWithRollNumber = async (name, rollNumber, email, password) => {
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
