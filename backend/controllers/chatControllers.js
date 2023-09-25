const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// create / fetch 1-1 chat
const access1_1Chat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("userId param is not sent with post request");
    return res.status(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    // $and: [
    //   { users: { $elemMatch: { $eq: req.user._id } } },
    //   { users: { $elemMatch: { $eq: userId } } },
    // ],
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    // at max 1
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).send(fullChat);
    } catch (err) {
      res.status(400);
      throw new Error(err.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({
      // users: { $elemMatch: { $eq: req.user._id } },
      users: { $all: [req.user._id] },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 });

    res.status(200).send(chats);

    // What it does??
    const results = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill All The Fields" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More Than 2 Users Are Required To Form A Group Chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      isGroupChat: true,
      users,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch {
    res.status(400);
    throw new Error(err.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  try {
    const updatedGroupChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true } // without giving this, it will return old name of the group
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    // .populate("latestMessage")   // why not this?

    if (!updatedGroupChat) {
      res.status(400);
      throw new Error("Group Is Not Found");
    } else {
      res.json(updatedGroupChat);
    }
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { userId, chatId } = req.body;

  try {
    const updatedGroupChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedGroupChat) {
      res.status(400);
      throw new Error("Group Is Not Found");
    } else {
      res.json(updatedGroupChat);
    }
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { userId, chatId } = req.body;

  try {
    const updatedGroupChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedGroupChat) {
      res.status(400);
      throw new Error("Group Is Not Found");
    } else {
      res.json(updatedGroupChat);
    }
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

module.exports = {
  access1_1Chat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
