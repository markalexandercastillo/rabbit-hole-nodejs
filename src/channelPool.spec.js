const td = require('testdouble')
  , chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , ChannelPool = require('./channelPool');

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('ChannelPool', () => {
  let connection, channelPool;
  beforeEach(() => {
    connection = td.object(['createChannel']);
    channelPool = ChannelPool.create(connection);
  });

  describe('Instance methods', () => {
    describe('.get', () => {
      it('resolves to a channel created by the connection the channelPool was created with', () => {
        const expectedChannel = td.object('Some Channel');
        td.when(connection.createChannel()).thenResolve(expectedChannel);
        expect(channelPool.get()).to.eventually.deep.equal(expectedChannel);
      });

      it('sets the prefetch on the created channel when the prefetch option is set', done => {
        const expectedPrefetch = 4;
        const expectedChannel = td.object(['prefetch']);
        td.when(connection.createChannel()).thenResolve(expectedChannel);
        td.when(expectedChannel.prefetch(expectedPrefetch)).thenResolve();
        channelPool.get({prefetch: expectedPrefetch})
          .then(() => done());
      });

      context('Caching', () => {
        const options = {
          prefetch: 5,
          exchange: 'some-exchange',
          queue: 'some-queue',
        };

        const optionSubsets =
          Object.keys(options).reduce(
            (optionSubsets, optionKey) =>
              [
                ...optionSubsets,
                ...optionSubsets.map(
                  optionSubset =>
                    ({
                      [optionKey]: options[optionKey],
                      ...optionSubset
                    })
                )
              ],
            [[]]
          );

        optionSubsets
          .forEach(optionSubset => {
            const expectationFragment = Object.keys(optionSubset).map(optionKey => `'${optionKey}'`).join(', ');
            it(`returns the same channel on multiple invocations with the same values for: ${expectationFragment || 'No options'}`, done => {
              const expectedChannel = td.object(['prefetch']);
              td.when(connection.createChannel()).thenResolve(expectedChannel);
              td.when(expectedChannel.prefetch(), { ignoreExtraArgs: true }).thenResolve();
              channelPool.get(optionSubset)
                .then(firstChannel => Promise.all([firstChannel, channelPool.get(optionSubset)]))
                .then(([firstChannel, secondChannel]) => {
                  expect(firstChannel).to.deep.equal(expectedChannel);
                  expect(secondChannel).to.deep.equal(expectedChannel);
                })
                .then(() => done());
            });
          });
      });
    });

    describe('.close', () => {
      it('closes all the channels returned by get', done => {
        const [aChannel, anotherChannel] = [td.object(['close']), td.object(['close'])];
        td.when(connection.createChannel()).thenResolve(aChannel, anotherChannel);
        channelPool
          .get({exchange: 'some-exchange'})
          .then(() => channelPool.get({exchange: 'another-exchange'}))
          .then(() => channelPool.close())
          .then(() => {
            td.verify(aChannel.close());
            td.verify(anotherChannel.close());
          })
          .then(() => done())
          .catch(done);
      });
    });
  });
});

