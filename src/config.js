exports.config = {
  db: "data/database.sqlite",
  birthdayRemindDays: 7,
  timezone: "Europe/Moscow", // never change this
  gpt: {
    enabled: true,
    allowedChats: [-1001278382802, -1001799649218],
    historyLength: 200,
    completionParams: {
      // https://platform.openai.com/docs/api-reference/chat/create
      model: 'gpt-4',
      // model: "gpt-3.5-turbo-0125",
      temperature: 1,
      top_p: 1 
    }
  }
};
