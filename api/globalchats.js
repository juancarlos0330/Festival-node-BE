// Load GlobalChat model
const GlobalChat = require("../models/GlobalChat");

const handleSaveGlobalChatHistory = async (msgData) => {
  const newGlobalChatHistory = new GlobalChat({
    user: msgData.id,
    message: msgData.message,
    created_date: new Date(),
  });

  const result = await new Promise((resolve, reject) => {
    newGlobalChatHistory
      .save()
      .then((globalChat) => {
        resolve({
          message: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        resolve({
          message: "error",
        });
      });
  });

  return result;
};

module.exports = handleSaveGlobalChatHistory;
