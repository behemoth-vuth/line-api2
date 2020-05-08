const request = require('request-promise');

const config = {
  channelAccessToken: 'I1C99yaC4mqGqwbqtA4g5GnAgH4KpnEi/dh+X07JFsqpnY9OrNrAZm0Bkkrfa8ddcbj5T+Gvve4HhePrVnJ5Ia/zUPsGgmBvSaX1n15MVpZJPFsni4c076FnADbHCJjAEBAEG3yqUtt+LYQpKFoVFAdB04t89/1O/w1cDnyilFU=',
  channelSecret: '272e0dcfb4f2f409a292234f63bdbaa8'
}

const processImageMessage = (event) => {
  const messageId = event.message.id;

  const requestOptions = {
    uri: `https://api.line.me/v2/bot/message/${messageId}/content`,
    encoding: 'binary',
    method: 'GET',
    timeout: 60000, // 60 seconds
    headers: {
      Authorization: `Bearer ${config.channelAccessToken}`,
      'Content-Type': 'application/json',
    },
    resolveWithFullResponse: true,
  };

  return request(requestOptions)
    .then((response) => {
      const imageBinaryData = response.body;
      const base64EncodedImage = Buffer.from(imageBinaryData, 'binary').toString('base64');

      // Here you may need to do something with the image, such as storing the image somewhere.

      // Actually you can reply image message with text and vice versa
      // But in this example we will reply image message with another image
      const messages = [
        {
          type: 'image',
          originalContentUrl: 'https://www.woolha.com/favicon/android-icon-192x192.png',
          previewImageUrl: 'https://www.woolha.com/favicon/android-icon-192x192.png',
        },
      ];

      return messages;
    });
};

const processTextMessage = (event) => {
  const { text } = event.message;
  console.log(`The message is ${text}`);

  // Here you may need to process the event based on the text content

  const replyForTextMessages = [
    {
      type: 'text',
      text: 'Here is the reply if you sent text',
    },
  ];

  return Promise.resolve(replyForTextMessages);
};

module.exports = (event) => {
  const messageType = event.message.type;

  if (messageType === 'image') {
    return processImageMessage(event);
  }

  return processTextMessage(event);
};