import { Mask, RedactIt, RedacItConfig, ReplacerFunction } from "../typings";

const valueMasker = (value: any, mask: Mask): string => {
  const redactor = mask.redactWith ?? "[redacted]";
  const percentage = mask.percentage ?? 100;
  const complementary = mask.complementary ?? false;
  const position = mask.position ?? "left";

  const finalRedactor = (p1: string): string =>
    redactor.length > 1 ? redactor : p1.replace(/./g, redactor);

  if (percentage === 100) return finalRedactor(value);

  const stringValue = String(value);
  const stringLength = stringValue.length;
  const maskedLength = Math.ceil((stringLength * percentage) / 100);
  const unmaskedLength = stringLength - maskedLength;

  const regexString = (): string => {
    if (position === "center") {
      return `(.{${unmaskedLength / 2}})(.{${maskedLength}})(.+)`;
    }
    return `(.{${maskedLength}})(.{${unmaskedLength}})`;
  };

  const regex = new RegExp(regexString());

  const masoq = (_match: any, p1: string, p2: string, p3?: string): string => {
    if (p3 && complementary) {
      return `${finalRedactor(p1)}${p2}${finalRedactor(p3)}`;
    }
    if (p3) {
      return `${p1}${finalRedactor(p2)}${p3}`;
    }
    if (complementary || (position === "right" && !complementary)) {
      return `${p1}${finalRedactor(p2)}`;
    }
    return `${finalRedactor(p1)}${p2}`;
  };

  stringValue.replace(regex, (_match, p1, p2) => `${p1}${finalRedactor(p2)}`);

  return stringValue.replace(regex, masoq);
};

export const redactIt: RedactIt = (
  configs?: RedacItConfig | RedacItConfig[]
): ReplacerFunction => {
  const defaultMask: Mask = {
    type: "percentage",
  };

  const defaultOptions: RedacItConfig = {
    fields: ["password"],
    mask: defaultMask,
  };

  const mappedFields: Map<string | RegExp, Mask> = new Map();

  const optionsArray: RedacItConfig[] = Array.isArray(configs)
    ? configs
    : [configs ?? defaultOptions];

  optionsArray.forEach((option: RedacItConfig) => {
    option.fields.forEach((field) => {
      mappedFields.set(field, option.mask ?? defaultMask);
    });
  });

  const getMaskForKey = (key: any): Mask | null => {
    for (const [matcher, mask] of mappedFields.entries()) {
      if (matcher instanceof RegExp) {
        if (matcher.test(key)) {
          return mask;
        }
      } else if (matcher === key) {
        return mask;
      }
    }
    return null;
  };

  const replacer = (key: any, value: any): any => {
    const mask = getMaskForKey(key);
    if (mask) {
      if (mask.type === "undefine") {
        return undefined;
      }
      return valueMasker(value, mask);
    }
    return value;
  };
  return replacer;
};
