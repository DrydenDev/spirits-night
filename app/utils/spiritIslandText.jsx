import reactStringReplace from "react-string-replace";

const symbolMap = {
  "[[Beast]]": 'A',
  "[[Blight]]": 'B',
  "[[City]]": 'C',
  "[[Disease]]": 'D',
  "[[Explorer]]": 'E',
  "[[Fear]]": 'F',
  "[[Badlands]]":  'L',
  "[[Dahan]]": 'N',
  "[[Strife]]": 'S',
  "[[Town]]": 'T',
  "[[Wilds]]": 'W',
  "[[Presence]]": '1',
  "[[Holy Site]]": '2',
  "[[Player]]": '.',
  "[[Players]]": ':',
  "[[Fast]]": '+',
  "[[Slow]]": '-'
}

export function toSpiritIslandText(text) {
  const spiritifiedText = Object.keys(symbolMap).reduce((spiritString, placeholderText) => {
      return reactStringReplace(spiritString, placeholderText, (match, index) => {
        return (
          <span className="spirit-island-text">{symbolMap[placeholderText]}</span>
        );
      })
    }, text);

    const boldedText = reactStringReplace(spiritifiedText, /\*(.*)\*/, (match, index) => <strong>{match}</strong>);
    const italicizedText = reactStringReplace(boldedText, /_(.*)_/, (match, index) => <em>{match}</em>);
    
    return italicizedText;
}