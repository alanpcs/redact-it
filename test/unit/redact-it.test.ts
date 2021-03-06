import { expect } from "chai";
import { redactIt } from "../../src/redact-it";
import { ReplacerFunction } from "../../typings";

const defaultObject = {
  password: "very.strong.password123",
  name: "foo",
  email: "foo123456789email@bar.com",
  TOKEN: "my-secret-access-token",
  card: {
    number: "1234567887654321",
    cvv: "123",
    expirationDate: "2020-12-20",
  },
  authorization: "Bearer token",
};

describe("Redact-it - Single configs argument", () => {
  it("should redact only 'password' field by default", async () => {
    const myData = { ...defaultObject };
    const replacerFunction: ReplacerFunction = redactIt();

    const stringResult = JSON.stringify(myData, replacerFunction);

    expect(JSON.parse(stringResult)).to.deep.equal({
      ...defaultObject,
      password: "[redacted]",
    });
  });

  it("should redact the fields from the args", async () => {
    const myData = { ...defaultObject };
    const replacerFunction: ReplacerFunction = redactIt({
      fields: ["password", "expirationDate"],
    });

    const stringResult = JSON.stringify(myData, replacerFunction);

    expect(JSON.parse(stringResult)).to.deep.equal({
      ...defaultObject,
      password: "[redacted]",
      card: {
        ...defaultObject.card,
        expirationDate: "[redacted]",
      },
    });
  });

  it("should redact based on regex field", async () => {
    const myData = {
      AUTHORIZATION: "uppercase",
      authorization: "lowercase",
      Authorization: "capitalized",
    };
    const replacerFunction: ReplacerFunction = redactIt({
      fields: [/Authorization/i],
    });

    const stringResult = JSON.stringify(myData, replacerFunction);

    expect(JSON.parse(stringResult)).to.deep.equal({
      AUTHORIZATION: "[redacted]",
      authorization: "[redacted]",
      Authorization: "[redacted]",
    });
  });

  it("should use redactWith string if 'replace' mask is used", async () => {
    const myData = { ...defaultObject };
    const replacerFunction: ReplacerFunction = redactIt({
      fields: ["password"],
      mask: {
        type: "replace",
        redactWith: "(ommited value)",
      },
    });

    const stringResult = JSON.stringify(myData, replacerFunction);

    expect(JSON.parse(stringResult)).to.deep.equal({
      ...defaultObject,
      password: "(ommited value)",
    });
  });

  it("should remove the fields when the 'undefine' mask is used", async () => {
    const myData = { ...defaultObject };
    const replacerFunction: ReplacerFunction = redactIt({
      fields: ["password", "cvv"],
      mask: { type: "undefine" },
    });

    const stringResult = JSON.stringify(myData, replacerFunction);
    const parsedResult = JSON.parse(stringResult);
    expect(parsedResult.password).to.be.undefined;
    expect(parsedResult.card.cvv).to.be.undefined;
  });

  /**
   * By using `map[key]` directly, there is a risk we try to access Object.prototype keys,
   * which is unsafe and may cause issues
   */
  it("should not redact Object.prototype keys", async () => {
    const myData = {
      constructor: () => 1,
      toString: () => 1,
      valueOf: () => 1,
      hasOwnProperty: () => 1,
      isPrototypeOf: () => 1,
      propertyIsEnumerable: () => 1,
    };
    const replacerFunction: ReplacerFunction = redactIt();

    const stringResult = JSON.stringify(myData, replacerFunction);
    const parsedResult = JSON.parse(stringResult);

    expect(parsedResult).to.be.deep.eq({});
  });

  it("should redact the first 12 digits of a 16 digits value when a 75% percentage mask is used", async () => {
    const myData = { ...defaultObject };
    const replacerFunction: ReplacerFunction = redactIt({
      fields: ["number"],
      mask: { type: "percentage", redactWith: "*", percentage: 75 },
    });

    const stringResult = JSON.stringify(myData, replacerFunction);

    expect(JSON.parse(stringResult).card.number).to.be.eq("************4321");
  });

  it("should redact the middle digits when position center is used", async () => {
    const myData = { ...defaultObject };
    const replacerFunction: ReplacerFunction = redactIt({
      fields: ["email"],
      mask: {
        type: "percentage",
        redactWith: "*",
        percentage: 50,
        position: "center",
      },
    });

    const stringResult = JSON.stringify(myData, replacerFunction);

    expect(JSON.parse(stringResult).email).to.be.eq(
      "foo123*************ar.com"
    );
  });

  it("should redact the last digits when position right is used", async () => {
    const myData = { ...defaultObject };
    const replacerFunction: ReplacerFunction = redactIt({
      fields: ["email"],
      mask: {
        type: "percentage",
        redactWith: "*",
        percentage: 75,
        position: "right",
      },
    });

    const stringResult = JSON.stringify(myData, replacerFunction);

    expect(JSON.parse(stringResult).email).to.be.eq(
      "foo123*******************"
    );
  });

  it("should redact the beginning and ending digits when position center is used and complementary is true", async () => {
    const myData = { ...defaultObject };
    const replacerFunction: ReplacerFunction = redactIt({
      fields: ["email"],
      mask: {
        type: "percentage",
        redactWith: "*",
        percentage: 50,
        position: "center",
        complementary: true,
      },
    });

    const stringResult = JSON.stringify(myData, replacerFunction);

    expect(JSON.parse(stringResult).email).to.be.eq(
      "******456789email@b******"
    );
  });

  it("should default to 100% mask with • if percentage mask is used", async () => {
    const myData = { ...defaultObject };
    const replacerFunction: ReplacerFunction = redactIt({
      fields: ["email"],
      mask: {
        type: "percentage",
      },
    });

    const stringResult = JSON.stringify(myData, replacerFunction);

    expect(JSON.parse(stringResult).email).to.be.eq(
      "•••••••••••••••••••••••••"
    );
  });
});

