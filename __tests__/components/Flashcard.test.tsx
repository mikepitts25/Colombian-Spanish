import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Flashcard from '../../src/components/Flashcard';
import { FlashCard } from '../../src/types';

// Mock TTS so the component's long-press doesn't fail
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

// ── Test helpers ──────────────────────────────────────────────────────────────

const NOW = Date.now();

function makeCard(overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id: 'c001',
    front: 'chimba',
    back: 'awesome / cool',
    example: '¡Eso está chimba! | That is awesome!',
    tags: ['slang'],
    createdAt: NOW,
    due: NOW,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Flashcard', () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders without crashing with a minimal card', () => {
    const card = makeCard({ example: undefined, tags: undefined, ipa: undefined });
    const onGrade = jest.fn();
    expect(() => render(<Flashcard card={card} onGrade={onGrade} />)).not.toThrow();
  });

  it('renders the card front (Spanish word)', () => {
    const { getByText } = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);
    expect(getByText('chimba')).toBeTruthy();
  });

  it('renders "Tap to flip" hint on the front', () => {
    const { getByText } = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);
    expect(getByText('Tap to flip')).toBeTruthy();
  });

  it('renders without crashing when card has no example', () => {
    const card = makeCard({ example: undefined });
    expect(() => render(<Flashcard card={card} onGrade={jest.fn()} />)).not.toThrow();
  });

  it('renders without crashing when card has no tags', () => {
    const card = makeCard({ tags: undefined });
    expect(() => render(<Flashcard card={card} onGrade={jest.fn()} />)).not.toThrow();
  });

  it('renders without crashing when card is marked as favorite', () => {
    const card = makeCard({ favorite: true });
    expect(() => render(<Flashcard card={card} onGrade={jest.fn()} />)).not.toThrow();
  });

  // ── Accessibility fallback buttons ────────────────────────────────────────

  it('renders the "Hard" accessibility button', () => {
    const { getByAccessibilityHint, getByLabelText } = render(
      <Flashcard card={makeCard()} onGrade={jest.fn()} />,
    );
    // Button has accessibilityLabel="Mark as hard"
    expect(getByLabelText('Mark as hard')).toBeTruthy();
  });

  it('renders the "Flip card" accessibility button', () => {
    const { getByLabelText } = render(
      <Flashcard card={makeCard()} onGrade={jest.fn()} />,
    );
    expect(getByLabelText('Flip card')).toBeTruthy();
  });

  it('renders the "Good" accessibility button', () => {
    const { getByLabelText } = render(
      <Flashcard card={makeCard()} onGrade={jest.fn()} />,
    );
    expect(getByLabelText('Mark as good')).toBeTruthy();
  });

  // ── Grading via accessibility buttons ─────────────────────────────────────

  it('calls onGrade(2) when the "Hard" button is pressed', () => {
    const onGrade = jest.fn();
    const { getByLabelText } = render(<Flashcard card={makeCard()} onGrade={onGrade} />);
    fireEvent.press(getByLabelText('Mark as hard'));
    expect(onGrade).toHaveBeenCalledWith(2);
  });

  it('calls onGrade(4) when the "Good" button is pressed', () => {
    const onGrade = jest.fn();
    const { getByLabelText } = render(<Flashcard card={makeCard()} onGrade={onGrade} />);
    fireEvent.press(getByLabelText('Mark as good'));
    expect(onGrade).toHaveBeenCalledWith(4);
  });

  // ── Card back visibility ───────────────────────────────────────────────────

  it('renders the back text in the DOM (hidden via animation, not conditional)', () => {
    // The back face is always rendered; visibility is controlled by CSS rotation.
    const { getByText } = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);
    expect(getByText('awesome / cool')).toBeTruthy();
  });

  it('renders the English label on the back face', () => {
    const { getByText } = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);
    expect(getByText('English')).toBeTruthy();
  });

  // ── Card reset on prop change ──────────────────────────────────────────────

  it('resets to front when card prop changes (different id)', () => {
    const onGrade = jest.fn();
    const card1 = makeCard({ id: 'c1', front: 'hola' });
    const card2 = makeCard({ id: 'c2', front: 'gracias' });
    const { getByText, rerender } = render(<Flashcard card={card1} onGrade={onGrade} />);
    expect(getByText('hola')).toBeTruthy();
    rerender(<Flashcard card={card2} onGrade={onGrade} />);
    expect(getByText('gracias')).toBeTruthy();
  });
});
