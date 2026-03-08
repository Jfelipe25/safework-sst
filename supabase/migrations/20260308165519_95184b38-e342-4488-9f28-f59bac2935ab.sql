
-- =============================================
-- ROLES ENUM & USER ROLES TABLE
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: users can read their own roles, admins can read all
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  empresa TEXT NOT NULL,
  nit TEXT,
  ciudad TEXT,
  cargo TEXT,
  sector TEXT,
  arl TEXT,
  riesgo TEXT,
  trabajadores INTEGER,
  telefono TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- DIAGNOSTICS TABLE
-- =============================================
CREATE TABLE public.diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  score INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'low',
  cat_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diagnostics"
  ON public.diagnostics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all diagnostics"
  ON public.diagnostics FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own diagnostics"
  ON public.diagnostics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete diagnostics"
  ON public.diagnostics FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- SOLICITUDES TABLE (contact requests)
-- =============================================
CREATE TABLE public.solicitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mensaje TEXT NOT NULL,
  disponibilidad TEXT,
  score INTEGER,
  nivel TEXT,
  leida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can insert own solicitudes"
  ON public.solicitudes FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can view own solicitudes"
  ON public.solicitudes FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all solicitudes"
  ON public.solicitudes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update solicitudes"
  ON public.solicitudes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- TRAZ_STATUSES TABLE
-- =============================================
CREATE TABLE public.traz_statuses (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#64748B',
  es_custom BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.traz_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view statuses"
  ON public.traz_statuses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage statuses"
  ON public.traz_statuses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default statuses
INSERT INTO public.traz_statuses (id, label, color, es_custom) VALUES
  ('sin-diag', 'Sin diagnóstico', '#64748B', false),
  ('con-diag', 'Con diagnóstico', '#3B82F6', false),
  ('correo-env', 'Correo enviado', '#8B5CF6', false),
  ('contactado', 'Contactado', '#0EA5E9', false),
  ('agendado', 'Agendado', '#F59E0B', false),
  ('interesado', 'Interesado', '#10B981', false),
  ('no-interesado', 'No interesado', '#EF4444', false),
  ('contratado', 'Contratado 🎉', '#059669', false);

-- =============================================
-- TRAZABILIDAD TABLE
-- =============================================
CREATE TABLE public.trazabilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status_id TEXT REFERENCES public.traz_statuses(id) DEFAULT 'sin-diag',
  comentarios JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trazabilidad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage trazabilidad"
  ON public.trazabilidad FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own trazabilidad"
  ON public.trazabilidad FOR SELECT
  USING (auth.uid() = client_id);

-- =============================================
-- TRIGGER: auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trazabilidad_updated_at
  BEFORE UPDATE ON public.trazabilidad
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TRIGGER: auto-create profile trazabilidad on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create trazabilidad entry
  INSERT INTO public.trazabilidad (client_id, status_id)
  VALUES (NEW.id, 'sin-diag');
  
  -- Assign client role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
