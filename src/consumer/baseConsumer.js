const create =
  (channel, queue) =>
    Promise.resolve({
      /**
       * See http://www.squaremobius.net/amqp.node/channel_api.html#channel_consume
       * @callback cb
       * @param {object} options
       * @param {boolean} options.noLocal
       * @param {string} options.consumerTag
       * @param {boolean} options.noAck
       * @param {boolean} options.exclusive
       * @param {number} options.priority
       * @param {object} options.arguments
       */
      consume: (cb, options = {}) =>
        channel.consume(queue, cb, options),
      /**
       * See http://www.squaremobius.net/amqp.node/channel_api.html#channel_ack
       * @param {object} message
       * @param {boolean} [allUpTo=false]
       */
      ack: (message, allUpTo = false) =>
        channel.ack(message, allUpTo),
      /**
       * See http://www.squaremobius.net/amqp.node/channel_api.html#channel_nack
       * @param {object} message
       * @param {boolean} [allUpTo=false]
       * @param {boolean} [requeue=true]
       */
      nack: (message, allUpTo = false, requeue = true) =>
        channel.nack(message, allUpTo, requeue),
    });

module.exports = {
  create,
};
