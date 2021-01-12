import { expect } from "chai";
import { redactIt } from "../../src/redact-it";
import { ReplacerFunction } from "../../typings";

const defaultObject = {
  password: "123",
  name: "foo",
  email: "foo123456789email@bar.com",
  card: {
    number: "1234567887654321",
    cvv: "123",
    expirationDate: "2020-12-20",
  },
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

  it("should redact the first 12 digits of a 16 digits value when a 75% percentage mask is used", async () => {
    const myData = { ...defaultObject };
    const replacerFunction: ReplacerFunction = redactIt({
      fields: ["number"],
      mask: { type: "percentage", redactWith: "*", percentage: 75 },
    });

    const stringResult = JSON.stringify(myData, replacerFunction);

    expect(JSON.parse(stringResult).card.number).to.be.eq("************4321");
  });

  it("should redact the last 4 digits of a 16 digits value when a 75% complementary percentage mask is used", async () => {
    const myData = { ...defaultObject };
    const replacerFunction: ReplacerFunction = redactIt({
      fields: ["number"],
      mask: {
        type: "percentage",
        redactWith: "*",
        percentage: 75,
        complementary: true,
      },
    });

    const stringResult = JSON.stringify(myData, replacerFunction);

    expect(JSON.parse(stringResult).card.number).to.be.eq("123456788765****");
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

  it("should redact the beginning and ending digits when position center is used and complementary is tru", async () => {
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
});
