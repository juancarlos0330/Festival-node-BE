const express = require("express");
const router = express.Router();
// validation
const isEmpty = require("../validation/is-empty");

// Load GlobalChat model
const GlobalChat = require("../models/GlobalChat");
// Load GroupChat model
const GroupChat = require("../models/GroupChat");
// Load PrivateChat Model
const PrivateChat = require("../models/PrivateChat");
// Load MessageStatus Model
const MessageStatus = require("../models/MessageStatus");
// Load PrivateMessageStatus Model
const PrivateMessageStatus = require("../models/PrivateMessageStatus");

router.post("/getGlobalChatData", async (req, res) => {
  try {
    const totalCount = await GlobalChat.countDocuments();

    GlobalChat.find()
      .populate("user")
      .sort({ created_date: -1 })
      .skip(req.body.pageCount - 20)
      .limit(20)
      .then(async (chats) => {
        res.json({
          totalCount: totalCount,
          results: chats,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
});

router.post("/getGroupChatData", async (req, res) => {
  try {
    const totalCount = await GroupChat.find({
      festival: req.body.festivalID,
    }).countDocuments();

    GroupChat.find({ festival: req.body.festivalID })
      .populate("user")
      .sort({ created_date: -1 })
      .skip(req.body.pageCount - 20)
      .limit(20)
      .then(async (chats) => {
        res.json({
          totalCount: totalCount,
          results: chats,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
});

router.post("/getPrivateChatData", async (req, res) => {
  try {
    const totalCount = await PrivateChat.find({
      $or: [
        {
          recipient: req.body.recipient,
          user: req.body.user,
        },
        {
          recipient: req.body.user,
          user: req.body.recipient,
        },
      ],
    }).countDocuments();

    PrivateChat.find({
      $or: [
        {
          recipient: req.body.recipient,
          user: req.body.user,
        },
        {
          recipient: req.body.user,
          user: req.body.recipient,
        },
      ],
    })
      .populate("user")
      .populate("recipient")
      .sort({ created_date: -1 })
      .skip(req.body.pageCount - 20)
      .limit(20)
      .then(async (chats) => {
        res.json({
          totalCount: totalCount,
          results: chats,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
});

router.post("/savePrivateUnReadMessageCount", async (req, res) => {
  try {
    PrivateMessageStatus.findOne({
      recipient: req.body.sender,
      sender: req.body.recipient,
    }).then((msgStatus) => {
      if (!isEmpty(msgStatus)) {
        PrivateMessageStatus.findOneAndUpdate(
          { _id: msgStatus._id },
          {
            $set: {
              unReadMessageCount: req.body.unReadMessageCount,
            },
          },
          { new: true }
        ).then((messageStatus) => {
          res.json({
            message: "success",
          });
        });
      } else {
        const newPrivateUnReadMsgCount = new PrivateMessageStatus({
          sender: req.body.recipient,
          recipient: req.body.sender,
          unReadMessageCount: req.body.unReadMessageCount,
        });

        newPrivateUnReadMsgCount
          .save()
          .then(() => {
            res.json({
              message: "success",
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/saveUnReadMessageCount", async (req, res) => {
  try {
    MessageStatus.findOne({ festival: req.body.festival }).then((msgStatus) => {
      if (msgStatus) {
        if (
          msgStatus.unReadUsers.filter((unReadUser) => {
            return String(unReadUser.user) === req.body.user;
          }).length === 0
        ) {
          const newUnreadUser = {
            user: req.body.user,
            unReadCount: req.body.unReadMessageCount,
          };
          msgStatus.unReadUsers.unshift(newUnreadUser);

          msgStatus
            .save()
            .then(() => {
              res.json({
                message: "success",
              });
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          const updateIndex = msgStatus.unReadUsers
            .map((userItem) => {
              return String(userItem.user);
            })
            .indexOf(req.body.user);
          msgStatus.unReadUsers[[updateIndex]] = {
            user: req.body.user,
            unReadCount: req.body.unReadMessageCount,
          };

          msgStatus
            .save()
            .then(() => {
              res.json({
                message: "success",
              });
            })
            .catch((err) => {
              console.log(err);
            });
        }
      } else {
        const newMessageStatus = new MessageStatus({
          festival: req.body.festival,
          unReadUsers: [
            {
              user: req.body.user,
              unReadCount: req.body.unReadMessageCount,
            },
          ],
        });

        newMessageStatus
          .save()
          .then(() => {
            res.json({
              message: "success",
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/getUnReadMessageList", async (req, res) => {
  try {
    MessageStatus.find()
      .then((messageList) => {
        res.json(messageList);
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
});

router.post("/getPrivateUnReadMessageList", async (req, res) => {
  try {
    PrivateMessageStatus.find({ recipient: req.body.recipient })
      .then((messageList) => {
        res.json(messageList);
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
