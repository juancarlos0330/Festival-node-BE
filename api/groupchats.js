// Load GlobalChat model
const GroupChat = require("../models/GroupChat");
// Load MessageStatus Model
const MessageStatus = require("../models/MessageStatus");
// Load User Model
const User = require("../models/User");

const handleGetUsers = async () => {
  const result = await new Promise((resolve, reject) => {
    User.find()
      .then(async (users) => {
        resolve({
          message: "success",
          users,
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

const handleSaveGroupChatHistory = async (msgData, userDatas) => {
  const newGroupChatHistory = new GroupChat({
    festival: msgData.festival,
    user: msgData.id,
    message: msgData.message,
    created_date: new Date(),
  });

  const result = await new Promise((resolve, reject) => {
    newGroupChatHistory
      .save()
      .then((groupchat) => {
        MessageStatus.findOne({ festival: msgData.festival })
          .then((msgStatus) => {
            if (msgStatus) {
              userDatas
                .filter((filterUser) => filterUser.id !== msgData.id)
                .map((user) => {
                  if (
                    msgStatus.unReadUsers.filter((unReadUser) => {
                      return String(unReadUser.user) === user.id;
                    }).length === 0
                  ) {
                    const newUnreadUser = {
                      user: user.id,
                      unReadCount: 1,
                    };
                    msgStatus.unReadUsers.unshift(newUnreadUser);
                  } else {
                    const updateIndex = msgStatus.unReadUsers
                      .map((userItem) => {
                        return String(userItem.user);
                      })
                      .indexOf(user.id);
                    msgStatus.unReadUsers[updateIndex] = {
                      user: user.id,
                      unReadCount:
                        msgStatus.unReadUsers[updateIndex].unReadCount + 1,
                    };
                  }
                });

              msgStatus
                .save()
                .then(() => {
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
            } else {
              const newMessageStatus = new MessageStatus({
                festival: msgData.festival,
                unReadUsers: userDatas
                  .filter((filterUser) => filterUser.id !== msgData.id)
                  .map((user) => {
                    return {
                      user: user.id,
                      unReadCount: 1,
                    };
                  }),
              });

              newMessageStatus.save().then(() => {
                resolve({
                  message: "success",
                });
              });
            }
          })
          .catch((err) => {
            console.log(err);
            resolve({
              message: "error",
            });
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

module.exports = { handleSaveGroupChatHistory, handleGetUsers };
