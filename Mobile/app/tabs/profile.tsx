import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";

const PRIMARY = "#AC97D8";
const SECONDARY = "#DBFBF1";

const ProfilePage = () => {
  const { user: authUser } = useAuth();

  const name = authUser?.name || "Your Name";
  const email = authUser?.email || "you@example.com";
  const role = authUser?.role || "Member";
  const createdAt = authUser?.createdAt
    ? new Date(authUser.createdAt).toLocaleDateString()
    : null;

  const firstLetter = name?.[0]?.toUpperCase() || "?";

  return (
    <View className="flex-1" style={{ backgroundColor: "#F5F3FF" }}>
      {/* Top header */}
      <View
        className="px-5 pt-12 pb-4"
        style={{
          backgroundColor: SECONDARY,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text className="text-xs font-semibold tracking-[2px] text-gray-600">
          PROFILE
        </Text>
        <Text className="text-2xl font-bold text-gray-900 mt-1">
          Hello, {name.split(" ")[0] || "there"} 👋
        </Text>
        <Text className="text-xs text-gray-600 mt-1">
          Manage your account, identity and preferences.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {/* Main profile card */}
        <View
          className="items-center px-5 pt-6 pb-5 mb-4"
          style={{
            borderRadius: 24,
            backgroundColor: "#FFFFFF",
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Avatar */}
          <View
            className="w-24 h-24 rounded-full overflow-hidden items-center justify-center mb-3"
            style={{ backgroundColor: "#F0E9FF" }}
          >
            {authUser?.avatar ? (
              <Image
                source={{ uri: authUser.avatar }}
                className="w-24 h-24"
                resizeMode="cover"
              />
            ) : (
              <Text
                className="text-3xl font-bold"
                style={{ color: PRIMARY }}
              >
                {firstLetter}
              </Text>
            )}
          </View>

          {/* Name + role */}
          <Text className="text-xl font-semibold text-gray-900">
            {name}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">{role}</Text>

          {/* Tag pill */}
          {createdAt && (
            <View
              className="mt-3 px-3 py-1 rounded-full"
              style={{ backgroundColor: "#F7F2FF" }}
            >
              <Text
                className="text-[11px] font-medium"
                style={{ color: PRIMARY }}
              >
                Member since {createdAt}
              </Text>
            </View>
          )}

          {/* Edit profile button */}
          <TouchableOpacity
            className="mt-4 px-5 py-2 rounded-full"
            style={{ backgroundColor: PRIMARY }}
            onPress={() => {
              // TODO: navigate to edit profile screen
            }}
          >
            <Text className="text-white text-sm font-semibold">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info cards */}
        <View className="gap-y-3">
          {/* Contact card */}
          <View
            className="px-4 py-4"
            style={{
              borderRadius: 18,
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text className="text-xs font-semibold text-gray-500 mb-2">
              CONTACT
            </Text>

            <View className="mb-2">
              <Text className="text-[11px] text-gray-400">Email</Text>
              <Text className="text-sm text-gray-800" numberOfLines={1}>
                {email}
              </Text>
            </View>

            <View>
              <Text className="text-[11px] text-gray-400">Role</Text>
              <Text className="text-sm text-gray-800">{role}</Text>
            </View>
          </View>

          {/* Activity / stats card (dummy numbers for now) */}
          <View
            className="px-4 py-4"
            style={{
              borderRadius: 18,
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text className="text-xs font-semibold text-gray-500 mb-3">
              ACTIVITY
            </Text>

            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text
                  className="text-lg font-bold mb-0.5"
                  style={{ color: PRIMARY }}
                >
                  12
                </Text>
                <Text className="text-[11px] text-gray-500">
                  Conversations
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text
                  className="text-lg font-bold mb-0.5"
                  style={{ color: PRIMARY }}
                >
                  87
                </Text>
                <Text className="text-[11px] text-gray-500">
                  Messages
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text
                  className="text-lg font-bold mb-0.5"
                  style={{ color: PRIMARY }}
                >
                  3
                </Text>
                <Text className="text-[11px] text-gray-500">
                  Calls
                </Text>
              </View>
            </View>
          </View>

          {/* Settings / actions card */}
          <View
            className="px-4 py-4 mt-2"
            style={{
              borderRadius: 18,
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text className="text-xs font-semibold text-gray-500 mb-3">
              SETTINGS
            </Text>

            <TouchableOpacity
              className="py-3 flex-row items-center justify-between"
              onPress={() => {
                // TODO: navigate to notification settings
              }}
            >
              <Text className="text-sm text-gray-800">Notifications</Text>
              <Text
                className="text-xs"
                style={{ color: PRIMARY }}
              >
                ON
              </Text>
            </TouchableOpacity>

            <View
              style={{
                height: 1,
                backgroundColor: "#EFEAFE",
                marginVertical: 2,
              }}
            />

  

            <TouchableOpacity
              className="py-3 flex-row items-center justify-between"
              onPress={() => {
                // TODO: hook into your logout logic
              }}
            >
              <Text className="text-sm text-red-500">Log out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfilePage;
