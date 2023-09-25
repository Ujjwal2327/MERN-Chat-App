// in SingleChat.jsx , in MyChats.jsx
export const getSender = (loggedUser, users) => {
  return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
};


// in MyChats.jsx
export const getSenderFull = (loggedUser, users) => {
  return users[0]?._id === loggedUser?._id ? users[1] : users[0];
};


// in ScrollableChat.jsx
export const isSameSender = (messages, currMsg, currMsgIdx, userId) => {
  return (
    (currMsgIdx + 1 < messages.length) &&
    (messages[currMsgIdx + 1].sender._id !== currMsg.sender._id ||
      messages[currMsgIdx + 1].sender._id === undefined) &&
    (messages[currMsgIdx].sender._id !== userId)
  );
};


export const isLastMessage = (messages, idx, userId) => {
  return (
    idx === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};