-- SUPABASE DATABASE SCHEMA FOR CAMPUS CONNECT

-- 1. Create Users Table (extends Supabase Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  roll_number TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  needs_reset BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Events Table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME DEFAULT '17:30:00',
  venue TEXT,
  poster_url TEXT,
  organized_by TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Registrations Table (Dynamic Form Data)
CREATE TABLE public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, event_id) -- Prevent duplicate registrations
);

-- 4. Create Bookmarks Table
CREATE TABLE public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, event_id)
);

-- 5. Create FAQ Table 
CREATE TABLE public.faq (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT,
  user_id UUID REFERENCES public.users(id),
  answered_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

-- Create a Security Definer function to bypass RLS for role checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USERS Table Policies
CREATE POLICY "Public users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

-- EVENTS Table Policies
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify events" ON public.events
  FOR ALL USING (public.is_admin());

-- REGISTRATIONS Table Policies
CREATE POLICY "Users can view their own registrations" ON public.registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations" ON public.registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations" ON public.registrations
  FOR SELECT USING (public.is_admin());

-- FAQ Table Policies
CREATE POLICY "FAQs are viewable by everyone" ON public.faq
  FOR SELECT USING (true);

CREATE POLICY "Users can ask questions" ON public.faq
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can answer and manage FAQs" ON public.faq
  FOR ALL USING (public.is_admin());

-- BOOKMARKS Table Policies
CREATE POLICY "Users can manage their own bookmarks" ON public.bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- REALTIME CONFIGURATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.faq;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

-- STORAGE POLICIES (Assuming bucket 'posters' is created)
-- Allow anyone to read posters
CREATE POLICY "Public Poster Access" ON storage.objects FOR SELECT USING (bucket_id = 'posters');

-- Allow admins to upload, update, and delete posters
CREATE POLICY "Admin Poster Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posters' AND public.is_admin());
CREATE POLICY "Admin Poster Update" ON storage.objects FOR UPDATE USING (bucket_id = 'posters' AND public.is_admin());
CREATE POLICY "Admin Poster Delete" ON storage.objects FOR DELETE USING (bucket_id = 'posters' AND public.is_admin());
