# Redact-it

A simple to use and dependecy free package to redact data from objects. This
should be useful when logging requests data and so. The logs of a project are
created with security in mind, but in any case of log leak, the attackers should
never have the full information.

This project aims to have a flexible yet powerful API to redact partially or
entirely object values.

```javascript
const myData = { password: "123", name: "foo"};

const replacerFunction = replaceIt({ fields: ["password"] });

const stringResult = JSON.stringify(myData, replacerFunction);
// '{"password": "[redacted]","name": "foo"}'
```