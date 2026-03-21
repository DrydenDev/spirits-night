import reactStringReplace from 'react-string-replace';

const symbolMap: Record<string, string> = {
  '[[Beast]]': 'A',
  '[[Blight]]': 'B',
  '[[City]]': 'C',
  '[[Disease]]': 'D',
  '[[Explorer]]': 'E',
  '[[Fear]]': 'F',
  '[[Badlands]]': 'L',
  '[[Dahan]]': 'N',
  '[[Strife]]': 'S',
  '[[Town]]': 'T',
  '[[Wilds]]': 'W',
  '[[Presence]]': '1',
  '[[Sacred Site]]': '2',
  '[[Player]]': '.',
  '[[Players]]': ':',
  '[[Fast]]': '+',
  '[[Slow]]': '-',
};

export function toSpiritIslandText(text: string | null | undefined) {
  if (!text) return null;

  const spiritified = Object.keys(symbolMap).reduce(
    (acc, token) =>
      reactStringReplace(acc, token, (_, i) => (
        <span key={`${token}-${i}`} className="spirit-island-text">
          {symbolMap[token]}
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
