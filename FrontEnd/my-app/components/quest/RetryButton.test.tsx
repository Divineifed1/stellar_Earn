import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { RetryButton } from './RetryButton';

describe('RetryButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isVisible is false', () => {
    const onRetry = vi.fn();
    const { container } = render(
      <RetryButton isVisible={false} onRetry={onRetry} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders button when isVisible is true', () => {
    const onRetry = vi.fn();
    render(<RetryButton isVisible={true} onRetry={onRetry} />);

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls onRetry when button is clicked', async () => {
    const onRetry = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<RetryButton isVisible={true} onRetry={onRetry} />);

    const button = screen.getByRole('button', { name: /retry/i });
    await user.click(button);

    expect(onRetry).toHaveBeenCalled();
  });

  it('shows loading state while retrying', async () => {
    const onRetry = vi.fn<() => Promise<void>>(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 100);
        })
    );
    const user = userEvent.setup();

    render(<RetryButton isVisible={true} onRetry={onRetry} />);

    const button = screen.getByRole('button', { name: /retry/i });
    await user.click(button);

    // Should show "Retrying..." text
    expect(screen.getByText('Retrying...')).toBeInTheDocument();
  });

  it('disables button while retrying', async () => {
    const onRetry = vi.fn<() => Promise<void>>(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 100);
        })
    );
    const user = userEvent.setup();

    render(<RetryButton isVisible={true} onRetry={onRetry} />);

    const button = screen.getByRole('button', { name: /retry/i });
    await user.click(button);

    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it('displays custom button text', () => {
    const onRetry = vi.fn();
    render(
      <RetryButton isVisible={true} onRetry={onRetry} buttonText="Try Again" />
    );

    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument();
  });

  it('shows error message when retry fails', async () => {
    const errorMessage = 'Network error occurred';
    const onRetry = vi.fn().mockRejectedValue(new Error(errorMessage));
    const user = userEvent.setup();

    render(<RetryButton isVisible={true} onRetry={onRetry} />);

    const button = screen.getByRole('button', { name: /retry/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('has isLoading prop to control loading state', () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <RetryButton isVisible={true} isLoading={false} onRetry={onRetry} />
    );

    expect(
      (screen.getByRole('button', { name: /retry/i }) as HTMLButtonElement)
        .disabled
    ).toBe(false);

    rerender(
      <RetryButton isVisible={true} isLoading={true} onRetry={onRetry} />
    );

    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(
      true
    );
    expect(screen.getByText('Retrying...')).toBeInTheDocument();
  });

  it('supports full width styling', () => {
    const onRetry = vi.fn();
    render(<RetryButton isVisible={true} onRetry={onRetry} fullWidth={true} />);

    const button = screen.getByRole('button');
    expect(button.classList.contains('w-full')).toBe(true);
  });

  it('applies custom className', () => {
    const onRetry = vi.fn();
    render(
      <RetryButton
        isVisible={true}
        onRetry={onRetry}
        className="custom-class"
      />
    );

    const button = screen.getByRole('button');
    expect(button.classList.contains('custom-class')).toBe(true);
  });

  it('has proper accessibility attributes', () => {
    const onRetry = vi.fn();
    render(<RetryButton isVisible={true} onRetry={onRetry} />);

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('Retry');
  });

  it('updates aria-busy when loading state changes', () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <RetryButton isVisible={true} isLoading={false} onRetry={onRetry} />
    );

    let button = screen.getByRole('button');
    expect(button.getAttribute('aria-busy')).toBe('false');

    rerender(
      <RetryButton isVisible={true} isLoading={true} onRetry={onRetry} />
    );

    button = screen.getByRole('button');
    expect(button.getAttribute('aria-busy')).toBe('true');
  });
});
