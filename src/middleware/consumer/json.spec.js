const chai = require('chai')
  , jsonMiddleware = require('./json');

const expect = chai.expect;

describe('Middleware.Consumer.json', () => {
  it('throws an error when contentType is not set', () => {
    expect(jsonMiddleware().onMessage({ properties: {} }))
      .to.be.rejectedWith("JSON-encoded messages are expected to have the content_type header property set to 'application/json'");
  });

  it("throws an error when contentType is not 'application/json'", () => {
    expect(jsonMiddleware().onMessage({
      properties: {
        contentType: 'application/octet-stream'
      }
    })).to.be.rejectedWith("JSON-encoded messages are expected to have the content_type header property set to 'application/json'");
  });

  it("appends a 'json' property with a value of the JSON-decoded content", () => {
    const expectedContent = {
      someKey: 'some-value',
    };

    expect(jsonMiddleware().onMessage({
      properties: {
        contentType: 'application/json'
      },
      content: {
        toString: () => JSON.stringify(expectedContent),
      },
    })).to.eventually.deep.contain({
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

    expect(jsonMiddleware().onMessage(expectedMessageSubset)).to.eventually.deep.contain(expectedMessageSubset);
  });
});
