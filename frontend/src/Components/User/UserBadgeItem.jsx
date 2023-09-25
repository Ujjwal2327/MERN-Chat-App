import { CloseIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import React from "react";

const UserBadgeItem = ({ user, clickHandler }) => {
  return (
    <Button
      px="2"
      py="1"
      borderRadius="lg"
      m="1"
      mb="2"
      variant="solid"
      fontSize="12"
      // bg='purple'
      // color='white'
      colorScheme="purple"
      cursor="pointer"
      onClick={clickHandler}
    >
      {user.name}
      <CloseIcon pl="1" />
    </Button>
  );
};

export default UserBadgeItem;
