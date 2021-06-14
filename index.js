const express = require("express");
const postRouter = require('./Route/postRoute');
const userRouter = require("./Route/userRoute");

const session = require("express-session");
const redis = require("redis");

let RedisStore = require("connect-redis")(session);

const mongoose = require("mongoose");
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, SESSION_SECRET, REDIS_URL, REDIS_PORT} = require("./config/config")

let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT,

});

const app = express();
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
mongoose
.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify : false})
.then( () => console.log("DB connected"))
.catch( (e) => { console.log(e)
    setTimeout(connectWithRetry, 5000)
});


}
connectWithRetry();

app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUnitialized: false,
        httpOnly: true,
        maxAge: 30000
    },
}))
app.use(express.json());


app.use("/api/posts", postRouter);
app.use("/api/users", userRouter);

//ggg
const PORT = process.env.PORT || 3000
app.get("/", (req, res) => {
    res.send("<H1> Docker Hub!!</H1>");
});

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));

