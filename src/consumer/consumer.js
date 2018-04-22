const create =
  channelPool => ({
    BaseConsumer: {
      create: createConsumer(channelPool, require('./baseConsumer')),
    },
  });

const createConsumer =
  /**
   * @param {object} channelPool
   * @param {object} consumerModule
   */
  (channelPool, consumerModule) =>
    /**
     * @param {string} queue
     * @param {object} [options={}]
     * @param {number} [options.prefetch=1]
     */
    (queue, { prefetch = 1 } = {}) =>
      channelPool.get({ queue, prefetch })
        .then(channel => consumerModule.create(channel, queue, { prefetch }));

module.exports = {
  create,
};
