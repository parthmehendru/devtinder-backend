const express = require('express');
const app = express();

app.use("/hello", (req, res)=> {
    res.send('Hello!');
})

app.use("/test", (req, res)=> {
    res.send('Hello from the server!');
})

app.listen(7777, ()=> {
    console.log('server is listening on port 3000...');
});