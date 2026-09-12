-- =========================================================================
-- MIGRATION: 20260912000000_community_posts.sql
-- CIRI MEDIA SOSIAL (MOMEN KOMUNITI MINGGU AKTIVITI MRSM TUMPAT)
-- =========================================================================

-- 1. JADUAL SIARAN MEDIA SOSIAL (COMMUNITY POSTS)
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    storage_path TEXT,
    caption TEXT,
    author_name TEXT NOT NULL,
    author_role TEXT DEFAULT 'Warga MRSM',
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indeks untuk susunan masa dan carian
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_teacher_id ON public.community_posts(teacher_id);

-- 2. JADUAL KOMEN SIARAN (POST COMMENTS)
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_role TEXT DEFAULT 'Warga MRSM',
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id, created_at ASC);

-- 3. JADUAL REAKSI SUKA (POST LIKES)
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_post_likes_post_client UNIQUE (post_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);

-- 4. KAWALAN KESELAMATAN (ROW LEVEL SECURITY - RLS)
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Dasar Bacaan Awam (Public Read)
DROP POLICY IF EXISTS "Public read community_posts" ON public.community_posts;
CREATE POLICY "Public read community_posts" ON public.community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read post_comments" ON public.post_comments;
CREATE POLICY "Public read post_comments" ON public.post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read post_likes" ON public.post_likes;
CREATE POLICY "Public read post_likes" ON public.post_likes FOR SELECT USING (true);

-- Dasar Penulisan Awam (Public/Anon Insert & Update)
DROP POLICY IF EXISTS "Allow insert community_posts" ON public.community_posts;
CREATE POLICY "Allow insert community_posts" ON public.community_posts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update community_posts" ON public.community_posts;
CREATE POLICY "Allow update community_posts" ON public.community_posts FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete community_posts" ON public.community_posts;
CREATE POLICY "Allow delete community_posts" ON public.community_posts FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow insert post_comments" ON public.post_comments;
CREATE POLICY "Allow insert post_comments" ON public.post_comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete post_comments" ON public.post_comments;
CREATE POLICY "Allow delete post_comments" ON public.post_comments FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow insert post_likes" ON public.post_likes;
CREATE POLICY "Allow insert post_likes" ON public.post_likes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete post_likes" ON public.post_likes;
CREATE POLICY "Allow delete post_likes" ON public.post_likes FOR DELETE USING (true);
