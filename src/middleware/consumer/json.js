const CONTENT_TYPES = require('./../../contentTypes');

const onMessage =
  JSON => message => new Promise((resolve, reject) => {
    if (
      !message.properties.hasOwnProperty('contentType')
      || message.properties.contentType !== CONTENT_TYPES.JSON
    ) {
      return reject(new Error(`JSON-encoded messages are expected to have the content_type header property set to '${CONTENT_TYPES.JSON}'`));
    }

    resolve({
      json: JSON.parse(message.content.toString()),
      ...message,
    });
  });

const defaultJson = {
  parse: JSON.parse,
};

module.exports =
  ({ onError = null, JSON = defaultJson } = {}) => ({ onMessage: onMessage(JSON), onError });
