import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { ENDPOINTS, SOCKET_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Chat,
  MessageType,
  User as ChatUser,
} from "@flyerhq/react-native-chat-ui";
import { io, Socket } from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import { WebView } from "react-native-webview";
// import { Camera } from "expo-camera";
// import { Audio } from "expo-av";
// import { Alert } from "react-native";

const API_URL = ENDPOINTS.PRIVATE_CONVERSATIONS;

type User = {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: string | null;
  createdAt?: string;
};

const WHEREBY_ROOM_URL = "https://whereby.com/bytesroom";
const WHEREBY_ROOM_PARAMS = "?needancestor&skipMediaPermissionPrompt";

type Conversation = {
  user: User;
  lastMessage?: {
    _id?: string;
    text?: string;
    createdAt?: string;
    owner_id?: User;
    receiver_id?: User;
    imageBase64?: string;
  };
};

// 👉 Helper to map private API message → Chat message (text or image)
const mapPrivateApiMessageToChat = (
  msg: any,
  myId: string,
  authUser: any
): MessageType.Any => {
  const isMine = msg.owner_id?._id === myId;

  const base = {
    id: msg._id,
    createdAt: new Date(msg.createdAt).getTime(),
    author: isMine
      ? {
          id: myId,
          firstName: authUser.name,
          imageUrl: authUser.avatar ?? undefined,
        }
      : {
          id: msg.owner_id?._id || "unknown",
          firstName: msg.owner_id?.name,
          imageUrl: msg.owner_id?.avatar ?? undefined,
        },
  };

  // If backend sends imageBase64 -> image message
  if (msg.imageBase64) {
    const imageMessage: MessageType.Image = {
      ...base,
      type: "image",
      name: "Image",
      size: 0,
      uri: `data:image/jpeg;base64,${msg.imageBase64}`,
      width: 0,
      height: 0,
    };
    return imageMessage;
  }

  // Otherwise text message
  const textMessage: MessageType.Text = {
    ...base,
    type: "text",
    text: msg.text || "",
  };

  return textMessage;
};

