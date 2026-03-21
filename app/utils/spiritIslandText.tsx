import reactStringReplace from 'react-string-replace';

interface TokenDefinition {
  char: string;
  label: string;
}

const symbolMap: Record<string, TokenDefinition> = {
  '[[Beast]]':      { char: 'A', label: 'Beast' },
  '[[Blight]]':     { char: 'B', label: 'Blight' },
  '[[City]]':       { char: 'C', label: 'City' },
  '[[Disease]]':    { char: 'D', label: 'Disease' },
  '[[Explorer]]':   { char: 'E', label: 'Explorer' },
  '[[Fear]]':       { char: 'F', label: 'Fear' },
  '[[Badlands]]':   { char: 'L', label: 'Badlands' },
  '[[Dahan]]':      { char: 'N', label: 'Dahan' },
  '[[Strife]]':     { char: 'S', label: 'Strife' },
  '[[Town]]':       { char: 'T', label: 'Town' },
  '[[Wilds]]':      { char: 'W', label: 'Wilds' },
  '[[Presence]]':   { char: '1', label: 'Presence' },
  '[[Sacred Site]]':{ char: '2', label: 'Sacred Site' },
  '[[Player]]':     { char: '.', label: 'Player' },
  '[[Players]]':    { char: ':', label: 'Players' },
  '[[Fast]]':       { char: '+', label: 'Fast' },
  '[[Slow]]':       { char: '-', label: 'Slow' },
};

export function toSpiritIslandText(text: string | null | undefined) {
  if (!text) return null;

  const spiritified = Object.keys(symbolMap).reduce(
    (acc, token) =>
      reactStringReplace(acc, token, (_, i) => (
        <span
          key={`${token}-${i}`}
          className="spirit-island-text"
          role="img"
          aria-label={symbolMap[token].label}
        >
          {symbolMap[token].char}
        </span>
      )),
    reactStringReplace(text) // initialize as ReactNodeArray
  );

  const bolded = reactStringReplace(spiritified, /\*(.*?)\*/g, (match, i) => (
    <strong key={`bold-${i}`}>{match}</strong>
  ));

  const italicized = reactStringReplace(bolded, /_(.*?)_/g, (match, i) => (
    <em key={`italic-${i}`}>{match}</em>
  ));

  return italicized;
}