describe("Redact-it - Multiple configs argument", () => {
  it("should redact the fields from the args with default mask when no mask is given", async () => {
    const myData = { ...defaultObject };
    const replacerFunction: ReplacerFunction = redactIt([
      { fields: ["password"] },
      { fields: ["expirationDate"] },
    ]);

    const stringResult = JSON.stringify(myData, replacerFunction);

    expect(JSON.parse(stringResult)).to.deep.equal({
      ...defaultObject,
      password: "[redacted]",
      card: {
        ...defaultObject.card,
        expirationDate: "[redacted]",
      },
    });
  });

  it("should redact the fields with the corresponding mask for each configs", async () => {
    const myData = { ...defaultObject };
    const replacerFunction: ReplacerFunction = redactIt([
      {
        fields: ["email"],
        mask: {
          type: "percentage",
          redactWith: "⊘",
          percentage: 25,
          position: "center",
          complementary: true,
        },
      },
      {
        fields: ["password"],
        mask: {
          type: "undefine",
        },
      },
      {
        fields: ["expirationDate", "number"],
        mask: {
          type: "percentage",
          redactWith: "•",
          percentage: 75,
        },
      },
      { fields: ["cvv"] },
    ]);

    const stringResult = JSON.stringify(myData, replacerFunction);
    const parsedResult = JSON.parse(stringResult);

    expect(parsedResult.password).to.be.undefined;
    expect(parsedResult.email).to.be.equal("⊘⊘⊘⊘⊘⊘⊘⊘⊘789emai⊘⊘⊘⊘⊘⊘⊘⊘⊘");
    expect(parsedResult.card).to.deep.equal({
      ...defaultObject.card,
      expirationDate: "••••••••20",
      number: "••••••••••••4321",
      cvv: "[redacted]",
    });
  });

  it("should prefer perfect match over a regex", async () => {
    const myData = {
      AUTHORIZATION: "uppercase",
      authorization: "lowercase",
      Authorization: "capitalized",
    };
    const replacerFunction: ReplacerFunction = redactIt([
      {
        fields: ["Authorization"],
        mask: {
          type: "undefine",
        },
      },
      {
        fields: [/Authorization/i],
        mask: {
          type: "percentage",
          percentage: 50,
          redactWith: "•",
        },
      },
      {
        fields: ["AUTHORIZATION"],
        mask: {
          type: "undefine",
        },
      },
    ]);

    const stringResult = JSON.stringify(myData, replacerFunction);

    expect(JSON.parse(stringResult)).to.deep.equal({
      authorization: "•••••case",
    });
  });

  it("overrides configs for same field", () => {
    const myData = { ...defaultObject };
    const replacerFunction = redactIt([
      {
        fields: ["email", "name"],
        mask: {
          type: "replace",
          redactWith: "firstRule",
        },
      },
      {
        fields: ["email"],
        mask: {
          type: "replace",
          redactWith: "secondRule",
        },
      },
    ]);

    const stringResult = JSON.stringify(myData, replacerFunction);
    const parsedResult = JSON.parse(stringResult);

    expect(parsedResult.name).to.be.equal("firstRule");
    expect(parsedResult.email).to.be.equal("secondRule");
  });
});
