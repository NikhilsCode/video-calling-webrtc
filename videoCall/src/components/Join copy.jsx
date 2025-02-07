import {
    useEffect,
    useState,
    useRef
} from "react";
import {
    io
} from "socket.io-client";

function App() {
    const [userName, setUserName] = useState("");
    const [touserName, setToUserName] = useState("");
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);
    useEffect(() => {
        return () => {
            // Cleanup functions for peerConnection and socket 
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);
    // Empty dependency array means this effect runs only once after mount
    const startCall = async () => {
        peerConnectionRef.current.onicecandidate = async (event) => {
            if (event.candidate) {
                socketRef.current.emit('IceCanditate', event.candidate);
            }
        }
        socketRef.current.on('recieved:answer', async (answer) => {
            if (answer) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });
        const offer = await createOffer();
        const localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        localStream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, localStream));
        const data = {
            to: touserName,
            from: userName,
            offer: offer
        };
        socketRef.current.emit('sending:offer', data);
    };
    const userNameChanged = ($event) => {
        setUserName($event.target.value);
    };
    const toUserNameChanged = ($event) => {
        setToUserName($event.target.value);
    };
    const createOffer = async () => {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
    };
    const createAnser = async () => {
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(new RTCSessionDescription(answer));
        return answer;
    };
    const setOffer = async (message) => {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await createAnser();
        // Ensure await here
        const data = {
            to: message.from,
            from: userName,
            answer: answer,
        };
        socketRef.current.emit('sending:answer', data);
    };
    const initializePeerConnection = () => {
        const peerConnectionConfig = {
            iceServers: [{
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
            }]
        };
        peerConnectionRef.current = new RTCPeerConnection(peerConnectionConfig);
        peerConnectionRef.current.ontrack = event => {
            if (remoteVideo.srcObject !== event.streams[0]) {
                console.log(event.streams[0])
            }
        };
        socketRef.current.on('recieved:offer', (message) => {
            peerConnectionRef.current.onicecandidate = async (event) => {
                if (event.candidate) {
                    socketRef.current.emit('IceCanditate', event.candidate);
                }
            }
            setOffer(message);
        });
    };
    const connectToCircuit = () => {
        socketRef.current = io("http://localhost:8080");
        // Update socket state
        const data = {
            userName: userName
        };
        socketRef.current.emit('connection', data);
        initializePeerConnection();
    };
    return (
        <>
            <h1> {userName} </h1>
            <label htmlFor="UserName">Enter Username</label>
            <input name="UserName" type="text" onChange={userNameChanged} value={userName}></input>
            <button onClick={connectToCircuit}>Connect</button>
            < input type="text" onChange={toUserNameChanged} value={touserName}></input>
            <button onClick={startCall}> Call </button>
        </>
    );
}
export default App;









































import { useState, useEffect, useContext } from "react"
import "../assets/userPage.css"
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../Context/Socket'

function Join() {
    const [userName, setUserName] = useState("Nikhil savant");
    const [roomId, setRoomId] = useState("Room123");
    const [roomKey, setRoomKey] = useState("nikhil@2788120");
    const [selectedTab, setSelectedTab] = useState(true);
    const { socket, setSocket } = useContext(SocketContext)
    const navigate = useNavigate();


    useEffect(() => {
      

    }, [])

    const setUserVAlueFunction = ($event) => {
        setUserName($event.target.value);
    }
    const setRoomIdVAlueFunction = ($event) => {
        setRoomId($event.target.value);
    }
    const setRoomKeyVAlueFunction = ($event) => {
        setRoomKey($event.target.value);
    }
    const switchSelectedTab = () => {
        console.log("helo" + selectedTab)
        setSelectedTab(!selectedTab);
    }
    const joinRoom = () => {
        const socketInstance = io("localhost:8080");
        setSocket(socketInstance)
        const data = {
            userName: userName,
            roomId: roomId,
            roomKey: roomKey
        }
        socketInstance.emit("join-room", data)
        navigate('/video')
    }
    const createRoom = () => {
        const socketInstance = io("localhost:8080");
        setSocket(socketInstance)
        const data = {
            userName: userName,
            roomId: roomId,
            roomKey: roomKey
        }
        socketInstance.emit("create-room", data)
        navigate('/video')
    }
    return (
        <>

            <section className="userPage">
                {/* join Room */}

                <div className={` ${selectedTab ? '' : 'displatNone'}`}>
                    <div className="tabs">
                        <button className={`tabButton ${selectedTab ? 'cuurentTab' : ''}`} onClick={switchSelectedTab}>Join Room</button>
                        <button className={`tabButton ${selectedTab ? '' : 'cuurentTab'}`} onClick={switchSelectedTab}>Create Room</button>

                    </div>
                    <div className="joinRoom">
                        <h1>Join Room</h1>
                        <div className="inputDiv">

                            <label className="inputLabel" htmlFor="UserName">User Name :</label>
                            <input className="input" type="text" name="UserName" onChange={setUserVAlueFunction} value={userName} />
                        </div>
                        <div className="inputDiv">

                            <label className="inputLabel" htmlFor="Roomid">Room Id :</label>
                            <input className="input" type="text" name="Roomid" onChange={setRoomIdVAlueFunction} value={roomId} />
                        </div>
                        <div className="inputDiv">

                            <label className="inputLabel" htmlFor="UserName">Room Key :</label>
                            <input className="input" type="text" name="UserName" onChange={setRoomKeyVAlueFunction} value={roomKey} />
                        </div>
                        <button className="secondaryButton" onClick={joinRoom}>Join</button>
                    </div>
                </div>

                {/* Create Room */}

                <div className={` ${selectedTab ? 'displatNone' : ''}`}>
                    <div className="tabs">
                        <button className={`tabButton ${selectedTab ? 'cuurentTab' : ''}`} onClick={switchSelectedTab}>Join Room</button>
                        <button className={`tabButton ${selectedTab ? '' : 'cuurentTab'}`} onClick={switchSelectedTab}>Create Room</button>

                    </div>
                    <div className="createRoom">
                        <h1>Create Room</h1>
                        <div className="inputDiv">

                            <label className="inputLabel" htmlFor="UserName">User Name :</label>
                            <input className="input" type="text" name="UserName" onChange={setUserVAlueFunction} value={userName} />
                        </div>
                        <div className="inputDiv">

                            <label className="inputLabel" htmlFor="Roomid">Room Id :</label>
                            <input className="input" type="text" name="Roomid" onChange={setRoomIdVAlueFunction} value={roomId} />
                        </div>
                        <div className="inputDiv">

                            <label className="inputLabel" htmlFor="UserName">Room Key :</label>
                            <input className="input" type="text" name="UserName" onChange={setRoomKeyVAlueFunction} value={roomKey} />
                        </div>
                        <button className="secondaryButton" onClick={createRoom} >Create</button>
                    </div>
                </div>
            </section>


        </>
    )
}
export default Join