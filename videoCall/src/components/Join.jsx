// import { useState, useEffect, useContext } from "react"
// import "../assets/userPage.css"
// import { io } from 'socket.io-client'
// import { useNavigate } from 'react-router-dom';
// import { SocketContext } from '../Context/Socket'
import {
    useEffect,
    useState,
    useRef
} from "react";
import {
    io,
    Socket
} from "socket.io-client";
function Join() {


    const [userName, setUserName] = useState("");
    const [touserName, setToUserName] = useState("");
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStream = useRef(null);

    const localvideo = useRef(null);
    const remotevideo = useRef(null);

    const captureStream = async () => {
        localStream.current = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: 'always' },
            audio: false,
        });
        localvideo.current.srcObject = localStream.current;
        localvideo.current.onloadedmetadata = () => {
            localvideo.current.play();
        };
    }
    useEffect(() => {
        captureStream()
        return () => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);




    // this is for call purpoae
    const startCall = async () => {

        const peerConnectionConfig = {
            iceServers: [{
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
            }]
        };
        peerConnectionRef.current = new RTCPeerConnection(peerConnectionConfig);
        localStream.current.tagVideo = "screenShare"
        localStream.current.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, localStream.current));
        addTrackAndListner();
        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('New ICE candidate:', event.candidate);
               
            }
        };
        const offer = await createOffer();
        const data = {
            to: touserName,
            from: userName,
            offer: offer
        };
        console.log("offer create",data);
        socketRef.current.on('recieved:answer', handleAnswer)
        socketRef.current.emit('sending:offer', data);
        socketRef.current.on("iceCAnditate:recevie",async(data)=> {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        })
        // for icecanditate
        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('New ICE candidate:', event.candidate);
                const data = {
                    from: userName,
                    to: touserName,
                    candidate: event.candidate
                }
                socketRef.current.emit("iceCAnditate:sending", data )
               
            }
        };


    };

    const handleAnswer = async (answer) => {
        if (answer) {
            console.log("received answer", answer);
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    const createOffer = async () => {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
    };





    // this is for recevier part

    const offerHadler = async (message) => {
        console.log("offer received",message);

        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(new RTCSessionDescription(answer));
        const data = {
            to: message.from,
            from: userName,
            answer: answer,
        };
        console.log("sending answer", data);
        socketRef.current.emit('sending:answer', data);
    };



    const initializePeerConnection =  () => {
        const peerConnectionConfig = {
            iceServers: [{
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
            }]
        };
        peerConnectionRef.current = new RTCPeerConnection(peerConnectionConfig);
        socketRef.current.on("iceCAnditate:recevie",async(data)=> {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        })
        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('New ICE candidate:', event.candidate);
                const data = {
                    from: userName,
                    to: touserName,
                    candidate: event.candidate
                }
                socketRef.current.emit("iceCAnditate:sending", data )
               
            }
        };
        addTrackAndListner()

    };


    





    // this is for socket connection
    const userNameChanged = ($event) => {
        setUserName($event.target.value);
    };



    const toUserNameChanged = ($event) => {
        setToUserName($event.target.value);
    };

    const connectToCircuit = async () => {
        socketRef.current = io("http://localhost:8080");
        const data = {
            userName: userName
        };

        socketRef.current.emit('connection', data);

        socketRef.current.on('recieved:offer', (message) => {
            initializePeerConnection();
            offerHadler(message);
        });

    };



    const addTrackAndListner =  () => {

       

        peerConnectionRef.current.addEventListener('track', async (event) => {

            console.log(event)
            remotevideo.current.srcObject = event.streams[0];
            remotevideo.current.onloadedmetadata = () => {
                remotevideo.current.play();
            };
        });
    }
    return (
        <>
            <h1> {userName} </h1>
            <label htmlFor="UserName">Enter Username</label>
            <input name="UserName" type="text" onChange={userNameChanged} value={userName}></input>
            <button onClick={connectToCircuit}>Connect</button>
            < input type="text" onChange={toUserNameChanged} value={touserName}></input>
            <button onClick={startCall}> Call </button>
            <h1>remotevideo</h1>
            <video className="remotevideo" ref={remotevideo} type="video/mp4" ></video>
            <h1>localvideo</h1>
            <video className="localvideo" ref={localvideo} type="video/mp4" ></video>
        </>
    );



























    // const [userName, setUserName] = useState("")
    // const [selectedTab, setSelectedTab] = useState(true);
    // const { socket, setSocket } = useContext(SocketContext)
    // const navigate = useNavigate();


    // useEffect(() => {


    // }, [])

    // const setUserVAlueFunction = ($event) => {
    //     setUserName($event.target.value);
    // }

    // const switchSelectedTab = () => {
    //     console.log("helo" + selectedTab)
    //     setSelectedTab(!selectedTab);
    // }


    // return (
    //     <>




    //     </>
    // )
}
export default Join