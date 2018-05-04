const chai = require('chai')
  , jsonMiddleware = require('./json');

const expect = chai.expect;

describe('Middleware.Publisher.json', () => {
  it('converts the given content to a buffer of the JSON-encoded content', () => {
    const expectedContent = {someKey: 'some-value'};
    const content = jsonMiddleware().onContent(expectedContent);
    expect(JSON.parse(content.toString())).to.deep.equal(expectedContent);
  });

  it("defaults to a contentType option set to 'application/json'", () => {
    const options = jsonMiddleware().onOptions();
    expect(options).to.deep.equal({
      contentType: 'application/json',
    });
  });

  it("persists the given options and add a contentType option set to 'application/json'", () => {
    const expectedOptions = { anOption: 'a-value', anotherOption: 'another-value' };
    const options = jsonMiddleware().onOptions(expectedOptions);
    expect(options).to.deep.equal({
      ...expectedOptions,
      contentType: 'application/json',
    });
  });

  it("overwrites the given contentType option with 'application/json'", () => {
    const options = jsonMiddleware().onOptions({
      contentType: 'application/octet-stream'
    });
    expect(options).to.deep.equal({
      contentType: 'application/json',
    });
  });
});
