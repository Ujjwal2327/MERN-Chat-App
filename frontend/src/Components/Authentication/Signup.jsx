import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toast = useToast();

  const postDetails = (profilePic) => {
    setLoading(true);

    if (profilePic === undefined) {
      toast({
        title: "Please Select An Image!",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (profilePic.type === "image/png" || profilePic.type === "image/jpeg") {
      const data = new FormData();
      data.append("file", profilePic);
      data.append("upload_preset", "mern-chat-app");
      data.append("cloud_name", "dzgeyozxx");
      fetch("https://api.cloudinary.com/v1_1/dzgeyozxx/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log(data);
          setPic(data.url);
          toast({
            title: "Profile Picture Uploaded Successfully!",
            status: "success",
            duration: 4000,
            isClosable: true,
            position: "top-right",
          });
          setLoading(false);
        })
        .catch((err) => {
          // console.log("Error in uploading pic", err);
          toast({
            title: "Error in uploading pic!",
            status: "warning",
            duration: 4000,
            isClosable: true,
            position: "top-right",
          });
          setLoading(false);
        });
    } else {
      toast({
        title: "Please Select An Image!",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
  };

  const submitHandler = async () => {
    setLoading(true);
    if (!name || !password || !confirmPassword || !email) {
      toast({
        title: "Please Fill All The Fields!",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords Do Not Match!",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: { "Content-type": "application/json" },
      };

      const { data } = await axios.post(
        "api/user",
        { name, email, password, pic },
        config
      );

      toast({
        title: "Registration Successful!",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
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
    <div>
      <VStack spacing="5px">
        <FormControl id="first-name" isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="Enter Your Name"
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </FormControl>

        <FormControl id="email" isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="Enter Your Email"
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
        </FormControl>

        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Your Password"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
            <InputRightElement w="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                onClick={() => {
                  setShowPassword(!showPassword);
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl id="confirm-password" isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Your Password"
              onChange={(event) => {
                setConfirmPassword(event.target.value);
              }}
            />
            <InputRightElement w="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                onClick={() => {
                  setShowConfirmPassword(!showConfirmPassword);
                }}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl id="pic">
          <FormLabel>Pic</FormLabel>
          <Input
            type="file"
            p="1.5"
            accept="image/*"
            onChange={(event) => {
              // console.log(event.target);
              postDetails(event.target.files[0]);
            }}
          />
        </FormControl>

        <Button
          colorScheme="blue"
          w="100%"
          mt="15px"
          onClick={submitHandler}
          isLoading={loading}
        >
          SignUp
        </Button>
      </VStack>
    </div>
  );
};

export default Signup;
