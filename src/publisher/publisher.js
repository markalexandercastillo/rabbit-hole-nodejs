const create =
  channelPool => ({
    BasePublisher: {
      create: createPublisher(channelPool, require('./basePublisher'))
    },
    MiddlewarePublisher: {
      create: createPublisher(channelPool, require('./middlewarePublisher'))
    },
  });

const createPublisher =
  /**
   * @param {object} channelPool
   * @param {object} publisherModule
   */
  (channelPool, publisherModule) =>
    /**
    * @param {string} exchange
    */
    exchange =>
      channelPool.get({ exchange })
        .then(channel => publisherModule.create(channel, exchange));

module.exports = {
  create,
};
