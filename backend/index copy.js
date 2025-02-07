import express from 'express';
import {
    createServer
} from 'node:http';
import {
    Server
} from 'socket.io';
import cors from "cors";
const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
    cors: {}
});
const user = {}
io.on('connection', (socket) => {
    socket.on('connection', data => {
        user[data.userName] = socket.id;
        console.log('User Register', user)
    }) socket.on("sending:offer", data => {
        const to = user[data.to];
        io.to(to).emit('recieved:offer', data);
        console.log(data);
    }) socket.on("sending:answer", data => {
        const to = user[data.to];
        io.to(to).emit('recieved:answer', data.answer);
        console.log(data);
    }) socket.on("IceCanditate", data => {
        console.log(data);
    }) console.log('a user connected');
});
server.listen(8080, () => {
    console.log('server running at http://localhost:8080');
});