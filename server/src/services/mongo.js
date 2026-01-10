require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true, // handles how mongo parses mongo url
    useFindAndModify: false, // disables the outdated way of updating mongo data
    useCreateIndex: true,
    useUnifiedTopology: true, // use the updated way of talking to clusters
  });
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
