// Gujarati Unicode ranges and special characters
const GUJARATI_CONSONANTS = /[\u0A95-\u0AB9]/; // ક to હ
const GUJARATI_VOWELS = /[\u0A85-\u0A94]/; // અ to ઔ
const GUJARATI_VOWEL_SIGNS = /[\u0ABE-\u0ACD]/; // ા to ્ (includes all vowel signs)
const GUJARATI_HALANT = '\u0ACD'; // ્
const GUJARATI_I_MATRA = '\u0ABF'; // િ
const GUJARATI_E_MATRA = '\u0AC7'; // ે

// Vowel combination mappings - base vowel + matra = combined vowel
// Temporarily disabled problematic combinations that affect normal words
const VOWEL_COMBINATIONS: Record<string, string> = {
  '\u0A85\u0ABE': '\u0A86', // અ + ા = આ
  // '\u0A85\u0ABF': '\u0A87', // અ + િ = ઇ (disabled to fix અધિકારી issue)
  '\u0A85\u0AC0': '\u0A88', // અ + ી = ઈ
  '\u0A85\u0AC1': '\u0A89', // અ + ુ = ઉ
  '\u0A85\u0AC2': '\u0A8A', // અ + ૂ = ઊ
  '\u0A85\u0AC3': '\u0A8B', // અ + ૃ = ઋ
  '\u0A85\u0AC4': '\u0A8C', // અ + ૄ = ઌ
  '\u0A85\u0AC7': '\u0A8F', // અ + ે = એ
  '\u0A85\u0AC8': '\u0A90', // અ + ૈ = ઐ
  '\u0A85\u0ACB': '\u0A93', // અ + ો = ઓ
  '\u0A85\u0ACC': '\u0A94', // અ + ૌ = ઔ
};

export function normalizeGujaratiText(text: string): string {
  // First apply Unicode NFC normalization to combine base + diacritical marks
  let normalized = text.normalize('NFC');
  
  // Handle specific vowel combinations that should become different characters
  for (const [combination, replacement] of Object.entries(VOWEL_COMBINATIONS)) {
    normalized = normalized.replaceAll(combination, replacement);
  }
  
  // First pass: Fix i-matra positioning by moving it to the right consonant
  let firstPass = '';
  const chars1 = Array.from(normalized);
  
  for (let i = 0; i < chars1.length; i++) {
    const char = chars1[i];
    
    if (char === GUJARATI_I_MATRA) {
      // Look for the next consonant and move i-matra there
      let foundConsonant = false;
      for (let j = i + 1; j < chars1.length; j++) {
        if (GUJARATI_CONSONANTS.test(chars1[j])) {
          // Move all characters between current position and consonant
          for (let k = i + 1; k <= j; k++) {
            if (k < chars1.length) {
              firstPass += chars1[k];
            }
          }
          firstPass += char; // Add i-matra after the consonant
          i = j; // Skip to after the consonant
          foundConsonant = true;
          break;
        }
      }
      if (!foundConsonant) {
        firstPass += char; // Keep as is if no consonant found
      }
    } else {
      firstPass += char;
    }
  }
  
  // Additional normalization for proper character sequence handling
  let result = '';
  const chars = Array.from(firstPass); // Handle multi-byte Unicode properly
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const nextChar = chars[i + 1];
    const thirdChar = chars[i + 2];
    
    // Handle consonant + halant + vowel sign combinations
    // Example: ષ્ + ા = ષ (consonant + halant + vowel sign = just consonant)
    if (GUJARATI_CONSONANTS.test(char) && nextChar === GUJARATI_HALANT && thirdChar && GUJARATI_VOWEL_SIGNS.test(thirdChar) && thirdChar !== GUJARATI_HALANT) {
      result += char; // Just add the consonant, skip halant and vowel sign
      i += 2; // Skip both halant and vowel sign
      continue;
    }
    
    // Check for vowel combinations first (only for directly adjacent characters)
    const twoCharCombo = char + (nextChar || '');
    if (nextChar && VOWEL_COMBINATIONS[twoCharCombo]) {
      result += VOWEL_COMBINATIONS[twoCharCombo];
      i++; // Skip the next character as we've combined them
      continue;
    }
    
    // Handle i-matra positioning: move it to the correct consonant
    if (char === GUJARATI_I_MATRA && nextChar && GUJARATI_CONSONANTS.test(nextChar)) {
      // Move i-matra to be with the consonant: િ + ધ becomes ધિ
      result += nextChar + char;
      i++; // Skip the next character as we've already processed it
    } 
    // Handle proper consonant + vowel sign combinations (already correct)
    else if (GUJARATI_CONSONANTS.test(char) && nextChar && GUJARATI_VOWEL_SIGNS.test(nextChar)) {
      // This is correct order - consonant followed by vowel sign
      result += char + nextChar;
      i++; // Skip the next character as we've already processed it
    }
    // Handle vowel + vowel sign combinations that don't have specific mappings
    else if (GUJARATI_VOWELS.test(char) && nextChar && GUJARATI_VOWEL_SIGNS.test(nextChar)) {
      // Check if this combination has a specific mapping
      const combo = char + nextChar;
      if (VOWEL_COMBINATIONS[combo]) {
        result += VOWEL_COMBINATIONS[combo];
      } else {
        // Keep as separate characters for other combinations
        result += char + nextChar;
      }
      i++; // Skip the next character as we've already processed it
    }
    // Handle isolated vowel signs that need to be with preceding character
    else if (GUJARATI_VOWEL_SIGNS.test(char) && i > 0) {
      // Check if previous character was not processed in combination
      const prevChar = result[result.length - 1];
      if (prevChar && (GUJARATI_CONSONANTS.test(prevChar) || GUJARATI_VOWELS.test(prevChar))) {
        // Previous char can take a vowel sign, combine them
        result += char;
      } else {
        result += char;
      }
    }
    else {
      result += char;
    }
  }
  
  // Apply vowel combinations one more time and NFC normalization
  for (const [combination, replacement] of Object.entries(VOWEL_COMBINATIONS)) {
    result = result.replaceAll(combination, replacement);
  }
  
  return result.normalize('NFC');
}