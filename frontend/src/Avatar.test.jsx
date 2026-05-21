import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from './Avatar.jsx';

describe('Avatar', () => {
  it('shows initials from the first two words of the name', () => {
    render(<Avatar name="Ernest Dogo" />);
    expect(screen.getByText('ED')).toBeInTheDocument();
  });

  it('falls back to the first letter of the email when no name is given', () => {
    render(<Avatar email="ernest@example.com" />);
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('shows ? when neither name nor email is given', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});
