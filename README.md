# SAGA - Sistema Acadêmico de Gestão de Atividades
## Documentação do Projeto - Aplicação Web com Supabase

Um sistema acadêmico moderno, elegante e responsivo para gestão e acompanhamento de atividades estudantis, desenvolvido com HTML5, CSS3, JavaScript vanilla e integrado ao Supabase.

---

## Características

- **Design Moderno e Profissional**: Interface limpa com suporte a glassmorphism e temas dinâmicos
- **Totalmente Responsivo**: Funciona perfeitamente em celulares, tablets e desktops com menu lateral adaptativo
- **Gestão Completa de Tarefas**: Cadastro, edição, exclusão e alteração de status (Pendente/Concluída)
- **Painel de Controle (Dashboard)**: Estatísticas em tempo real com contadores de total, pendências e conclusões
- **Histórico com Filtros**: Ferramentas de busca por texto (título ou disciplina) e filtro por data
- **Notificações Elegantes**: Alertas visuais e modais de confirmação integrados via ButterPop
- **Banco de Dados em Nuvem**: Persistência completa utilizando Supabase (PostgreSQL)

---

## Identidade Visual

### Paleta de Cores
- **Azul Primário**: `#4F46E5` (destaque e botões)
- **Azul Profundo**: `#312E81` (textos e elementos escuros)
- **Sucesso (Concluído)**: `#16A34A` (verde)
- **Aviso (Pendente)**: `#F59E0B` (amarelo/laranja)
- **Perigo (Exclusão)**: `#EF4444` (vermelho)
- **Fundo**: `#EEF3FF` a `#F8FAFC` (gradiente suave)

### Tipografia
- **Família Principal**: Inter (400, 500, 600, 700, 800)

---

## Configuração do Banco de Dados (Supabase)

Execute o script SQL abaixo no **SQL Editor** do seu projeto no Supabase para criar a tabela e configurar as políticas de acesso:

```sql
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

