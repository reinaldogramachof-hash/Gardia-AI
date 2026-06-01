CREATE TABLE contracts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN (
                'condominio_vertical','condominio_horizontal',
                'associacao_moradores','loteamento_fechado')),
  cnpj        TEXT UNIQUE,
  address     TEXT,
  units_count INTEGER,
  settings    JSONB DEFAULT '{}',
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE contract_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  role        TEXT NOT NULL CHECK (role IN (
                'sindico','subsindico','zelador',
                'porteiro','morador','conselheiro')),
  unit        TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE incidents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id  UUID REFERENCES contracts(id) ON DELETE CASCADE,
  reported_by  UUID REFERENCES contract_users(id),
  category     TEXT NOT NULL CHECK (category IN (
                  'seguranca','manutencao','barulho',
                  'infracao','limpeza','acesso','outro')),
  priority     TEXT DEFAULT 'normal' CHECK (priority IN (
                  'urgente','alta','normal','baixa')),
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT DEFAULT 'aberta' CHECK (status IN (
                  'aberta','em_andamento','resolvida','cancelada')),
  metadata     JSONB DEFAULT '{}',
  resolved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES contract_users(id),
  channel     TEXT DEFAULT 'web',
  messages    JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  trigger_at  TIMESTAMPTZ NOT NULL,
  sent        BOOLEAN DEFAULT false,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contracts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts         ENABLE ROW LEVEL SECURITY;