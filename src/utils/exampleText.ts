export interface ExampleText {
  spanish: string;
  english?: string;
}

export function splitExampleText(example?: string): ExampleText | undefined {
  if (!example) return undefined;

  const [spanish, ...englishParts] = example.split('|');
  const english = englishParts.join('|').trim();

  return {
    spanish: spanish.trim(),
    english: english || undefined,
  };
}
