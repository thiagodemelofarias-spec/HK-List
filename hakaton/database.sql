-- Script de criação da tabela e políticas de segurança para o SAGA
-- Execute no SQL Editor do Supabase.

CREATE TABLE IF NOT EXISTS public.atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  disciplina TEXT NOT NULL,
  descricao TEXT NOT NULL,
  prazo DATE NOT NULL,
  status BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir SELECT anon"
ON public.atividades
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Permitir INSERT anon"
ON public.atividades
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Permitir UPDATE anon"
ON public.atividades
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir DELETE anon"
ON public.atividades
FOR DELETE
TO anon
USING (true);
