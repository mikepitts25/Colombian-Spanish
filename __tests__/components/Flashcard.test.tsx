import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Flashcard from '../../src/components/Flashcard';
import { FlashCard } from '../../src/types';

jest.mock('../../src/services/tts', () => ({
  speakCard: jest.fn(),
  speak: jest.fn(),
  stop: jest.fn(),
}));

import { speakCard } from '../../src/services/tts';

const mockSpeakCard = speakCard as jest.Mock;

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

beforeEach(() => {
  jest.clearAllMocks();
});

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

  it('renders the "Flip card" accessibility button', () => {
    const { getByLabelText } = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);
    expect(getByLabelText('Flip card')).toBeTruthy();
  });

  // ── Card back visibility ───────────────────────────────────────────────────

  it('renders the back text in the DOM (hidden via animation, not conditional)', () => {
    // The back face is always rendered; visibility is controlled by CSS rotation.
    const { getByText } = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);
    expect(getByText('awesome / cool')).toBeTruthy();
  });

  it('renders Spanish example text on the front and English example text on the back', () => {
    const { getByTestId } = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);

    expect(getByTestId('flashcard-front-example').props.children).toEqual([
      '"',
      '¡Eso está chimba!',
      '"',
    ]);
    expect(getByTestId('flashcard-back-example').props.children).toBe('That is awesome!');
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

  it('calls speakCard with the current card when the speaker button is pressed', () => {
    const card = makeCard({ id: '0009', front: 'hola' });
    const { getByText } = render(<Flashcard card={card} onGrade={jest.fn()} />);

    fireEvent.press(getByText('🔊'));

    expect(mockSpeakCard).toHaveBeenCalledWith(card);
  });
});
