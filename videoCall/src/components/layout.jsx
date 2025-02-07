import{ useState,useEffect, useContext, useRef } from 'react';
import { SocketContext } from '../Context/Socket'

function App() {
  const [isNewLayout, setIsNewLayout] = useState(false);
  const { socket, setSocket } = useContext(SocketContext);

  const videoRef = useRef(null);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    } catch (err) {
      console.error('Error: ' + err);
    }
  };
  useEffect(() => {
    makeCall()

  }, [])


  async function makeCall() {
    const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    const peerConnection = new RTCPeerConnection(configuration);
    socket.on('message', async message => {
        if (message.answer) {
            const remoteDesc = new RTCSessionDescription(message.answer);
            await peerConnection.setRemoteDescription(remoteDesc);
        }
    });
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer',{'offer': offer});
}

socket.on('message', async message => {
  if (message.offer) {
    const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
      const peerConnection = new RTCPeerConnection(configuration);
        peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer',{'answer': answer});
    }
});

peerConnection.addEventListener('icecandidate', event => {
  if (event.candidate) {
      socket.emit('new-ice-candidate',{'new-ice-candidate': event.candidate});
  }
});

// Listen for remote ICE candidates and add them to the local RTCPeerConnection
socket.on('message', async message => {
  if (message.iceCandidate) {
      try {
          await peerConnection.addIceCandidate(message.iceCandidate);
      } catch (e) {
          console.error('Error adding received ice candidate', e);
      }
  }
});
peerConnection.addEventListener('connectionstatechange', event => {
  if (peerConnection.connectionState === 'connected') {
      // Peers connected!
  }
});



  const changeLayout = () => {
    setIsNewLayout(!isNewLayout);
  }

  return (
    <>
      <section className={`grid-container ${isNewLayout ? 'new-layout' : ''}`}>
        <section className="sharingScreen">
          
          <video className="videoScreen"   ref={videoRef} type="video/mp4" ></video>

          
          <div className="expand">
            <button className="expandButton" onClick={changeLayout}>
              <i className="bi bi-fullscreen"></i>
            </button>
          </div>
          <div className="buttonDiv">
          <button className="shareScrren"  onClick={startCapture}><i className="bi bi-share"></i></button>
            <button className="end"><i className="bi bi-telephone-minus-fill"></i></button>
            <button className="more"><i className="bi bi-three-dots"></i></button>
          </div>
        </section>
        <section className={`thereVideoContainer ${isNewLayout ? 'minimized' : ''}`}>
          <div className="thereVideo">
             <video controls  src="public/video.mp4" type="video/mp4" ></video>
             
            </div>
        </section>
        <section className={`ourVideoContainer ${isNewLayout ? 'minimized' : ''}`}>
          <div className="ourVideo">    
          <video controls src="public/video.mp4" type="video/mp4"></video>
          </div>
        </section>
      </section>
    </>
  );
}

export default App;