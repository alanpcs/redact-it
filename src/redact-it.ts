import {
  Mask,
  RedactIt,
  RedactItConfig,
  ReplacerFunction,
  PercentageMask,
  CenterPercentageMask,
} from '../typings';

const percentageValueMasker = (
  value: any,
  mask: PercentageMask | CenterPercentageMask,
): string | undefined => {
  const redactor = mask.redactWith ?? '•';
  const percentage = mask.percentage ?? 100;
  const complementary = (mask.position === 'center' && mask.complementary) ?? false;
  const position = mask.position ?? 'left';

  const finalRedactor = (p1: string): string =>
    redactor.length > 1 ? redactor : p1.replace(/./g, redactor);

  if (percentage === 100) return finalRedactor(value);

  const stringValue = String(value);
  const stringLength = stringValue.length;
  const maskedLength = Math.ceil((stringLength * percentage) / 100);
  const unmaskedLength = stringLength - maskedLength;

  const regexString = (): string => {
    if (position === 'center') {
      return `(.{${unmaskedLength / 2}})(.{${maskedLength}})(.+)`;
    }
    if (position === 'right') {
      return `(.{${unmaskedLength}})(.{${maskedLength}})`;
    }
    return `(.{${maskedLength}})(.{${unmaskedLength}})`;
  };

  const regex = new RegExp(regexString());

  const masoq = (_match: any, p1: string, p2: string, p3?: string): string => {
    if (p3 && complementary) {
      // Center + complementary
      return `${finalRedactor(p1)}${p2}${finalRedactor(p3)}`;
    }
    if (p3) {
      // Center
      return `${p1}${finalRedactor(p2)}${p3}`;
    }
    if (position === 'right') {
      // Right
      return `${p1}${finalRedactor(p2)}`;
    }
    // Left
    return `${finalRedactor(p1)}${p2}`;
  };

  stringValue.replace(regex, (_match, p1, p2) => `${p1}${finalRedactor(p2)}`);

  return stringValue.replace(regex, masoq);
};

export const redactIt: RedactIt = (
  configs?: RedactItConfig | RedactItConfig[],
): ReplacerFunction => {
  const defaultMask: Mask = {
    type: 'replace',
    redactWith: '[redacted]',
  };

  const defaultOptions: RedactItConfig = {
    fields: ['password'],
    mask: defaultMask,
  };

  const mappedFields: Map<string | RegExp, Mask> = new Map();

  const optionsArray: RedactItConfig[] = Array.isArray(configs)
    ? configs
    : [configs ?? defaultOptions];

  optionsArray.forEach((option: RedactItConfig) => {
    option.fields.forEach((field) => {
      mappedFields.set(field, option.mask ?? defaultMask);
    });
  });

  const getMaskForKey = (key: any): Mask | null => {
    const mask = mappedFields.get(key);
    if (mask) {
      return mask;
    }

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
      if (mask.type === 'replace') {
        return mask.redactWith;
      }
      if (mask.type === 'undefine') {
        return undefined;
      }
      return percentageValueMasker(value, mask);
    }
    return value;
  };
  return replacer;
};
