import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../User/UserBadgeItem";
import UserListItem from "../User/UserListItem";
import axios from "axios";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const toast = useToast();

  const removeUserHandler = async (userToRemove) => {
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/groupremove",
        { userId: userToRemove._id, chatId: selectedChat._id },
        config
      );
      // console.log(selectedChat);

      userToRemove._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (err) {
      toast({
        title: "Error Occured!",
        description: err.response.data.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const renameHandler = async () => {
    if (!groupChatName) {
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    setRenameLoading(true);
    try {
      const { data } = await axios.put(
        "/api/chat/rename",
        { chatId: selectedChat._id, chatName: groupChatName },
        config
      );

      // console.log(data);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (err) {
      toast({
        title: "Error Occured!",
        description: err.response.data.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
  };

  const searchHandler = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch {
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

  const addUserHandler = async (userToAdd) => {
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedChat.users.find((user) => user._id === userToAdd._id)) {
      toast({
        title: "User Is Already In The Group!",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/groupadd",
        { userId: userToAdd._id, chatId: selectedChat._id },
        config
      );
      // console.log(selectedChat);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (err) {
      toast({
        title: "Error Occured!",
        description: err.response.data.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        icon={<ViewIcon />}
        onClick={onOpen}
        display={{ base: "flex" }}
      />

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setGroupChatName("");
          setSearch("");
          setSearchResult([]);
          onClose();
        }}
        size="lg"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <Box
              id="group-users"
              display="flex"
              flexWrap="wrap"
              w="100%"
              pb="3"
            >
              {selectedChat.users.map((user) => (
                <UserBadgeItem
                  user={user}
                  clickHandler={() => removeUserHandler(user)}
                  key={user._id}
                />
              ))}
            </Box>

            <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(event) => setGroupChatName(event.target.value)}
                value={groupChatName}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={renameHandler}
              >
                Update
              </Button>
            </FormControl>

            <FormControl>
              <Input
                placeholder="Add User to group"
                mb={1}
                onChange={(event) => searchHandler(event.target.value)}
              />
            </FormControl>

            {loading
              ? "Loading..."
              : searchResult?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    clickHandler={() => addUserHandler(user)}
                  />
                ))}
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => removeUserHandler(user)} colorScheme="red">
              Leave Group
            </Button>{" "}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
