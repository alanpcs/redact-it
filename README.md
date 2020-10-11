# Redact-it
A flexible and easy way to redact data from objects.

## Why?
This project was designed from real-world scenarios composed of 2 main concerns:
1. Preventing sensitive data to be written in logs;
1. Investigating production requests by using meaningful log messages and contexts;

The first one is by far the most important. If an attack or some failure 
exposes logs, sensitive data might come within them. Surely, most systems are designed
to never let it happen. But in case it does, have sensitive data redacted mitigates
the negative impact. 

To solve that, one way is to never print any data to logs. However, 
context logging may save a lot of time on debugging or investigating a specific 
situation in production. 

## How?
Since neither approaches are ideal for both parts, the owner of the data may 
determine how much of the actual data can be printed out to logs. Depending on 
the type of data logged, partial printing can be used to be a middle point between
the two concerns. This is where this tiny library comes in handy :) 

This library helps to build a replacer function flexible enough to declare
which fields are going to be redacted and how.

Then, the replacer function might be used with the logging tool of your choice.
In the tests and following examples, we are using the 
[`JSON.stringify()`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) 
for its simplicity.

## Docs
The most important concepts to read about are documented in 
[this file](https://github.com/alanpcs/redact-it/blob/master/typings/index.ts).

## Examples
_We have some tests with more usage examples, check them out_
_[here](https://github.com/alanpcs/redact-it/tree/master/test/unit)!_


For the following examples, we are going to use this main object as reference:
```typescript
const userInfoToBeLogged = {
  password: "123",
  name: "foo",
  card: {
    number: "1234567887654321",
    cvv: "123",
    expirationDate: "2020-12-20",
  },
};
```

### Default usage
If the idea is to redact the data entirely, you just need to to name the fields.
The default `Mask` is the `percentage` with `100`% redacting with the fixed 
string `[redacted]`;

```typescript
const redactItConfig: RedactItConfig = {
    fields: ["password", "cvv"]
};

const replacerFunction: ReplacerFunction = redactIt(redactItConfig);

const stringResult = JSON.stringify(userInfoToBeLogged, replacerFunction);
const parsedResult = JSON.parse(stringResult);

/* parsedResult
{
  name: 'foo',
  password: '[redacted]',
  card: {
    number: '1234567887654321',
    cvv: '[redacted]',
    expirationDate: '2020-12-20',
  }
}
*/
```

### With multiple sets of fields and masks to apply to each set

```typescript
const redactItConfig: RedactItConfig = [
    {
        fields: ["password"], // which fields to redact
        mask: {  // How to redact the fields
            type: "undefine" // the undefine mask removes the fields
        }
    },
    {
        fields: ["expirationDate", "number"], 
        mask: {
            type: "percentage", // Percentage masks redact data partially
            redactWith: "•", // Redacted characters replaced by •
            percentage: 75 // 75% of the value should be redacted
        }
    },
    { fields: ["cvv"] } // if no mask is passed, fields values are redacted as [redacted]
];

const replacerFunction: ReplacerFunction = redactIt(redactItConfig);

const stringResult = JSON.stringify(userInfoToBeLogged, replacerFunction);
const parsedResult = JSON.parse(stringResult);

/* parsedResult
{
  name: 'foo',
  card: {
    number: '••••••••••••4321',
    cvv: '[redacted]',
    expirationDate: '••••••••20'
  }
}
*/
```

## Objectives
This project aims to have a flexible yet powerful API to create a replacer 
function to redact partial or entire object values.

### Roadmap
- Support partial email redacting
- Partial redacting positioning (start, middle, end)

## Contributing
If you like this project and want to contribute with it, you can fork it and 
create a pull request :)