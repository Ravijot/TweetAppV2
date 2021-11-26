const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const flash = require("connect-flash");
const { isLoggedIn } = require("./middleware");
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const Chat = require('./models/chat')
const multer = require('multer')
const port = process.env.PORT || 5000;
mongoose
  .connect("mongodb://localhost:27017/twitter-clone", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB Connected"))
  .catch(() => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profileRoutes");
const chatRoutes = require("./routes/chatRoute");
const uploadRoutes = require("./routes/uploadRoutes");
// APIs

const postApiRoute = require("./routes/api/posts");
const { json } = require("express");

app.use(
  session({
    secret: "weneedasomebettersecret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.get("/", isLoggedIn, (req, res) => {
  
  res.render("home");
});
app.get("/user",isLoggedIn,(req,res) => {
  const payload = {
    user: req.user,
    userid: req.user._id.toString(),
  };
  //console.log(payload.userid)
  res.json(payload)
})
// Routes
app.use(authRoutes);
app.use(profileRoutes);
app.use(chatRoutes);
app.use(uploadRoutes);
// APIs

app.use(postApiRoute);

io.on("connection", (socket) => {
  console.log("Connection Established");

  socket.on("send-msg", async (data) => {
    io.emit("recived-msg", {
      user: data.user,
      msg: data.msg,
      createdAt: new Date(),
    });

    await Chat.create({ content: data.msg, user: data.user });
  });
});

server.listen(port, () => {
  console.log("Server running at port 5000");
});
