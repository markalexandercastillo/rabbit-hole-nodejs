const chai = require('chai')
  , stringMiddleware = require('./string');

const expect = chai.expect;

describe('Middleware.Publisher.string', () => {
  it('converts the given string content into a buffer created from that string', () => {
    const expectedString = 'some-string';
    const content = stringMiddleware.onContent(expectedString);
    expect(content.toString()).to.equal(expectedString);
  });
});
