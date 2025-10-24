const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require("./config/db");
const cors = require('cors');
const path = require("path");

dotenv.config({path: './config/config.env'});
const app = express();

// Query parser for able express to handle with complex query parameter by call lib qs
app.set('query parser', 'extended');

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

app.use(cors());

connectDB();

// Route files
const auth = require("./routes/auth");
const message = require("./routes/message.js");

// Mount routers
app.use("/api/auth", auth);
app.use("/api/messages", message);

// Use || 5000 for running in window
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(
        `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
});

process.on("unhandledRejection", (err, promise) => {
    console.log(`Unhandled Rejection at: ${promise}, reason: ${err}`);
    server.close(() => process.exit(1));
});