const chai = require('chai')
  , stringMiddleware = require('./string');

const expect = chai.expect;

describe('Middleware.Publisher.string', () => {
  it('converts the given string content into a buffer created from that string', () => {
    const expectedString = 'some-string';
    const [, content] = stringMiddleware('some-routing-key', expectedString);
    expect(content.toString()).to.equal(expectedString);
  });

  it('persists the given routing key', () => {
    const expectedRoutingKey = 'some-routing-key';
    const [routingKey] = stringMiddleware(expectedRoutingKey, 'some-content');
    expect(routingKey).to.equal(expectedRoutingKey);
  });

  it('defaults to empty options', () => {
    const [, , options] = stringMiddleware('some-routing-key', 'some-content');
    expect(options).to.be.an('object').that.is.empty;
  });

  it('persists the given options', () => {
    const expectedOptions = { anOption: 'a-value', anotherOption: 'another-value' };
    const [, , options] = stringMiddleware('some-routing-key', 'some-content', expectedOptions);
    expect(options).to.equal(expectedOptions);
  });
});
