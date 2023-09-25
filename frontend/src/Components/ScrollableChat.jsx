import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { Avatar, Tooltip } from "@chakra-ui/react";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((msg, idx) => (
          <div style={{ display: "flex" }} key={msg._id}>
            {(isSameSender(messages, msg, idx, user._id) ||
              isLastMessage(messages, idx, user._id)) && (
              <Tooltip
                label={msg.sender.name}
                placement="bottom-start"
                hasArrow
              >
                <Avatar
                  mt="7px"
                  mr="1"
                  size="sm"
                  curson="pointer"
                  name={msg.sender.name}
                  src={msg.sender.pic}
                />
              </Tooltip>
            )}

            <span
              style={{
                backgroundColor: `${
                  msg.sender._id === user._id ? "#bee3f8" : "#b9f5d0"
                }`,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
                marginLeft: isSameSenderMargin(messages, msg, idx, user._id),
                marginTop: isSameUser(messages, msg, idx, user._id) ? 3 : 10,
                overflowWrap:"break-word"
              }}
            >
              {msg.content}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
