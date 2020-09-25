import { Mask, ReplaceIt, Options, ReplacerFunction } from "../typings";

const valueMasker = (value: any, mask: Mask): string => {
  const redactor = mask.redactWith ?? "[redacted]";
  const percentage = mask.percentage ?? 100;
  const complementary = mask.complementary ?? false;

  const stringValue = String(value);
  const stringLength = stringValue.length;
  const maskedLength = Math.ceil((stringLength * percentage) / 100);

  const regex = new RegExp(`(.{${maskedLength}})(.*)`);

  if (redactor.length > 1) {
    if (complementary) {
      return stringValue.replace(regex, (_match, p1) => `${p1}${redactor}`);
    }
    return stringValue.replace(regex, (_match, _p1, p2) => `${redactor}${p2}`);
  }

  if (complementary) {
    return stringValue.replace(
      regex,
      (_match, p1, p2) => `${p1}${p2.replace(/./g, redactor)}`
    );
  }
  return stringValue.replace(
    regex,
    (_match, p1, p2) => `${p1.replace(/./g, redactor)}${p2}`
  );
};

export const replaceIt: ReplaceIt = (options?: Options): ReplacerFunction => {
  const optionFields = options?.fields ?? [];
  const fields: string[] = ["password", ...optionFields];
  const defaultMask: Mask = {
    type: "percentage",
  };
  const mask: Mask = options?.mask ?? defaultMask;

  const replacer = (key: string, value: string): any => {
    if (fields.includes(key)) {
      if (mask.type === "undefine") {
        return undefined;
      }
      return valueMasker(value, mask);
    }
    return value;
  };
  return replacer;
};
