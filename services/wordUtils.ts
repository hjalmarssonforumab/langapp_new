
import { ParsedWord } from '../types';

/**
 * Parses a word string containing brackets to identify the target sound.
 * Example: "[Skj]orta" -> prefix: "", highlight: "Skj", suffix: "orta"
 * Example: "Du[sch]" -> prefix: "Du", highlight: "sch", suffix: ""
 */
export const parseBracketedWord = (input: string): ParsedWord => {
  const regex = /^(.*?)\[(.*?)\](.*)$/;
  const match = input.match(regex);

  if (!match) {
    // Fallback if no brackets found
    return {
      fullWord: input,
      prefix: input,
      highlight: "",
      suffix: ""
    };
  }

  return {
    fullWord: match[1] + match[2] + match[3],
    prefix: match[1],
    highlight: match[2],
    suffix: match[3]
  };
};
