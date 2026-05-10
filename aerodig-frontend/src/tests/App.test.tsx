import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock do firebase-auth para evitar inicialização real em jsdom
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => null),
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => null) }));

// Mock axios calls (serão chamadas em useEffect)
vi.mock('axios', () => ({
  default: {
    create: () => ({
      get: vi.fn().mockResolvedValue({ data: [] }),
    }),
  },
}));

import App from '../App';

describe('App', () => {
  it('renderiza o layout (Sidebar + main) sem crash', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    // Heading da home deve aparecer
    expect(screen.getByRole('heading', { name: /Aerodigestive Hub/i })).toBeInTheDocument();
  });
});
