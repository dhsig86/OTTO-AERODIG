/**
 * Testes anti-regressão para o componente PathwayDiagram.
 *
 * Cobre:
 *  - Renderização do elemento SVG
 *  - Número correto de nós no SVG (grupos <g>)
 *  - Labels dos nós visíveis no DOM
 *  - Nó de entrada tem estilo diferenciado (entry node)
 *  - Edges/setas são renderizadas (caminhos <path>)
 *  - Props vazias não quebram o componente
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PathwayDiagram } from '../components/PathwayDiagram';
import type { PathwayNode, PathwayEdge } from '../types/content';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const nodes: PathwayNode[] = [
  { id: 'n1', label: 'Estridor neonatal',   node_type: 'entry' },
  { id: 'n2', label: 'Nasoendoscopia',       node_type: 'exam' },
  { id: 'n3', label: 'Laringomalacia',       node_type: 'decision' },
  { id: 'n4', label: 'Supraglotoplastia',    node_type: 'intervention' },
  { id: 'n5', label: 'Retorno 6 semanas',    node_type: 'followup' },
];

const edges: PathwayEdge[] = [
  { from_node: 'n1', to_node: 'n2', condition_label: '' },
  { from_node: 'n2', to_node: 'n3', condition_label: 'Laringomalacia detectada' },
  { from_node: 'n3', to_node: 'n4', condition_label: 'Grave' },
  { from_node: 'n3', to_node: 'n5', condition_label: 'Moderada' },
];

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('PathwayDiagram — renderização básica', () => {
  it('renderiza sem crash', () => {
    expect(() => render(<PathwayDiagram nodes={nodes} edges={edges} />)).not.toThrow();
  });

  it('renderiza um elemento <svg>', () => {
    const { container } = render(<PathwayDiagram nodes={nodes} edges={edges} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('SVG tem dimensões maiores que zero', () => {
    const { container } = render(<PathwayDiagram nodes={nodes} edges={edges} />);
    const svg = container.querySelector('svg');
    const width = parseFloat(svg?.getAttribute('width') ?? '0');
    const height = parseFloat(svg?.getAttribute('height') ?? '0');
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  it('labels dos nós são visíveis no DOM', () => {
    render(<PathwayDiagram nodes={nodes} edges={edges} />);
    expect(screen.getByText('Estridor neonatal')).toBeInTheDocument();
    expect(screen.getByText('Nasoendoscopia')).toBeInTheDocument();
    expect(screen.getByText('Laringomalacia')).toBeInTheDocument();
    expect(screen.getByText('Supraglotoplastia')).toBeInTheDocument();
    expect(screen.getByText('Retorno 6 semanas')).toBeInTheDocument();
  });

  it('condition_label de edges aparecem no SVG', () => {
    render(<PathwayDiagram nodes={nodes} edges={edges} />);
    expect(screen.getByText(/Laringomalacia detectada/i)).toBeInTheDocument();
    expect(screen.getByText(/Grave/i)).toBeInTheDocument();
    expect(screen.getByText(/Moderada/i)).toBeInTheDocument();
  });

  it('renderiza paths para edges', () => {
    const { container } = render(<PathwayDiagram nodes={nodes} edges={edges} />);
    // Cada edge gera ao menos um <path> no SVG
    const paths = container.querySelectorAll('svg path');
    expect(paths.length).toBeGreaterThanOrEqual(edges.length);
  });

  it('renderiza legenda com os tipos de nó', () => {
    render(<PathwayDiagram nodes={nodes} edges={edges} />);
    // A legenda exibe ao menos alguns dos tipos usados nos nodes
    // getAllByText porque cada tipo de nó é um item separado na legenda
    const legendItems = screen.getAllByText(/Entrada|Decisão|Exame|Intervenção|Follow-up/i);
    expect(legendItems.length).toBeGreaterThan(0);
  });
});

describe('PathwayDiagram — edge cases', () => {
  it('nenhum nó: renderiza SVG vazio sem crash', () => {
    expect(() => render(<PathwayDiagram nodes={[]} edges={[]} />)).not.toThrow();
    const { container } = render(<PathwayDiagram nodes={[]} edges={[]} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('nó único sem edges: renderiza o label', () => {
    render(
      <PathwayDiagram
        nodes={[{ id: 'solo', label: 'Nó único', node_type: 'entry' }]}
        edges={[]}
      />,
    );
    expect(screen.getByText('Nó único')).toBeInTheDocument();
  });

  it('label longo (>40 chars) não quebra o SVG', () => {
    const longLabel =
      'Avaliação multidisciplinar de deglutição com videofluoroscopia';
    expect(() =>
      render(
        <PathwayDiagram
          nodes={[{ id: 'a', 