const MessagesPage = () => {
  const { token, user: authUser } = useAuth();

  // 👇 Canonical ID used everywhere (must match backend owner_id._id)
  const myId = authUser?._id || (authUser as any)?.id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageType.Any[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);

  // 🎥 Video call state (WebView + Jitsi)
  const [videoRoom, setVideoRoom] = useState<string | null>(null);

  // Keep ref in sync with state so socket handler sees latest
  const setSelectedConversationSafe = (conv: Conversation | null) => {
    selectedConversationRef.current = conv;
    setSelectedConversation(conv);
  };

  // Fetch conversations
  useEffect(() => {
    if (!token || !myId) return;

    const fetchConversations = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setConversations(response.data || []);
      } catch (err: any) {
        console.log("Error fetching conversations", err?.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token, myId]);

  // Socket setup
  useEffect(() => {
    if (!myId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket");
      socket.emit("user:join", myId);
    });

    socket.on("private:new-message", (message: any) => {
      console.log("New private message", message);

      const isMine = message.owner_id?._id === myId;

      // 🔒 Ignore my own text messages:
      // I already add them optimistically in handleSendPress
      if (isMine && message.text && !message.imageBase64) {
        return;
      }

      // Determine conversation partner
      const partnerId =
        message.owner_id._id === myId
          ? message.receiver_id._id
          : message.owner_id._id;

      updateConversationLastMessage(partnerId, message);

      const currentConv = selectedConversationRef.current;

      // Only add to messages if this is the open conversation
      if (
        currentConv &&
        (message.owner_id._id === currentConv.user._id ||
          message.receiver_id._id === currentConv.user._id)
      ) {
        const chatMessage = mapPrivateApiMessageToChat(message, myId, authUser);

        // ✅ De-duplicate by id to avoid duplicate keys / double render
        setMessages((prev) => {
          if (prev.some((m) => m.id === chatMessage.id)) {
            return prev;
          }
          return [...prev, chatMessage];
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [myId, authUser?.name, authUser?.avatar]);

  const updateConversationLastMessage = (userId: string, lastMessage: any) => {
    setConversations((prev) =>
      prev
        .map((conv) =>
          conv.user._id === userId ? { ...conv, lastMessage } : conv
        )
        .sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt || 0).getTime() -
            new Date(a.lastMessage?.createdAt || 0).getTime()
        )
    );
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversationSafe(conversation);

    if (!token || !myId) return;

    try {
      const response = await axios.get(
        ENDPOINTS.PRIVATE_MESSAGES(conversation.user._id as string),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const msgs: MessageType.Any[] = response.data.map((msg: any) =>
        mapPrivateApiMessageToChat(msg, myId, authUser)
      );

      setMessages(msgs);
    } catch (err) {
      console.log("Error fetching messages", err);
    }
  };

  const handleSendPress = async (message: MessageType.PartialText) => {
    if (!selectedConversation || !token || !myId) return;

    const optimisticId = `temp-${Date.now()}`;

    const newMessage: MessageType.Text = {
      author: {
        id: myId,
        firstName: authUser.name,
        imageUrl: authUser.avatar ?? undefined,
      },
      createdAt: Date.now(),
      id: optimisticId, // temp ID
      text: message.text,
      type: "text",
    };

    // Show immediately (only for text)
    setMessages((prev) => [...prev, newMessage]);

    // Update conversation last message
    updateConversationLastMessage(selectedConversation.user._id as string, {
      text: message.text,
      createdAt: new Date().toISOString(),
      owner_id: {
        _id: myId,
        name: authUser.name,
        avatar: authUser.avatar,
      },
    });

    try {
      const response = await axios.post(
        ENDPOINTS.SEND_PRIVATE_MESSAGE,
        {
          text: message.text,
          receiver_id: selectedConversation.user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Replace temp ID with real ID (socket is ignored for my own text messages)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticId ? { ...msg, id: response.data._id } : msg
        )
      );
    } catch (err) {
      console.log("Error sending message", err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
    }
  };

  // 📸 Handle image attachment
  const handleAttachmentPress = async () => {
    if (!selectedConversation || !token) return;

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access media library was denied");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.7,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.base64) {
        console.log("No base64 data from selected image");
        return;
      }

      // Send image to backend (no optimistic UI; socket will handle it)
      await axios.post(
        ENDPOINTS.SEND_PRIVATE_MESSAGE,
        {
          imageBase64: asset.base64,
          receiver_id: selectedConversation.user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Don't call setMessages here -> socket 'private:new-message' will add it
    } catch (err: any) {
      console.log(
        "Error picking/sending image",
        err?.response?.data || err?.message || err
      );
    }
  };

  // ========== VIDEO CALL (WebView + Jitsi) ==========

  const buildRoomName = (a: string, b: string) => {
    // stable room name for both users, order-independent
    return [a, b].sort().join("_");
  };

  const startCall = () => {
    if (!selectedConversation || !myId) return;

    const peerId = (selectedConversation.user._id ||
      selectedConversation.user.id) as string;

    const room = buildRoomName(myId, peerId);
    setVideoRoom(room);
  };

  const closeCall = () => {
    setVideoRoom(null);
  };

  // ========= RENDERING =========

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
        <Text className="mt-3 text-gray-600">Loading conversations...</Text>
      </View>
    );
  }

  if (selectedConversation && myId) {
    const chatUser: ChatUser = {
      id: myId,
      firstName: authUser.name,
      imageUrl: authUser.avatar ?? undefined,
    };

    return (
      <View className="flex-1 bg-white">
        <TouchableOpacity
          onPress={() => setSelectedConversationSafe(null)}
          className="p-4 bg-gray-100 flex-row items-center justify-between"
        >
          <Text className="text-blue-500">← Back to conversations</Text>

          {/* Video Call button */}
          <TouchableOpacity
            onPress={startCall}
            className="px-3 py-1 rounded-full bg-green-500"
          >
            <Text className="text-white text-xs">Video Call</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Video call overlay via WebView */}
        {videoRoom && (
          <View className="absolute inset-0 bg-black z-20">
            <View className="flex-row justify-between items-center px-4 py-3 bg-black/80">
              <Text className="text-white font-semibold">Video call</Text>
              <TouchableOpacity
                onPress={closeCall}
                className="px-3 py-1 rounded-full bg-red-600"
              >
                <Text className="text-white text-xs">Close</Text>
              </TouchableOpacity>
            </View>

            <WebView
              startInLoadingState
              source={{ uri: WHEREBY_ROOM_URL + WHEREBY_ROOM_PARAMS }}
              style={{ flex: 1 }}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              mediaCapturePermissionGrantType="grant" // let WebView grant getUserMedia
            />
          </View>
        )}

        <Chat
          messages={[...messages].reverse()} // newest first for Chat UI
          onSendPress={handleSendPress}
          user={chatUser}
          showUserAvatars
          showUserNames
          sendButtonVisibilityMode="always"
          onAttachmentPress={handleAttachmentPress}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-4 pt-12">
      <FlatList
        data={conversations}
        keyExtractor={(item) => (item.user._id || item.user.id) as string}
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectConversation(item)}>
            <ConversationCard conversation={item} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const ConversationCard = ({ conversation }: { conversation: Conversation }) => {
  const user = conversation.user;
  const lastMessage = conversation.lastMessage;
  const firstLetter = user.name?.[0]?.toUpperCase() || "?";

  return (
    <View className="flex-row items-center rounded-2xl bg-white border border-gray-200 px-3 py-3 shadow-sm">
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 items-center justify-center mr-3">
        {user.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            className="w-12 h-12"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-lg font-semibold text-indigo-600">
            {firstLetter}
          </Text>
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className="text-base font-semibold text-gray-900"
            numberOfLines={1}
          >
            {user.name}
          </Text>
        </View>

        <Text className="text-[10px] text-gray-400 mt-1">
          {lastMessage
            ? new Date(lastMessage.createdAt || "").toLocaleDateString()
            : "No messages"}
        </Text>
      </View>
    </View>
  );
};

const UserCard = ({ user }: { user: User }) => {
  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : null;

  const firstLetter = user.name?.[0]?.toUpperCase() || "?";

  return (
    <View className="flex-row items-center rounded-2xl bg-white border border-gray-200 px-3 py-3 shadow-sm">
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 items-center justify-center mr-3">
        {user.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            className="w-12 h-12"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-lg font-semibold text-indigo-600">
            {firstLetter}
          </Text>
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className="text-base font-semibold text-gray-900"
            numberOfLines={1}
          >
            {user.name}
          </Text>
        </View>

        {user.email && (
          <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
            {user.email}
          </Text>
        )}

        {createdDate && (
          <Text className="text-[10px] text-gray-400 mt-1">
            Joined {createdDate}
          </Text>
        )}
      </View>
    </View>
  );
};

export default MessagesPage;
