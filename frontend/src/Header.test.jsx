import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header.jsx';

describe('Header', () => {
  beforeEach(() => {
    // fake fetch so the useEffect doesn't hit a real backend
    global.fetch = vi.fn();
  });

  it('shows Log in when the profile fetch returns 401', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 401 });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Log in')).toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  it('shows Log out and the Profile link when the profile fetch succeeds', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'Ernest Dogo', email: 'e@d.com' }),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Log out')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
