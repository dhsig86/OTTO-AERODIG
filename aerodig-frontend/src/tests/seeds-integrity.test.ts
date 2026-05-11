/**
 * Testes de integridade dos seeds estáticos (public/data/).
 *
 * Esses testes são a barreira anti-regressão para conteúdo editorial.
 * Qualquer PR que quebrar um seed válido falha aqui antes de chegar ao Vercel.
 *
 * Cobre:
 *  - Campos obrigatórios em todas as entidades (BaseEntity)
 *  - Ausência de slugs duplicados dentro de cada coleção
 *  - Cross-references: associated_pathways, _procedures, _instruments apontam para slugs reais
 *  - Calculadoras: myer-cotton tem o reference_table correto; PEDI-EAT-10 tem 10 inputs
 *  - Eventos: datas ISO-8601 válidas; ends_on >= starts_on
 *  - News: relevance_score entre 0 e 1; status é enum válido
 *  - PathwayNodes: todo grafo tem exatamente 1 nó entry e todos os ids referenciados em edges existem
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DATA_DIR = resolve(__dirname, '../../public/data');

function load<T>(file: string): T {
  const raw = readFileSync(resolve(DATA_DIR, file), 'utf-8');
  return JSON.parse(raw) as T;
}

function isoDateRegex(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

type BaseEntity = {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string;
  audience: string;
  confidence: string;
  confidence_rationale: string;
  sources: unknown[];
};

let conditions: (BaseEntity & {
  domain: string;
  age_range: string[];
  summary: string;
  classifications: unknown[];
  red_flags: string[];
  key_exams: string[];
  common_pitfalls: string[];
  associated_pathways: string[];
  associated_procedures: string[];
  associated_instruments: string[];
})[];

let pathways: (BaseEntity & {
  entry_symptom: string;
  summary: string;
  nodes: { id: string; label: string; node_type: string; notes?: string }[];
  edges: { from_node: string; to_node: string; condition_label?: string }[];
  output_artifacts: string[];
})[];

let instruments: (BaseEntity & {
  instrument_type: string;
  domain: string;
  interpretation: string;
  pediatric_validated: boolean;
  ptbr_validated: boolean;
  digital_calculator_available: boolean;
})[];

let calculators: (BaseEntity & {
  domain: string;
  summary: string;
  inputs: { key: string; label: string; input_type: string; options?: string[] }[];
  outputs: { key: string; label: string }[];
  reference_table?: Record<string, unknown>[];
})[];

let procedures: (BaseEntity & {
  surgical: boolean;
  approach: string;
  indications: string[];
  technique_notes: string;
  outcome_set: Record<string, string | null>;
})[];

let frontier: (BaseEntity & {
  technology: string;
  maturity: string;
  summary: string;
  available_in_brazil: boolean;
})[];

let network: (BaseEntity & {
  node_type: string;
  country: string;
  city: string;
  institution: string;
})[];

let news: (BaseEntity & {
  journal: string;
  relevance_score: number;
  domain_tags: string[];
  status: string;
})[];

let events: (BaseEntity & {
  event_type: string;
  organizer: string;
  location: string;
  starts_on: string;
  ends_on?: string;
  url: string;
  registration_open: boolean;
  target_audience: string[];
})[];

beforeAll(() => {
  conditions = load('conditions.json');
  pathways = load('pathways.json');
  instruments = load('instruments.json');
  calculators = load('calculators.json');
  procedures = load('procedures.json');
  frontier = load('frontier.json');
  network = load('network-nodes.json');
  news = load('news.json');
  events = load('events.json');
});

// ─── Campos obrigatórios (BaseEntity) ────────────────────────────────────────

const REQUIRED_BASE: (keyof BaseEntity)[] = [
  'id',
  'slug',
  'title_pt',
  'title_en',
  'audience',
  'confidence',
  'confidence_rationale',
  'sources',
];

const CONFIDENCE_VALUES = new Set(['high', 'moderate', 'low']);
const AUDIENCE_VALUES = new Set(['pediatric', 'adult', 'both']);

// NOTE: helpers recebem um getter (() => BaseEntity[]) em vez da coleção diretamente,
// pois são chamados em describe-time (antes do beforeAll preencher as variáveis).
// O getter é invocado dentro de cada it(), quando os dados já estão disponíveis.

function checkBaseEntity(getCollection: () => BaseEntity[], name: string) {
  describe(`${name} — campos BaseEntity`, () => {
    it('tem pelo menos 1 item', () => {
      const collection = getCollection();
      expect(collection.length, `${name} está vazio`).toBeGreaterThan(0);
    });

    it('todos os itens têm campos obrigatórios não-nulos', () => {
      const collection = getCollection();
      for (const item of collection) {
        for (const field of REQUIRED_BASE) {
          expect(
            item[field],
            `${name}[${item.slug ?? 'unknown'}].${field} ausente ou nulo`,
          ).toBeTruthy();
        }
      }
    });

    it('confidence é "high" | "moderate" | "low"', () => {
      const collection = getCollection();
      for (const item of collection) {
        expect(
          CONFIDENCE_VALUES.has(item.confidence),
          `${name}[${item.slug}].confidence inválido: "${item.confidence}"`,
        ).toBe(true);
      }
    });

    it('audience é "pediatric" | "adult" | "both"', () => {
      const collection = getCollection();
      for (const item of collection) {
        expect(
          AUDIENCE_VALUES.has(item.audience),
          `${name}[${item.slug}].audience inválido: "${item.audience}"`,
        ).toBe(true);
      }
    });

    it('sources é um array (pode estar vazio apenas em exceções)', () => {
      const collection = getCollection();
      for (const item of collection) {
        expect(Array.isArray(item.sources), `${name}[${item.slug}].sources não é array`).toBe(
          true,
        );
      }
    });
  });
}

function checkNoDuplicateSlugs(getCollection: () => BaseEntity[], name: string) {
  it(`${name} — sem slugs duplicados`, () => {
    const collection = getCollection();
    const slugs = collection.map((i) => i.slug);
    const unique = new Set(slugs);
    expect(
      unique.size,
      `${name} contém slugs duplicados: ${slugs.filter((s, i) => slugs.indexOf(s) !== i).join(', ')}`,
    ).toBe(slugs.length);
  });
}

// ─── Verifica todas as coleções ───────────────────────────────────────────────

describe('conditions', () => {
  checkBaseEntity(
    () => conditions as unknown as BaseEntity[],
    'conditions',
  );
  checkNoDuplicateSlugs(() => conditions as unknown as BaseEntity[], 'conditions');

  it('todos têm summary não-vazio', () => {
    for (const c of conditions) {
      expect(c.summary.trim().length, `condition[${c.slug}].summary vazio`).toBeGreaterThan(0);
    }
  });

  it('classifications, red_flags, key_exams são arrays', () => {
    for (const c of conditions) {
      expect(Array.isArray(c.classifications), `${c.slug}.classifications`).toBe(true);
      expect(Array.isArray(c.red_flags), `${c.slug}.red_flags`).toBe(true);
      expect(Array.isArray(c.key_exams), `${c.slug}.key_exams`).toBe(true);
    }
  });
});

describe('pathways', () => {
  checkBaseEntity(() => pathways as unknown as BaseEntity[], 'pathways');
  checkNoDuplicateSlugs(() => pathways as unknown as BaseEntity[], 'pathways');

  it('cada pathway tem exatamente 1 nó do tipo "entry"', () => {
    for (const p of pathways) {
      const entries = p.nodes.filter((n) => n.node_type === 'entry');
      expect(
        entries.length,
        `pathway[${p.slug}] deve ter 1 entry node (tem ${entries.length})`,
      ).toBe(1);
    }
  });

  it('todos os node ids referenciados em edges existem nos nodes', () => {
    for (const p of pathways) {
      const nodeIds = new Set(p.nodes.map((n) => n.id));
      for (const e of p.edges) {
        expect(
          nodeIds.has(e.from_node),
          `pathway[${p.slug}] edge from_node "${e.from_node}" não existe`,
        ).toBe(true);
        expect(
          nodeIds.has(e.to_node),
          `pathway[${p.slug}] edge to_node "${e.to_node}" não existe`,
        ).toBe(true);
      }
    }
  });

  it('todo node_type é um dos valores válidos', () => {
    const VALID_TYPES = new Set(['entry', 'decision', 'exam', 'intervention', 'followup']);
    for (const p of pathways) {
      for (const n of p.nodes) {
        expect(
          VALID_TYPES.has(n.node_type),
          `pathway[${p.slug}] node "${n.id}" tem node_type inválido: "${n.node_type}"`,
        ).toBe(true);
      }
    }
  });

  it('entry_symptom não é vazio', () => {
    for (const p of pathways) {
      expect(p.entry_symptom.trim().length, `pathway[${p.slug}].entry_symptom vazio`).toBeGreaterThan(0);
    }
  });
});

describe('instruments', () => {
  checkBaseEntity(() => instruments as unknown as BaseEntity[], 'instruments');
  checkNoDuplicateSlugs(() => instruments as unknown as BaseEntity[], 'instruments');

  it('instrument_type é um dos valores válidos', () => {
    const VALID = new Set(['screening', 'functional', 'outcome', 'histologic', 'endoscopic']);
    for (const i of instruments) {
      expect(VALID.has(i.instrument_type), `instrument[${i.slug}].instrument_type inválido`).toBe(true);
    }
  });

  it('interpretation não é vazio', () => {
    for (const i of instruments) {
      expect(i.interpretation.trim().length, `instrument[${i.slug}].interpretation vazio`).toBeGreaterThan(0);
    }
  });
});

describe('calculators', () => {
  checkBaseEntity(() => calculators as unknown as BaseEntity[], 'calculators');
  checkNoDuplicateSlugs(() => calculators as unknown as BaseEntity[], 'calculators');

  it('todos têm pelo menos 1 input e 1 output', () => {
    for (const c of calculators) {
      expect(c.inputs.length, `calculator[${c.slug}] sem inputs`).toBeGreaterThan(0);
      expect(c.outputs.length, `calculator[${c.slug}] sem outputs`).toBeGreaterThan(0);
    }
  });

  it('PEDI-EAT-10 tem exatamente 10 inputs numéricos', () => {
    const pedi = calculators.find((c) => c.slug === 'pedi-eat-10-calc');
    expect(pedi, 'pedi-eat-10-calc não encontrado').toBeDefined();
    expect(pedi!.inputs).toHaveLength(10);
    for (const inp of pedi!.inputs) {
      expect(inp.input_type, `pedi-eat-10 input "${inp.key}" deve ser number`).toBe('number');
    }
  });

  it('myer-cotton-calc tem reference_table com os 7 age_bands esperados', () => {
    const mc = calculators.find((c) => c.slug === 'myer-cotton-calc');
    expect(mc, 'myer-cotton-calc não encontrado').toBeDefined();
    const rt = mc!.reference_table;
    expect(rt, 'myer-cotton reference_table ausente').toBeDefined();
    expect(rt!.length, 'myer-cotton deve ter 7 linhas na reference_table').toBe(7);
    const ageBands = rt!.map((r) => r['age_band'] as string);
    const unique = new Set(ageBands);
    expect(unique.size, 'myer-cotton reference_table contém age_bands duplicados').toBe(7);
  });

  it('myer-cotton-calc reference_table tem expected_id_mm crescente', () => {
    const mc = calculators.find((c) => c.slug === 'myer-cotton-calc');
    const rt = mc!.reference_table!;
    for (let i = 1; i < rt.length; i++) {
      const prev = rt[i - 1]['expected_id_mm'] as number;
      const curr = rt[i]['expected_id_mm'] as number;
      expect(curr, `reference_table[${i}] deve ser >= reference_table[${i - 1}]`).toBeGreaterThanOrEqual(prev);
    }
  });

  it('tracheostomy-tube-converter tem reference_table com brands conhecidas', () => {
    const tc = calculators.find((c) => c.slug === 'tracheostomy-tube-converter');
    expect(tc, 'tracheostomy-tube-converter não encontrado').toBeDefined();
    const brands = new Set(
      (tc!.reference_table ?? []).map((r) => r['brand'] as string).filter(Boolean),
    );
    for (const expected of ['Shiley', 'Bivona', 'Jackson (metálica)']) {
      expect(brands.has(expected), `brand "${expected}" ausente na tabela`).toBe(true);
    }
  });

  it('myer-cotton: age_bands do JSON correspondem às keys do MYER_COTTON_EXPECTED (regressão key mismatch)', () => {
    // Esta é a barreira anti-regressão para o bug "Pré-escolar" vs "Pre-escolar".
    // Se o JSON usar um acento que o componente não usa, os testes de lógica passam
    // mas o calculador quebra em runtime (nenhum expected_id_mm encontrado).
    const EXPECTED_KEYS = [
      'Neonato',
      'Lactente (<6m)',
      'Lactente (6-12m)',
      'Toddler (1-3a)',
      'Pre-escolar',   // ← sem acento — deve bater com MYER_COTTON_EXPECTED
      'Escolar',
      'Adolescente',
    ];
    const mc = calculators.find((c) => c.slug === 'myer-cotton-calc');
    expect(mc).toBeDefined();
    const ageBands = (mc!.reference_table ?? []).map((r) => r['age_band'] as string);
    for (const key of EXPECTED_KEYS) {
      expect(
        ageBands,
        `myer-cotton reference_table não contém age_band "${key}" — possível key mismatch`,
      ).toContain(key);
    }
    // Garante que a versão com acento NÃO está presente
    expect(ageBands, 'age_band "Pré-escolar" (com acento) não deve existir no JSON').not.toContain(
      'Pré-escolar',
    );
  });
});

describe('procedures', () => {
  checkBaseEntity(() => procedures as unknown as BaseEntity[], 'procedures');
  checkNoDuplicateSlugs(() => procedures as unknown as BaseEntity[], 'procedures');

  it('approach é um dos valores válidos', () => {
    const VALID = new Set(['endoscopic', 'open', 'adjuvant', 'combined']);
    for (const p of procedures) {
      expect(VALID.has(p.approach), `procedure[${p.slug}].approach inválido: "${p.approach}"`).toBe(true);
    }
  });

  it('outcome_set tem pelo menos as chaves padrão definidas', () => {
    const EXPECTED_KEYS = ['decannulation', 'reintervention', 'voice', 'swallow', 'complications', 'followup'];
    for (const p of procedures) {
      for (const key of EXPECTED_KEYS) {
        expect(
          key in p.outcome_set,
          `procedure[${p.slug}].outcome_set faltando chave "${key}"`,
        ).toBe(true);
      }
    }
  });
});

describe('frontier', () => {
  checkBaseEntity(() => frontier as unknown as BaseEntity[], 'frontier');
  checkNoDuplicateSlugs(() => frontier as unknown as BaseEntity[], 'frontier');

  it('maturity é um dos valores válidos', () => {
    const VALID = new Set([
      'exploratory',
      'translational',
      'clinical_trial',
      'approved_specialized',
      'approved_widespread',
    ]);
    for (const f of frontier) {
      expect(VALID.has(f.maturity), `frontier[${f.slug}].maturity inválido`).toBe(true);
    }
  });
});

describe('network nodes', () => {
  checkBaseEntity(() => network as unknown as BaseEntity[], 'network');
  checkNoDuplicateSlugs(() => network as unknown as BaseEntity[], 'network');

  it('country e city não são vazios', () => {
    for (const n of network) {
      expect(n.country.trim().length, `network[${n.slug}].country vazio`).toBeGreaterThan(0);
      expect(n.city.trim().length, `network[${n.slug}].city vazio`).toBeGreaterThan(0);
    }
  });
});

describe('news', () => {
  checkBaseEntity(() => news as unknown as BaseEntity[], 'news');
  checkNoDuplicateSlugs(() => news as unknown as BaseEntity[], 'news');

  it('relevance_score está entre 0 e 1', () => {
    for (const n of news) {
      expect(n.relevance_score, `news[${n.slug}].relevance_score < 0`).toBeGreaterThanOrEqual(0);
      expect(n.relevance_score, `news[${n.slug}].relevance_score > 1`).toBeLessThanOrEqual(1);
    }
  });

  it('status é um dos valores válidos', () => {
    const VALID = new Set(['pending', 'published', 'rejected', 'archived']);
    for (const n of news) {
      expect(VALID.has(n.status), `news[${n.slug}].status inválido: "${n.status}"`).toBe(true);
    }
  });
});

describe('events', () => {
  checkBaseEntity(() => events as unknown as BaseEntity[], 'events');
  checkNoDuplicateSlugs(() => events as unknown as BaseEntity[], 'events');

  it('starts_on é uma data ISO-8601 válida', () => {
    for (const e of events) {
      expect(
        isoDateRegex(e.starts_on),
        `event[${e.slug}].starts_on inválido: "${e.starts_on}"`,
      ).toBe(true);
    }
  });

  it('ends_on, quando presente, é data ISO-8601 e >= starts_on', () => {
    for (const e of events) {
      if (e.ends_on) {
        expect(
          isoDateRegex(e.ends_on),
          `event[${e.slug}].ends_on inválido: "${e.ends_on}"`,
        ).toBe(true);
        expect(
          e.ends_on >= e.starts_on,
          `event[${e.slug}].ends_on (${e.ends_on}) < starts_on (${e.starts_on})`,
        ).toBe(true);
      }
    }
  });

  it('url não é vazio', () => {
    for (const e of events) {
      expect(e.url.trim().length, `event[${e.slug}].url vazio`).toBeGreaterThan(0);
    }
  });
});

// ─── Cross-references ─────────────────────────────────────────────────────────

describe('cross-references (condition → pathway / procedure / instrument)', () => {
  it('associated_pathways referencia slugs existentes em pathways.json', () => {
    const validSlugs = new Set(pathways.map((p) => p.slug));
    for (const c of conditions) {
      for (const slug of c.associated_pathways) {
        expect(
          validSlugs.has(slug),
          `condition[${c.slug}].associated_pathways contém slug inválido: "${slug}"`,
        ).toBe(true);
      }
    }
  });

  it('associated_procedures referencia slugs existentes em procedures.json', () => {
    const validSlugs = new Set(procedures.map((p) => p.slug));
    for (const c of conditions) {
      for (const slug of c.associated_procedures) {
        expect(
          validSlugs.has(slug),
          `condition[${c.slug}].associated_procedures contém slug inválido: "${slug}"`,
        ).toBe(true);
      }
    }
  });

  it('associated_instruments referencia slugs existentes em instruments.json', () => {
    const validSlugs = new Set(instruments.map((i) => i.slug));
    for (const c of conditions) {
      for (const slug of c.associated_instruments) {
        expect(
          validSlugs.has(slug),
          `condition[${c.slug}].associated_instruments contém slug inválido: "${slug}"`,
        ).toBe(true);
      }
    }
  });
});

// ─── Arquivos de detalhe de condition