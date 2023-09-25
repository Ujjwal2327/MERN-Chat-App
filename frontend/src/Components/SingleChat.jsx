import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./Miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./Miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import Lottie from "lottie-react";
import typingAnimation from "../Animations/typing.json";

// socket.io
import io from "socket.io-client";
const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const {
    user,
    selectedChat,
    setSelectedChat,
    notifications,
    setNotifications,
  } = ChatState();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const toast = useToast();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: typingAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, [user]);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat; // to have a backup of selectedChat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        // give notifications
        if (!notifications.find((mag) => mag._id === newMessageRecieved._id)) {
          setNotifications([newMessageRecieved, ...notifications]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  }); // will run every time if any state updates

  const fetchMessages = async () => {
    if (!selectedChat) return;

    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      // console.log("messages- ", messages);
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id); // join the chat room
    } catch (err) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the message",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const sendMessage = async (event) => {
    socket.emit("stop typing", selectedChat._id);

    if (newMessage.trim() === "") {
      setNewMessage("");
      return;
    }

    // event.target.blur()
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/message",
        { content: newMessage, chatId: selectedChat._id },
        config
      );

      console.log("data", data);
      setFetchAgain(!fetchAgain);

      socket.emit("new message", data);

      setMessages([...messages, data]);
      setNewMessage(""); // setFunc is async so will not effect in api call
    } catch (err) {
      toast({
        title: "Error Occured!",
        description: "Failed to send the message",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
    }
    console.log("e", (event.target.onblur = true));
  };

  const typingHandler = async (event) => {
    setNewMessage(event.target.value);
    console.log(event.target.value);

    // typing indicator logic
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      await socket.emit("typing", selectedChat._id);
    }

    var lastTypingTiming = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var currentTime = new Date().getTime();
      var timeDiff = currentTime - lastTypingTiming;

      if (timeDiff > timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
        console.log(timeDiff);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", lg: "30px" }}
            pb="3"
            px="2"
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="cneter"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            <>
              {selectedChat.isGroupChat ? (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessages={fetchMessages}
                  />
                </>
              ) : (
                <>
                  {getSender(user, selectedChat.users).toUpperCase()}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              )}
            </>
          </Text>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p="3"
            bg="#e8e8e8"
            h="100%"
            w="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                h="20"
                w="20"
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <Box
                className="messages"
                display="flex"
                flexDir="column"
                overflowY="auto"
              >
                <ScrollableChat messages={messages} />
              </Box>
            )}

            <FormControl isRequired mt="3">
              {isTyping && (
                <Lottie
                  options={defaultOptions}
                  style={{
                    height: 30,
                    width: 70,
                    marginBottom: 15,
                    marginLeft: 0,
                  }}
                />
              )}

              <Box display="flex">
                <Input
                  placeholder="Enter a message..."
                  onChange={typingHandler}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") sendMessage(event);
                  }}
                  value={newMessage}
                  variant="filled"
                  bg="#e0e0e0"
                />
                <Button
                  variant="solid"
                  colorScheme="teal"
                  ml={1}
                  onClick={sendMessage}
                >
                  Send
                </Button>
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Text fontSize="3xl" pb="3" fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
