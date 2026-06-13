-- ============================================================
-- 2026 世界杯预测平台 — 完整数据库 Schema
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================================

-- 1. 用户表 (Supabase Auth 自动创建 auth.users, 这里建 public profile)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT DEFAULT '👤',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_demo BOOLEAN DEFAULT FALSE
);

-- 2. 比赛表
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  group_name TEXT,
  stadium TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'group',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','finished','postponed')),
  home_score INT,
  away_score INT,
  home_penalties INT,
  away_penalties INT,
  events JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 预测表
CREATE TABLE IF NOT EXISTS public.predictions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_id TEXT REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  predicted_home_score INT NOT NULL,
  predicted_away_score INT NOT NULL,
  joker_used BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  settled BOOLEAN DEFAULT FALSE,
  points INT,
  settlement_type TEXT CHECK (settlement_type IN ('exact','goal_diff','outcome','wrong')),
  stage_multiplier REAL DEFAULT 1.0,
  UNIQUE(user_id, match_id)
);

-- 4. 评论表
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_id TEXT REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  text TEXT NOT NULL CHECK (char_length(text) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 排行榜物化视图 (实时计算)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.leaderboard AS
SELECT
  p.user_id,
  pr.display_name,
  COALESCE(SUM(p.points), 0) AS total_points,
  COUNT(CASE WHEN p.settlement_type = 'exact' THEN 1 END) AS exact_count,
  COUNT(CASE WHEN p.settlement_type = 'goal_diff' THEN 1 END) AS goal_diff_count,
  COUNT(CASE WHEN p.settlement_type = 'outcome' THEN 1 END) AS outcome_count,
  COUNT(p.id) AS total_predictions,
  CASE
    WHEN COUNT(p.id) > 0
    THEN ROUND((COUNT(CASE WHEN p.settlement_type IN ('exact','goal_diff','outcome') THEN 1 END)::numeric / COUNT(p.id)), 3)
    ELSE 0
  END AS accuracy,
  NOW() AS updated_at
FROM public.predictions p
JOIN public.profiles pr ON pr.id = p.user_id
WHERE p.settled = TRUE
GROUP BY p.user_id, pr.display_name
ORDER BY total_points DESC;

-- 6. 刷新排行榜函数
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard;
END;
$$ LANGUAGE plpgsql;

-- 7. 索引
CREATE INDEX IF NOT EXISTS idx_predictions_user ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON public.predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_predictions_settled ON public.predictions(settled);
CREATE INDEX IF NOT EXISTS idx_comments_match ON public.comments(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

-- 8. RLS 策略 (允许客户端直接读取)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 所有人可读
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public read predictions" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);

-- 认证用户可写自己的数据
CREATE POLICY "Users insert own predictions" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own predictions" ON public.predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- 9. 自动创建 profile 触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    '👤'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
