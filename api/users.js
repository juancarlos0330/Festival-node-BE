const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

// Load Input Validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

// Load User model
const User = require("../models/User");

// Register user
router.post("/reg", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ username: req.body.username }).then((nameUser) => {
    if (nameUser) {
      errors.username = "Username already exists";
      return res.status(400).json(errors);
    } else {
      User.findOne({ email: req.body.email }).then((user) => {
        if (user) {
          errors.email = "Email already exists";
          return res.status(400).json(errors);
        } else {
          const base64Image = req.body.image.split(";base64,").pop();
          const filename = `${Date.now()}.png`;

          fs.writeFile(
            __dirname + "\\..\\upload\\user\\" + filename,
            base64Image,
            { encoding: "base64" },
            function (err) {
              if (err) {
                console.log("Error saving image:", err);
                return res.status(400).json(errors); // Internal Server Error
              }

              const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                avatar: filename,
                password: req.body.password,
              });

              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err;
                  newUser.password = hash;
                  newUser
                    .save()
                    .then((user) => {
                      const payload = {
                        id: user.id,
                        username: user.username,
                        avatar: user.avatar,
                        email: user.email,
                      };

                      jwt.sign(
                        payload,
                        keys.secretOrKey,
                        { expiresIn: 3600 },
                        (err, token) => {
                          res.json({
                            token: "Bearer " + token,
                          });
                        }
                      );
                    })
                    .catch((err) => console.log(err));
                });
              });
            }
          );
        }
      });
    }
  });
});

router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then((user) => {
    if (!user) {
      errors.email = "User not found";
      return res.status(400).json(errors);
    }

    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User Matched
        const payload = {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          email: user.email,
        };

        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              token: "Bearer " + token,
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

router.get("/getUsers", (req, res) => {
  User.find()
    .then(async (users) => {
      const userList = users.map((user) => {
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          created_at: user.created_at,
        };
      });
      res.json(userList);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/checkUser", (req, res) => {
  User.findOne({ _id: req.body.id }).then((user) => {
    if (user) {
      res.json({ message: "success" });
    } else {
      res.json({ message: "error" });
    }
  });
});

module.exports = router;
