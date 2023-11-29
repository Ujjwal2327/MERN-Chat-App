import React, { useEffect } from "react";
import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import Login from "../Components/Authentication/Login";
import Signup from "../Components/Authentication/Signup";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const savedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (savedUserInfo) {
      navigate("/chats");
    }
  }, [navigate]);

  return (
    <Box
      w="100%"
      centerContent
      h="100vh"
      overflow="auto"
      py="40px"
      display="flex"
      flexDir="column"
      alignItems="center"
    >
      <Box
        display="flex"
        justifyContent="center"
        p="3"
        bg="white"
        w="100%"
        maxW="xl"
        mb="15px"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text>Chitter-Chat</Text>
      </Box>
      <Box
        maxW="xl"
        bg="white"
        w="100%"
        p="4"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Tabs variant="soft-rounded">
          <TabList mb="1em">
            <Tab w="50%">Login</Tab>
            <Tab w="50%">SignUp</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default HomePage;
