export type Mask =
  | PercentageMask
  | CenterPercentageMask
  | UndefineMask
  | ReplaceMask;

export interface PercentageMask {
  type: "percentage";
  /**
   * Character to be used as the redacted part
   * @default "•"
   */
  redactWith?: "*" | "•" | string;
  /**
   * Percentage of the value to apply the mask on
   * @default 100
   */
  percentage?: number;
  /**
   * Which part of the value to redact
   * @default "left"
   */
  position?: "left" | "right";
}

export interface CenterPercentageMask {
  type: "percentage";
  position: "center";
  /**
   * Character to be used as the redacted part
   * @default "•"
   */
  redactWith?: "*" | "•" | string;
  /**
   * Percentage of the value to apply the mask on
   * @default 100
   */
  percentage?: number;
  /**
   * Whether the complementary part of the percentage should be masked
   * @default false
   */
  complementary?: boolean;
}

export interface UndefineMask {
  type: "undefine";
}
export interface ReplaceMask {
  type: "replace";
  /**
   * Replace the value entirely with this string
   * @default "[redacted]"
   */
  redactWith: "[redacted]" | string;
}

export interface RedactItConfig {
  /** Field names to redact */
  fields: (string | RegExp)[];
  /** Which mask to apply */
  mask?: Mask;
}

/** A replacer function compatible with JSON.stringify */
export type ReplacerFunction = (key: any, value: any) => any;

/**
 *  A function that takes the argument and creates a replacer function
 *  The argument may be a single object of the RedactItConfig type or an array of these objects
 *  @param {RedactItConfig | RedactItConfig[]} configs - RedactItConfig to customize the redact function
 *  @return {ReplacerFunction} replacer - A replacer function compatible with JSON.stringify
 */
export type RedactIt = (
  configs?: RedactItConfig | RedactItConfig[]
) => ReplacerFunction;
