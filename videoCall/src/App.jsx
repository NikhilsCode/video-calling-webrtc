import Layout from "./components/layout.jsx";
import Join from "./components/Join.jsx";
import "./assets/common.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketContext } from './Context/Socket.jsx'
import { useState } from "react"
function App() {
  const [socket, setSocket] = useState(null);

  return (
    <>

      <SocketContext.Provider value={{ socket, setSocket }}>
        <BrowserRouter>
          <Routes>
            <Route >
              <Route path="/" element={<Join />} />
              <Route path="/video" element={<Layout />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SocketContext.Provider>

    </>
  )
}

export default App
