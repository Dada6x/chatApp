import "../../global.css";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api";
import { router } from "expo-router";

export default function Profile() {
  const [profileUser, setProfileUser] = useState<any>();
  const [loading, setLoading] = useState(true);
  const { user, token, logout } = useAuth();

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const result = await authAPI.getMe(token);
        if (result.success) {
          setProfileUser(result.data?.user);
        } else {
          console.log("Profile error:", result.error);
          // If token is invalid, logout
          if (result.error.includes('token') || result.error.includes('unauthorized')) {
            await logout();
            router.replace('/(auth)/login' as any);
          }
        }
      } catch (err) {
        console.log("Profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
        <Text className="mt-3 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login' as any);
          },
        },
      ]
    );
  };

  // Use user from context if available, otherwise use profileUser from API
  const displayUser = user || profileUser;

  if (!displayUser) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-red-500">Failed to load profile.</Text>
      </View>
    );
  }

  const joinedDate = displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : 'Unknown';

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      {/* Avatar */}
      <View className="items-center mb-8">
        <View className="w-40 h-40 rounded-full overflow-hidden shadow-md bg-gray-100">
          <Image
            source={{ 
              uri:
                displayUser.avatar ||
                "https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=699&auto=format&fit=crop",
            }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>

        <Text className="text-3xl font-semibold text-gray-900 mt-5">
          {displayUser.name}
        </Text>
        <Text className="text-gray-500">{displayUser.email}</Text>

        <View className="mt-3 px-3 py-1 rounded-full bg-blue-100 border border-blue-300">
          <Text className="text-xs font-medium text-blue-700 capitalize">
            {displayUser.role}
          </Text>
        </View>
      </View>

      {/* Info Section */}
      <View className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <Text className="text-gray-600 text-sm">Joined</Text>
        <Text className="text-gray-900 font-medium">{joinedDate}</Text>
      </View>

      {/* Buttons */}
      <View className="mt-8">
        <TouchableOpacity className="w-full bg-blue-500 py-3 rounded-xl">
          <Text className="text-center text-white text-base font-semibold">
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full mt-3 py-3 rounded-xl border border-red-400"
          onPress={handleLogout}
        >
          <Text className="text-center text-red-500 text-base font-semibold">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
