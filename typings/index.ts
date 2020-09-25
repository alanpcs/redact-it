/**
 *  Mask options
 *  @param {string} type - Type of the mask to be applied
 *  @param {string} redactWith - Character or word to be used as the redacted part
 *  @param {number} percentage - Percentage of the value to apply the mask on
 *  @param {boolean} complementary - Whether the complemetary part of the percentage should be masked
 */
export interface Mask {
  type: "percentage" | "undefine";
  redactWith?: "*" | "•" | "[redacted]" | string;
  percentage?: number;
  complementary?: boolean;
}

/**
 *  Redact-it options to customize which and how fields are going to be redacted
 *  @param {string[]} fields - Field names to redact
 *  @param {Mask} mask - Which mask to apply
 */
export interface Options {
  fields: string[];
  mask?: Mask;
}

export type ReplacerFunction = (
  key: string,
  value: string
) => string | undefined;

/**
 *  A function that accepts options to create a replacer function
 *  @param {Options} options - Options to customize the redact function
 *  @param {function} replacer - A replacer function compatible with JSON.stringify
 */
export type ReplaceIt = (options?: Options) => ReplacerFunction;
