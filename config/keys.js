const mongoURI = process.env.MONGO_URI;

module.exports = {
  mongoURI,
  secretOrKey: "secret",
  port: 5000,
};
