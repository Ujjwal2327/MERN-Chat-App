import {
  Box,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";
import UserListItem from "../User/UserListItem";
import UserBadgeItem from "../User/UserBadgeItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, chats, setChats } = ChatState();

  const toast = useToast();

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
      // console.log(data);
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

  const addUserHandler = (userToAdd) => {
    if (selectedUsers.find((user) => user._id === userToAdd._id)) {
      toast({
        title: "User Already Added!",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const removeUserHandler = (userToRemove) => {
    setSelectedUsers(
      selectedUsers.filter((user) => user._id !== userToRemove._id)
    );
  };

  const submitHandler = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please Fill All The Fields!",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
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
      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((user) => user._id)),
        },
        config
      );
      setChats([data, ...chats]); // to show new grp to the very top
      setLoading(false);
      onClose();
      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
    } catch (err) {
      toast({
        title: "Failed to Create the Chat!",
        description: err.response.data,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      {children ? <span onClick={onOpen}>{children}</span> : <></>}

      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <VStack spacing="5px">
              <FormControl id="group-name" isRequired>
                <Input
                  placeholder="Chat Name"
                  mb="3"
                  onChange={(event) => setGroupChatName(event.target.value)}
                />
              </FormControl>

              <FormControl id="group-users" isRequired>
                <Input
                  placeholder="Add Users eg: Ujjwal, Uday, Prateek"
                  mb="1"
                  value={search}
                  onChange={(event) => searchHandler(event.target.value)}
                />
              </FormControl>

              <Box id="selected-users" display="flex" flexWrap="wrap" w="100%">
                {selectedUsers.map((user) => (
                  <UserBadgeItem
                    user={user}
                    clickHandler={() => removeUserHandler(user)}
                    key={user._id}
                  />
                ))}
              </Box>

              <Box id="search-result">
                {loading
                  ? "Loading..."
                  : searchResult.map((user) => (
                      <UserListItem
                        user={user}
                        clickHandler={() => addUserHandler(user)}
                        key={user._id}
                      />
                    ))}
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={submitHandler}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
