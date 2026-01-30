-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.cardapio (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  cod text UNIQUE,
  nome text NOT NULL,
  descricao text,
  valor numeric NOT NULL,
  categoria text NOT NULL,
  img_url text,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  destaque boolean DEFAULT false,
  tempo_preparo integer DEFAULT 0,
  ingredientes jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT cardapio_pkey PRIMARY KEY (id)
);
CREATE TABLE public.clientes (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  nome text NOT NULL,
  telefone text,
  cpf text UNIQUE,
  data_nascimento date,
  endereco_rua text,
  endereco_numero text,
  endereco_complemento text,
  endereco_bairro text,
  endereco_cidade text DEFAULT 'Governador Valadares'::text,
  endereco_estado text DEFAULT 'MG'::text,
  endereco_cep text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clientes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.favoritos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cliente_id uuid,
  item_id integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT favoritos_pkey PRIMARY KEY (id),
  CONSTRAINT favoritos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT favoritos_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.cardapio(id)
);
CREATE TABLE public.itens_pedido (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pedido_id uuid,
  item_id integer,
  item_cod text NOT NULL,
  item_nome text NOT NULL,
  item_valor numeric NOT NULL,
  item_tempo_preparo integer DEFAULT 0,
  quantidade integer NOT NULL DEFAULT 1,
  observacoes text,
  subtotal numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT itens_pedido_pkey PRIMARY KEY (id),
  CONSTRAINT itens_pedido_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id),
  CONSTRAINT itens_pedido_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.cardapio(id)
);
CREATE TABLE public.pedidos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cliente_id uuid,
  status text NOT NULL DEFAULT 'pendente'::text,
  tipo_pedido text NOT NULL DEFAULT 'delivery'::text,
  subtotal numeric NOT NULL,
  taxa_entrega numeric DEFAULT 0,
  desconto numeric DEFAULT 0,
  total numeric NOT NULL,
  bairro_entrega text,
  zona_entrega_id integer,
  endereco_entrega jsonb,
  tempo_preparo_total integer,
  tempo_entrega_estimado integer,
  forma_pagamento text,
  troco_para numeric,
  observacoes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pedidos_pkey PRIMARY KEY (id),
  CONSTRAINT pedidos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT pedidos_zona_entrega_id_fkey FOREIGN KEY (zona_entrega_id) REFERENCES public.zonas_entrega(id)
);
CREATE TABLE public.zonas_entrega (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  bairro text NOT NULL UNIQUE,
  cidade text NOT NULL DEFAULT 'Governador Valadares'::text,
  estado text NOT NULL DEFAULT 'MG'::text,
  taxa_entrega numeric NOT NULL,
  multiplicador_tempo numeric NOT NULL DEFAULT 1.00,
  ativo boolean DEFAULT true,
  observacoes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT zonas_entrega_pkey PRIMARY KEY (id)
);