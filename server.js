const express = require('express');
const server = express();

server.all(`/`, (req, res) => {
    res.send(`The ENPC bot is online now`);;
});

function keepAlive() {
    server.listen(3000, () => {
        console.log(`24/7 Activation Complete`);
    });
}

module.exports = keepAlive;
