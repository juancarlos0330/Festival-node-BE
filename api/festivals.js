const express = require("express");
const fs = require("fs");
const router = express.Router();

// Load Festival model
const Festival = require("../models/Festival");
const FestivalJoinStatus = require("../models/FestivalJoinStatus");

router.get("/getFestivalData", (req, res) => {
  Festival.find()
    .then(async (festivals) => {
      res.json(festivals);
    })
    .catch((err) => {
      res.status(400).json({ msg: err });
    });
});

router.post("/addFestivalData", (req, res) => {
  const base64Image = req.body.imageUrl.split(";base64,").pop();
  const filename = `${Date.now()}.png`;

  fs.writeFile(
    __dirname + "\\..\\upload\\festival\\" + filename,
    base64Image,
    { encoding: "base64" },
    function (err) {
      if (err) {
        console.log("Error saving image:", err);
        return res.status(400).json(errors); // Internal Server Error
      }

      const newFestival = new Festival({
        title: req.body.title,
        location: req.body.location,
        imageUrl: filename,
        description: req.body.description,
        beginDate: new Date(req.body.beginDate),
        endDate: new Date(req.body.endDate),
      });

      newFestival
        .save()
        .then((festival) => {
          res.json(festival);
        })
        .catch((err) => {
          res.status(400).json({ msg: err });
        });
    }
  );
});

router.post("/getStatus", (req, res) => {
  FestivalJoinStatus.find({ festival: req.body.festivalId })
    .then((festivalStatus) => {
      res.json(festivalStatus);
    })
    .catch((err) => {
      res.status(400).json({ msg: err });
    });
});

router.post("/addStatus", (req, res) => {
  FestivalJoinStatus.findOne({
    festival: req.body.festivalId,
    user: req.body.userId,
  })
    .then((festivalStatus) => {
      if (festivalStatus) {
        const updateFestivalJoinStatusField = {
          status: req.body.status,
          created_at: new Date(),
        };
        FestivalJoinStatus.findOneAndUpdate(
          { _id: festivalStatus._id },
          { $set: updateFestivalJoinStatusField },
          { new: true }
        )
          .then((updateFestivalStatus) => {
            res.json({ status: "ok" });
          })
          .catch((err) => {
            res.status(400).json({ msg: err });
          });
      } else {
        const newFestivalJoinStatus = new FestivalJoinStatus({
          festival: req.body.festivalId,
          user: req.body.userId,
          status: req.body.status,
        });

        newFestivalJoinStatus
          .save()
          .then((newFestivalStatus) => {
            res.json({ status: "ok" });
          })
          .catch((err) => {
            res.status(400).json({ msg: err });
          });
      }
    })
    .catch((err) => {
      res.status(400).json({
        msg: err,
      });
    });
});

module.exports = router;
