/**
 *  Mask options
 *  @param {string} type - Type of the mask to be applied
 *  @param {string} redactWith - Character or word to be used as the redacted part
 *  @param {number} percentage - Percentage of the value to apply the mask on
 *  @param {boolean} complementary - Whether the complemetary part of the percentage should be masked
 */
export type Mask = PercentageMask | UndefineMask | ReplaceMask;

export interface PercentageMask {
  type: "percentage";
  redactWith?: "*" | "•" | "[redacted]" | string;
  percentage?: number;
  complementary?: boolean;
  position?: "left" | "center" | "right";
}
export interface UndefineMask {
  type: "undefine";
}
export interface ReplaceMask {
  type: "replace";
  redactWith: "[redacted]" | string;
}

/**
 *  Redact-it configs to customize how and which fields are going to be redacted
 *  @param {string[]} fields - Field names to redact
 *  @param {Mask} mask - Which mask to apply
 */
export interface RedactItConfig {
  fields: (string | RegExp)[];
  mask?: Mask;
}

export type ReplacerFunction = (key: any, value: any) => any;

/**
 *  A function that takes the argument and creates a replacer function
 *  The arguement may be a single object of the RedacItConfig type or an array of these objects
 *  @param {RedactItConfig | RedactItConfig[]} configs - RedacItConfig to customize the redact function
 *  @param {function} replacer - A replacer function compatible with JSON.stringify
 */
export type RedactIt = (
  configs?: RedactItConfig | RedactItConfig[]
) => ReplacerFunction;
