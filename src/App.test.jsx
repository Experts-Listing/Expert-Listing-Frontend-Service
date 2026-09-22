import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

  it('filters experts by the searched location', async () => {
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        count: 2,
        data: [
          { id: 1, name: 'Ada Okafor', specialty: 'plumbing', city: 'Lagos' },
          { id: 2, name: 'Grace Mensah', specialty: 'carpentry', city: 'Accra' },
        ],
      }),
    }));

    render(<App />);
    await screen.findByText('Grace Mensah');

    fireEvent.change(screen.getByPlaceholderText('City, area or specialty'), { target: { value: 'accra' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(screen.getByText('Grace Mensah')).toBeInTheDocument();
    expect(screen.queryByText('Ada Okafor')).not.toBeInTheDocument();
  });

  it('shows an error when the API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    render(<App />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
