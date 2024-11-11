const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const socketIo = require("socket.io");
const http = require("http");
const app = express();
const bcrypt = require("bcryptjs");

require("dotenv/config");

// api route
const users = require("./api/users");
const chats = require("./api/chats");
const festivals = require("./api/festivals");

// Import Festival Model
const Festival = require("./models/Festival");
// Import User Model
const User = require("./models/User");

// function for socket
const handleSaveGlobalChatHistory = require("./api/globalchats");
const {
  handleSaveGroupChatHistory,
  handleGetUsers,
} = require("./api/groupchats");
const handleSavePrivateChatHistory = require("./api/privatechats");
const handleGetFestivalList = require("./api/festivalList");

// import festival initial list as json
const festivalInitialList = require("./api/festivals.json");
const isEmpty = require("./validation/is-empty");

const server = http.createServer(app);
const io = socketIo(server, {
  path: "/socket.io",
  cors: {
    origin: "*",
  },
});

// Set cors
app.use(
  cors({
    origin: "*",
  })
);

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static("upload"));

// DB Config
const db = require("./config/keys").mongoURI;

// socket section
let userLists = [];
let groupLists = {};
let socketLists = [];
let totalMsgNum = 0;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(async () => {
    console.log("MongoDB Connecting...");

    await User.findOne({ email: "admin@admin.com" }).then(async (user) => {
      if (user) {
      } else {
        const newUser = new User({
          username: "administrator",
          email: "admin@admin.com",
          avatar: "admin.jpg",
          password: "123456",
        });

        await bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save();
          });
        });
      }
    });

    await Festival.find().then(async (festivals) => {
      if (isEmpty(festivals)) {
        await festivalInitialList.map(async (item) => {
          const newFestival = new Festival({
            title: item.title,
            location: item.location,
            imageUrl: item.imageUrl,
            description: item.description,
            beginDate: item.beginDate,
            endDate: item.endDate,
          });

          await newFestival
            .save()
            .then((festival) => {
              const groupID = festival.id;
              groupLists[groupID] = [];
              console.log(groupID);
            })
            .catch((err) => {
              console.log("Error saving festival item: ", err);
            });
        });
      }

      console.log("MongoDB Connected");
    });
  })
  .catch((err) => console.log("MongoDB connection Err: ", err));

app.use("/api/users", users);
app.use("/api/chats", chats);
app.use("/api/festivals", festivals);

const port = process.env.PORT || require("./config/keys").port;

app.get("/", (req, res) => {
  res.json({ msg: `Server is running on ${port} for Festival app.` });
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("addNewFestivalToGroupList", (newFestival) => {
    const groupID = newFestival.newFestival._id;
    groupLists[groupID] = [];

    socketLists.map((socketItem) => {
      groupLists[groupID].push({
        socketID: socketItem,
      });
    });

    totalMsgNum++;
    socket.broadcast.emit("updateAddedFestival", { totalMsgNum });
  });

  socket.on("userRegistered", () => {
    totalMsgNum++;
    socket.broadcast.emit("updateRegisteredUser", { totalMsgNum });
  });

  socket.on("userconnected", (userData) => {
    console.log("userconnected");
    if (socketLists.indexOf(socket.id) < 0) {
      socketLists.push(socket.id);

      const socketUser = {
        user: userData,
        socketID: socket.id,
        socket,
      };

      const groupDatas = Object.entries(groupLists);

      for (let [groupID, groups] of groupDatas) {
        groupLists[groupID].push(socketUser);
      }

      userLists.push({
        user: userData.id,
        socketID: socket.id,
        socket,
      });
    }
  });

  socket.on("sendMessageToPrivate", async (msgData) => {
    const data = await handleSavePrivateChatHistory(msgData);
    if (data.message === "success") {
      totalMsgNum++;
      userLists.map((item) => {
        if (item.user === msgData.recipient) {
          socket
            .to(item.socketID)
            .emit("receiveMessageToPrivate", { ...msgData, totalMsgNum });
        }
      });
    }
  });

  socket.on("sendMessageToGroup", async (msgData) => {
    const usersForGroup = await handleGetUsers();
    if (usersForGroup.message === "success") {
      const data = await handleSaveGroupChatHistory(
        msgData,
        usersForGroup.users
      );
      totalMsgNum++;
      if (data.message === "success") {
        groupLists[msgData.festival].map((item) => {
          socket.to(item.socketID).emit("receiveMessageToGroup", {
            ...msgData,
            totalMsgNum,
          });
        });
      }
    }
  });

  socket.on("message", async (msgData) => {
    const data = await handleSaveGlobalChatHistory(msgData);
    if (data.message === "success") {
      socket.broadcast.emit("updateMessages", msgData);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A User disconnected");
    socketLists = socketLists.filter((item) => item !== socket.id);

    const groupDatas = Object.entries(groupLists);
    for (let [groupID, groups] of groupDatas) {
      groupLists[groupID] = groupLists[groupID].filter(
        (group) => group.socketID !== socket.id
      );
    }

    userLists = userLists.filter((userlist) => userlist.socketID !== socket.id);
  });
});

// end

server.listen(port, () => console.log(`Server running on port ${port}`));
