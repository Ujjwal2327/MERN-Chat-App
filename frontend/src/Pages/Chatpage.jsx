import { Box } from "@chakra-ui/react";
import SideDrawer from "../Components/Miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import MyChats from "../Components/MyChats";
import ChatBox from "../Components/ChatBox";
import { useEffect, useState } from "react";

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, notifications } = ChatState();

  useEffect(() => {
    console.log("notification", notifications);
  })

  return (
    <div style={{ width: "100%", height:"100%"}}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="89.5vh"
        p="10px"
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default ChatPage;
