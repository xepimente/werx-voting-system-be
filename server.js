const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


const port = process.env.PORT || 4005;


dotenv.config();

var corsOptions = {
  origin: ["http://localhost:3000","http://localhost:3002","https://werx-voting-administration.vercel.app", "https://werx-voting-system.vercel.app" ],
  credentials: true,
};

//middleswares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser())
app.use(bodyParser.json());



// middleware
app.use("/api/admin", require("./app/routes/adminRoutes"));
app.use("/api/voter", require("./app/routes/voterRoutes"));
app.use("/api/logo", require("./app/routes/logoRoute"));


// MongoDB connection
mongoose.connect(process.env.MONGO_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Handle MongoDB connection events
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('MongoDB connection successful!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});