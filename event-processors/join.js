module.exports = (event) => {
  const messages = [
    {
      type: 'text',
      text: 'Hi, my name is chatbot. Finally I can join this channel',
    },
  ];

  return Promise.resolve(messages);
};