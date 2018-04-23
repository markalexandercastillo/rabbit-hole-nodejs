const chai = require('chai')
  , jsonMiddleware = require('./json');

const expect = chai.expect;

describe('Middleware.Consumer.json', () => {
  it('throws an error when contentType is not set', () => {
    expect(() => jsonMiddleware({ properties: {} }))
      .to.throw("JSON-encoded messages are expected to have the content_type header property set to 'application/json'");
  });

  it("throws an error when contentType is not 'application/json'", () => {
    expect(() => jsonMiddleware({
      properties: {
        contentType: 'application/octet-stream'
      }
    }))
      .to.throw("JSON-encoded messages are expected to have the content_type header property set to 'application/json'");
  });

  it("appends a 'json' property with a value of the JSON-decoded content", () => {
    const expectedContent = {
      someKey: 'some-value',
    };

    const message = jsonMiddleware({
      properties: {
        contentType: 'application/json'
      },
      content: {
        toString: () => JSON.stringify(expectedContent),
      },
    });

    expect(message).to.deep.contain({
      json: expectedContent,
    });
  });

  it('persists other the rest of the message', () => {
    const expectedMessageSubset = {
      properties: {
        contentType: 'application/json'
      },
      content: {
        toString: () => JSON.stringify({}),
      },
    };

    const message = jsonMiddleware(expectedMessageSubset);

    expect(message).to.deep.contain(expectedMessageSubset);
  });
});
