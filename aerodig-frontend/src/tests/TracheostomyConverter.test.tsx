import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TracheostomyConverter } from '../components/TracheostomyConverter';
import type { Calculator } from '../types/content';

const fixture: Calculator = {
  id: 'tracheostomy-tube-converter',
  slug: 'tracheostomy-tube-converter',
  title_pt: 'Conversor de cânulas',
  title_en: 'Tube converter',
  audience: 'both',
  domain: 'tracheostomy',
  summary: 'Converte cânulas',
  confidence: 'moderate',
  confidence_rationale: 'tabelas de fabricante',
  inputs: [],
  outputs: [],
  reference_table: [
    { brand: 'Shiley', size: '4.0 PED', id_mm: '4.0', od_mm: '5.9', french: '18', age_band: 'Toddler' },
    { brand: 'Bivona', size: '4.0 PED', id_mm: '4.0', od_mm: '6.0', french: '18', age_band: 'Toddler' },
    { brand: 'Jackson (metálica)', size: '#1', id_mm: '4.0', od_mm: '5.5', french: '16.5', age_band: 'Toddler' },
  ],
  sources: [],
  notes_ptbr: 'Sempre conferir rótulo.',
};

describe('TracheostomyConverter', () => {
  it('renderiza select de marcas', () => {
    render(<TracheostomyConverter calc={fixture} />);
    const select = screen.getAllByRole('combobox')[0];
    expect(select).toBeInTheDocument();
  });

  it('mostra DI/DE/Fr ao selecionar tamanho', () => {
    render(<TracheostomyConverter calc={fixture} />);
    const sizeSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(sizeSelect, { target: { value: '4.0 PED' } });
    expect(screen.getByText(/DI/)).toBeInTheDocument();
    expect(screen.getByText('4.0 mm')).toBeInTheDocument();
    expect(screen.getByText('5.9 mm')).toBeInTheDocument();
  });

  it('mostra equivalentes em outras marcas', () => {
    render(<TracheostomyConverter calc={fixture} />);
    const sizeSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(sizeSelect, { target: { value: '4.0 PED' } });
    expect(screen.getByText(/Equivalentes em outras marcas/)).toBeInTheDocument();
    // Bivona deve aparecer (mesmo DI 4.0)
    expect(screen.getByText(/Bivona/)).toBeInTheDocument();
  });

  it('exibe alerta de notas em PT-BR', () => {
    render(<TracheostomyConverter calc={fixture} />);
    expect(screen.getByText(/Sempre conferir rótulo/)).toBeInTheDocument();
  });
});
