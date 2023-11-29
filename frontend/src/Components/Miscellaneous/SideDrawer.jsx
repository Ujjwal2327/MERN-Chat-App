import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon, Search2Icon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../User/UserListItem";

const SideDrawer = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const toast = useToast();

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notifications,
    setNotifications,
  } = ChatState();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const btnRef = React.useRef();

  const searchHandler = async () => {
    if (!search) {
      toast({
        title: "Please Enter Something To Search!",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // console.log("searching data- ", search, user.token);
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      // console.log("search data- ", data);
      setLoading(false);
      setSearchResult(data);
    } catch (err) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the search results",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChatHandler = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);
      // console.log("search data- ", data);
      // console.log("search selectedChat- ", selectedChat);

      // for updating chats state to show all chats in myChats component
      if (!chats.find((chat) => chat._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (err) {
      setLoadingChat(true);
      toast({
        title: "Error In Fetching The Chat !",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoadingChat(false);
    }
  };

  const notificationClickHandler = (notifiedMsg) => {
    setSelectedChat(notifiedMsg.chat);
    setNotifications(
      notifications.filter((msg) => msg.chat._id !== notifiedMsg.chat._id)
    );
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users To Chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <Search2Icon />
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work sans">
          Chitter-Chat
        </Text>

        <div>
          <Menu>
            <MenuButton p="1" position="relative">
              <Text
                bg="red"
                color="white"
                borderRadius="40%"
                p="0"
                m="0"
                w="4"
                fontSize="10px"
                fontWeight="bold"
                position="absolute"
                top="0"
                right="0"
              >
                {notifications.length !== 0 && notifications.length}
              </Text>
              <BellIcon fontSize="2xl" m="1" />
            </MenuButton>

            <MenuList pl="2" h="0px">
              {!notifications.length ? (
                "No New Messages"
              ) : (
                <>
                  {notifications.map((notifiedMsg) => (
                    <MenuItem
                      key={notifiedMsg._id}
                      onClick={() => notificationClickHandler(notifiedMsg)}
                    >
                      {notifiedMsg.chat.isGroupChat
                        ? `New Message in ${notifiedMsg.chat.chatName} - ${notifiedMsg.content}`
                        : `New Message from ${notifiedMsg.sender.name} - ${notifiedMsg.content}`}
                    </MenuItem>
                  ))}
                </>
              )}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>

            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer
        placement="left"
        onClose={onClose}
        isOpen={isOpen}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>

          <DrawerBody>
            <Box display="flex" pb="2">
              <Input
                placeholder="Search by name or email"
                mr="2"
                onChange={(event) => setSearch(event.target.value)}
                value={search}
              />
              <Button onClick={searchHandler}>Go</Button>
            </Box>

            {loading ? (
              <ChatLoading />
            ) : (
              searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  clickHandler={() => accessChatHandler(user._id)}
                />
              ))
            )}

            {loadingChat && <Spinner size="lg" mx="auto" display="flex" />}
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            {/* <Button colorScheme="blue">Save</Button> */}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
