const MongoClient = require("mongodb").MongoClient;
const is_hosted = process.env.IS_HOSTED || false;

const hostedURI = "mongodb+srv://theMongoAdmin:accidentalLoginSteps@cluster0.6brbu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const localURI = "mongodb://127.0.0.1/?authSource=admin&retryWrites=true&w=majority";

const database = new MongoClient(is_hosted ? hostedURI : localURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

module.exports = database;
