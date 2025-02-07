// What webrtc needs.
// where are you   we need extact location of other peer
// we solve this porblem using stun server(stun used to be simple traversal of UDP through NAT server)(now stun is session traversal Utilities of NAT) (this is server help to identify the server location basically using socket io)
// using stun to know how to get to me (getting our address)
// what are you sending

// after connection we establish a track (video sharing and data sharing pipe line from one peer to other)
// after that we will create a offer
// RTC session description 
// Structure of RTCSessionDescription
// ---Type
// ---SDP sessionDescriptionPotocal



// webrtc is peer to peer connection working on udp (it not relaiable as tcp http is made over tcp)
import express from "express";
import http from "http";
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {}
});
const user = {}

const port = process.env.PORT || 8080;


io.on('connection', (socket) => {
  console.log('user connected');
  socket.on('connection', data => {
    user[data.userName] = socket.id;
    console.log('User Register', user)
  });

  socket.on("sending:offer", data => {
    const to = user[data.to];
    io.to(to).emit('recieved:offer', data);
    console.log(data);
  });

  socket.on("sending:answer", data => {
    const to = user[data.to];
    io.to(to).emit('recieved:answer', data.answer);
    console.log(data);
  });

  socket.on("iceCAnditate:sending", data => {
    const to = user[data.to];
    io.to(to).emit('iceCAnditate:recevie', data);
  });

  socket.on('disconnect', function () {
    
    console.log('user disconnected');
  });

  socket.on("peer:negotiation", data => {
    const to = user[data.to];
    io.to(to).emit('peer:negotiationrecieve', data);
   
  });
  socket.on("peer:negotiation:reply", data => {
    const to = user[data.to];
    io.to(to).emit('peer:negotiation:replyreceived', data);
   
  });
})

server.listen(port, function () {
  console.log(`Listening on port ${port}`);
});