// Load Festival model
const Festival = require("../models/Festival");

const handleGetFestivalList = async (msgData) => {
  const result = await new Promise((resolve, reject) => {
    Festival.find()
      .then((festivals) => {
        resolve({
          message: "success",
          result: festivals,
        });
      })
      .catch((err) => {
        resolve({
          message: "error",
          result: err,
        });
      });
  });

  return result;
};

module.exports = handleGetFestivalList;
