import "./App.css";
import { Route, Routes } from "react-router-dom";
import HomePage from "./Pages/Homepage";
import ChatPage from "./Pages/Chatpage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;
