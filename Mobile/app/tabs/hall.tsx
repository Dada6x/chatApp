import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Chat, MessageType, User } from "@flyerhq/react-native-chat-ui";
import axios from "axios";
import { ENDPOINTS, SOCKET_URL } from "../api";
import { io, Socket } from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";

const HALL_URL = ENDPOINTS.HALL_MESSAGES;
const ME_URL = ENDPOINTS.ME;

// 👇 Helper: turn API message (with optional imageBase64) into Chat message
const mapApiMessageToChat = (m: any): MessageType.Any => {
  const base = {
    id: m._id,
    createdAt: new Date(m.createdAt).getTime(),
    author: {
      id: m.owner_id?._id || "unknown",
      firstName: m.owner_id?.name,
      imageUrl: m.owner_id?.avatar || undefined,
    },
  };

  if (m.imageBase64) {
    const imageMessage: MessageType.Image = {
      ...base,
      type: "image",
      name: "Image",
      size: 0,
      uri: `data:image/jpeg;base64,${m.imageBase64}`,
      width: 0,
      height: 0,
    };
    return imageMessage;
  }

  const textMessage: MessageType.Text = {
    ...base,
    type: "text",
    text: m.text || "",
  };

  return textMessage;
};

const App = () => {
  const [messages, setMessages] = useState<MessageType.Any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { token, user } = useAuth();

  const addMessage = (message: MessageType.Any) => {
    setMessages((prev) => [message, ...prev]);
  };

  // 1) Load current user + history once
  useEffect(() => {
    if (!token) return; // Don't fetch if no token

    const fetchInitialData = async () => {
      try {
        // Use user from context if available, otherwise fetch from API
        let currentUserData;
        if (user) {
          currentUserData = user;
        } else {
          // /api/me
          const meRes = await axios.get(ME_URL, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          currentUserData = meRes.data.user;
        }

        const chatUser: User = {
          id: currentUserData._id || currentUserData.id, // must match owner_id._id from messages
          firstName: currentUserData.name,
          imageUrl: currentUserData.avatar || undefined,
        };
        setCurrentUser(chatUser);

        // /api/messages/hall
        const res = await axios.get(HALL_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const apiMessages = res.data;

        // 👇 use helper so it supports text + image
        const mapped: MessageType.Any[] = apiMessages.map(mapApiMessageToChat);

        setMessages(mapped.reverse());
      } catch (err: any) {
        console.log(
          "Error fetching initial data",
          err?.response?.data || err?.message || err
        );
      }
    };

    fetchInitialData();
  }, [token, user]);

  // 2) Setup Socket.io connection + listeners
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"], // RN likes this
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Connected to socket:", socket.id);
    });

    socket.on("hall:new-message", (m: any) => {
      // Message object from backend
      const msg = mapApiMessageToChat(m); // 👈 use same helper
      addMessage(msg);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 3) Send message with HTTP; UI updates via socket event
  const handleSendPress = async (partialMessage: MessageType.PartialText) => {
    if (!currentUser || !token) return;

    try {
      await axios.post(
        HALL_URL,
        { text: partialMessage.text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // ❌ Don't call addMessage here
      // The server will emit "hall:new-message" and socket listener above will add it
    } catch (err: any) {
      console.log(
        "Error sending message",
        err?.response?.data || err?.message || err
      );
    }
  };

  // 4) Handle image attachment (Expo Image Picker)
  const handleAttachmentPress = async () => {
    try {
      // Ask for permission
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

      // Send image to backend
      await axios.post(
        HALL_URL,
        { imageBase64: asset.base64 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Don't addMessage here -> socket 'hall:new-message' will handle it
    } catch (err: any) {
      console.log(
        "Error picking/sending image",
        err?.response?.data || err?.message || err
      );
    }
  };

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={{ flex: 1 }}>
          {currentUser && (
            <Chat
              onAttachmentPress={handleAttachmentPress}
              showUserAvatars
              messages={messages}
              onSendPress={handleSendPress}
              user={currentUser}
              showUserNames
              sendButtonVisibilityMode="always"
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
};

export default App;
