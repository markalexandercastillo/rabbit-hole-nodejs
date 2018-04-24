const create =
  (channel, exchange) =>
    Promise.resolve({
      /**
       * See http://www.squaremobius.net/amqp.node/channel_api.html#channel_publish
       * @param {string} routingKey
       * @param {Buffer} content
       * @param {Object} options
       * @param {string} options.expiration
       * @param {string} options.userId
       * @param {string|string[]} options.CC
       * @param {number} options.priority
       * @param {boolean} options.persistent
       * @param {boolean|number} options.deliveryMode
       * @param {boolean} options.mandatory
       * @param {string|string[]} options.BCC
       * @param {boolean} options.immediate
       * @param {string} options.contentType
       * @param {string} options.contentEncoding
       * @param {object} options.headers
       * @param {string} options.correlationId
       * @param {string} options.replyTo
       * @param {string} options.messageId
       * @param {number} options.timestamp
       * @param {string} options.type
       * @param {string} options.appId
       */
      publish: (routingKey, content, options = {}) =>
        channel.publish(exchange, routingKey, content, options),
    });

module.exports = {
  create,
};
