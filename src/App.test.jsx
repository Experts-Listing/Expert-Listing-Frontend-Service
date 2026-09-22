import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App.jsx';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('App', () => {
  it('renders experts returned by the API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: 1, data: [{ id: 1, name: 'Ada Okafor', specialty: 'plumbing', city: 'Lagos' }] }),
    }));

    render(<App />);

    expect(await screen.findByText('Ada Okafor')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/experts');
  });

  it('shows an error when the API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    render(<App />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
