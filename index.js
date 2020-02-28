const express = require("express");
require("dotenv").config();
const passport = require("passport");
const mongooseConnection = require("./src/db/mongoose");
var bodyParser = require("body-parser");
var cors = require("cors");
const path = require("path");
const listEndpoints = require("express-list-endpoints");

const userRouter = require("./src/route/user");
const experienceRouter = require("./src/route/experience");
const authRouter = require("./src/route/auth");

const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

const port = process.env.PORT;
mongooseConnection();

app.use(bodyParser.json());

app.use(passport.initialize());

var whitelist = [
  "http://localhost:3000",
  "https://faizanbardai.github.io",
  "https://fayju-portfolio-linkedin.azurewebsites.net"
];
var corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};
app.use(cors(corsOptions));

app.get("/", (req, res) => res.send("FayJu - LinkedIn Portfolio Project"));

const chat = io.of("/chat");
chat.on("connection", socket => {
  console.log("someone entered chatroom");
  socket.on("disconnect", function() {
    console.log("someone left chatroom");
  });
});

app.use("/images", express.static(path.join(__dirname, "./src/images")));
app.use("/user", userRouter);
app.use("/experience", experienceRouter);
app.use("/auth", authRouter);

console.log(listEndpoints(app));
http.listen(port, () => console.log(`Your app is listening on port ${port}!`));
