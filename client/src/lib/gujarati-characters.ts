
export const gujaratiCharacters = {
  consonants: [
    'ક', 'ખ', 'ગ', 'ઘ', 'ઙ',
    'ચ', 'છ', 'જ', 'ઝ', 'ઞ', 
    'ટ', 'ઠ', 'ડ', 'ઢ', 'ણ',
    'ત', 'થ', 'દ', 'ધ', 'ન',
    'પ', 'ફ', 'બ', 'ભ', 'મ',
    'ય', 'ર', 'લ', 'ળ', 'વ',
    'શ', 'ષ', 'સ', 'હ', 'ક્ષ', 'જ્ઞ'
  ],
  vowels: [
    'અ', 'આ', 'ઇ', 'ઈ', 'ઉ', 'ઊ',
    'ઋ', 'ઌ', 'એ', 'ઐ', 'ઓ', 'ઔ'
  ],
  vowelSigns: [
    'ા', 'િ', 'ી', 'ુ', 'ૂ', 'ૃ', 'ૄ',
    'ે', 'ૈ', 'ો', 'ૌ', '્', 'ઁ', 'ં', 'ઃ',
    'ઽ', 'ૺ', 'ૻ', 'ૼ', '૽', '૾', '૿'
  ],
  numbers: [
    '૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'
  ],
  compounds: [
    'ક્ષ', 'જ્ઞ', 'શ્ર', 'ત્ર'
  ],
  symbols: [
    '઼', 'ઽ', '૰', '૱', '૲', '૳', '૴', '૵', '૶', '૷', '૸', 'ૹ', 'ૺ', 'ૻ', 'ૼ', '૽', '૾', '૿',
    '।', '॥', ',', '.', ';', ':', '?', '!', '"', "'", '(', ')', '[', ']', '{', '}', '-', '–', '—',
    'ઍ', 'ઑ', 'ૠ', 'ૡ', 'ૢ', 'ૣ', '૤', '૥', '૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'
  ],
  punctuation: [
    '।', '॥', ',', '.', ';', ':', '?', '!', '"', "'", '(', ')', '[', ']', '{', '}', '-', '–', '—', '/', '\\'
  ]
};

export const getAllGujaratiCharacters = () => {
  return [
    ...gujaratiCharacters.consonants,
    ...gujaratiCharacters.vowels,
    ...gujaratiCharacters.vowelSigns,
    ...gujaratiCharacters.numbers,
    ...gujaratiCharacters.compounds,
    ...gujaratiCharacters.symbols
  ];
};

export const getCharactersByCategory = () => gujaratiCharacters;
