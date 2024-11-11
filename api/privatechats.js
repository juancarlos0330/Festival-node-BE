// Load PrivateChat model
const PrivateChat = require("../models/PrivateChat");
// Load PrivatemessageStatus model
const PrivateMessageStatus = require("../models/PrivateMessageStatus");

const handleSavePrivateChatHistory = async (msgData) => {
  const newPrivateChatHistory = new PrivateChat({
    recipient: msgData.recipient,
    user: msgData.id,
    message: msgData.message,
    created_date: new Date(),
  });

  const result = await new Promise((resolve, reject) => {
    newPrivateChatHistory
      .save()
      .then((privatechat) => {
        PrivateMessageStatus.findOne({
          sender: msgData.id,
          recipient: msgData.recipient,
        }).then((msgStatus) => {
          if (msgStatus) {
            PrivateMessageStatus.findOneAndUpdate(
              { _id: msgStatus._id },
              {
                $set: {
                  unReadMessageCount: msgStatus.unReadMessageCount + 1,
                },
              },
              { new: true }
            ).then((messageStatus) => {
              resolve({
                message: "success",
              });
            });
          } else {
            const newPrivateUnReadMsgCount = new PrivateMessageStatus({
              sender: msgData.id,
              recipient: msgData.recipient,
              unReadMessageCount: 1,
            });

            newPrivateUnReadMsgCount
              .save()
              .then(() => {
                resolve({
                  message: "success",
                });
              })
              .catch((err) => {
                console.log(err);
                resolve({
                  message: "success",
                });
              });
          }
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

module.exports = handleSavePrivateChatHistory;
