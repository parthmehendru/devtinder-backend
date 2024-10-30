const express = require('express');
const connectDB = require("./config/database");
const User = require("./models/user");
const cookieParser = require('cookie-parser');
const app = express();


require('dotenv').config();


app.use(cookieParser());
app.use(express.json());

const authRouter = require('./routes/authRouter');
const profileRouter = require('./routes/profileRouter');
const requestRouter = require('./routes/requestRouter');
const userRouter = require('./routes/userRouter');
const deleteAccountRouter = require('./routes/deleteAccountRouter');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', deleteAccountRouter);

// app.use("/route", rh1, rh2, rh3, [rh4, rh5]);
// app.use("/user", (req, res, next)=> {
//     console.log("1");
//     next();
//     res.send("Response 1");
// }, (req, res)=> {
//     console.log('2');
//     res.send("Response 2");
// })

// we can also write in this way

// app.get("/user", (req, res, next)=> {
//     console.log("1");
//     res.send("Response 1");
//     next();
// })

// app.get("/user", (req, res)=> {
//     console.log("2");
//     res.send("Response 2");
// })


// app.use("/hello", (req, res)=> {
//     res.send('Hello!');
// })

// app.use("/test", (req, res)=> {
//     res.send('Hello from the server!');
// })

// app.use("/", (req, res)=> {
//     res.send('Hello loda!');
// })


// using regex also
// app.get(/.*fly$/, (req, res)=> {
//     res.send({firstname : "Parth", lastname: "Mehendru"});
// })


// app.get("/user", (req, res)=> {
//     console.log(req.query);
//     res.send({firstname : "Parth", lastname: "Mehendru", userid: req.query.userid});
// })

// app.get("/user/:userId/:name/:password", (req, res)=> {
//     console.log(req.params);
//     res.send({firstname : "Parth", lastname: "Mehendru", userid: req.params.userId});
// })


// app.post("/user", (req, res)=> {
//     console.log("save data to database");
//     res.send("Data successfully saved to the database")
// })

// app.get(/r/, (req, res)=> {
//     res.send({firstname : "Parth", lastname: "Mehendru"});
// })

// app.get("/ab?c", (req, res)=> {
//     res.send({firstname : "Parth", lastname: "Mehendru"});
// })

// app.get("/w(xy)?z", (req, res)=> {
//     res.send({firstname : "lund", lastname: "Mehendru"});
// })

// app.get("/w(xy)+z", (req, res)=> {
//     res.send({firstname : "Parth", lastname: "Mehendru"});
// })

// app.get("/de+f", (req, res)=> {
//     res.send({firstname : "Parth", lastname: "Mehendru"});
// })

// app.get("/gh*ij", (req, res)=> {
//     res.send({firstname : "Parth", lastname: "Mehendru"});
// })

// Handle Auth Middleware for all requests Get, post, etc
// app.use("/admin", adminAuth);
// app.use("/user", userAuth);

// app.post("/user/login", (req, res)=> {
//     res.send("user logged in");
// })


// app.get("/user/data", userAuth, (req, res) => {
//     res.send("User data sent");
// })

// app.get("/admin/getAllData", (req, res) => {
//     Logic of checking if the request is authorized
//     const token = req.body?.token;
    
//         res.send("All Data Sent");
    

// });

// app.get("/admin/deleteUser", (req, res) => {
   
//         res.send("Deleted a user");
// })

// app.get("/getUserData", (req, res) => {
    // Logic of DB call and get user data
    // try {
        //  throw new Error("jnjnjnj");
        // res.send("User Data Sent");
    // } catch(err) {
    //     res.status(500).send("SOme error contact support team");
    // }
// })


// app.use("/", (req, res) => {
//     res.send("lund");
// })
// app.use("/", (err, req, res, next) => {
//     if(err) {
//         res.status(500).send("something went wrong");
//     }
// });
// const customId = new mongoose.Types.ObjectId('603d2bdfb05b4a35a8d6e59c');

// app.get('/feed', async (req, res)=> {
//     try {
//         const users = await User.find({});
//         res.send(users);
//     } catch(err) {
//         res.status(400).send("Something went wrong");
//     }
// })

app.delete('/user', async (req, res)=> {
    const userId = req.body.userId;
    try {
        // const user = await User.findOneAndDelete({_id: userId});
        const user = await User.findByIdAndDelete(userId);
        res.send("User deleted successfully"); 
    } catch(err) {
        res.status(400).send("Something went wrong");
    }
})

connectDB()
    .then(()=> {
        console.log("Database connection established...")
        app.listen(7777, ()=> {
            console.log('server is listening on port 7777...');
        });
    })
    .catch(err => {
        console.error('Database cannot be connected!!!');
    });
