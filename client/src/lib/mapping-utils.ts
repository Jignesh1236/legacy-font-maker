import { MappingRule } from "@shared/schema";
import { normalizeGujaratiText } from "@shared/text-utils";

export function convertText(text: string, rules: MappingRule[]): string {
  const activeRules = rules.filter(rule => rule.isActive);
  
  // Apply Gujarati text normalization first
  const normalizedText = normalizeGujaratiText(text);
  
  // Convert character by character to avoid double conversion
  let result = '';
  const chars = Array.from(normalizedText); // Handle multi-byte Unicode properly
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    let converted = false;
    
    // Find the first matching rule for this character
    for (const rule of activeRules) {
      let matches = false;
      
      if (rule.caseSensitive) {
        matches = char === rule.sourceChar;
      } else {
        matches = char.toLowerCase() === rule.sourceChar.toLowerCase();
      }
      
      if (matches) {
        result += rule.targetChar;
        converted = true;
        break; // Use first matching rule only
      }
    }
    
    // If no rule matched, keep the original character
    if (!converted) {
      result += char;
    }
  }
  
  // Apply normalization again to ensure proper character sequences
  return normalizeGujaratiText(result);
}

export function getTextStatistics(text: string) {
  return {
    characters: text.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text.split('\n').length,
  };
}

export function exportToFile(content: string, filename: string, type: 'text' | 'json' = 'text') {
  const blob = new Blob([content], { 
    type: type === 'json' ? 'application/json' : 'text/plain' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.json')) {
          resolve(JSON.parse(content));
        } else if (fileName.endsWith('.csv')) {
          const lines = content.split('\n').filter(line => line.trim());
          const rules = lines.slice(1).map(line => {
            const [sourceChar, targetChar] = line.split(',').map(s => s.trim());
            return { sourceChar, targetChar, caseSensitive: true };
          });
          resolve({ rules });
        } else if (fileName.endsWith('.txt')) {
          const lines = content.split('\n').filter(line => line.trim());
          const rules = lines.map(line => {
            const [sourceChar, targetChar] = line.split('=').map(s => s.trim());
            return { sourceChar, targetChar, caseSensitive: true };
          }).filter(rule => rule.sourceChar && rule.targetChar);
          resolve({ rules });
        } else {
          reject(new Error('Unsupported file format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
