import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import socketService from '../../services/socketService';
import { ENDPOINTS } from '../../../api';

// Async thunk for fetching messages
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(ENDPOINTS.HALL_MESSAGES, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      // Import socketService to map messages
      const socketService = (await import('../../services/socketService')).default;
      return response.data.map(msg => socketService.mapFetchedMessage(msg));
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for fetching users
export const fetchUsers = createAsyncThunk(
  'chat/fetchUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(ENDPOINTS.USERS, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for fetching private messages
export const fetchPrivateMessages = createAsyncThunk(
  'chat/fetchPrivateMessages',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${ENDPOINTS.PRIVATE_MESSAGES}/${userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const socketService = (await import('../../services/socketService')).default;
      const messages = response.data.map(msg => socketService.mapPrivateMessage(msg));
      const currentUserId = auth.user.id;
      const chatKey = [currentUserId, userId].sort().join('-');
      return { messages, chatKey };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for sending private message
export const sendPrivateMessage = createAsyncThunk(
  'chat/sendPrivateMessage',
  async ({ text, recipientId, imageBase64, voiceBase64 }, { rejectWithValue }) => {
    try {
      socketService.sendPrivateMessage(text, recipientId, imageBase64, voiceBase64);
      return { text, recipientId, imageBase64, voiceBase64, temp: true };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk for sending message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ text, imageBase64, voiceBase64 }, { rejectWithValue }) => {
    try {
      socketService.sendMessage(text, imageBase64, voiceBase64);
      // Return a temp message, actual message will come via socket
      return { text, imageBase64, voiceBase64, temp: true };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    privateMessages: {},
    users: [],
    selectedUser: null,
    currentChatType: 'group', // 'group' or 'private'
    loading: false,
    error: null,
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    addPrivateMessage: (state, action) => {
      const { senderId, recipientId } = action.payload;
      const chatKey = [senderId, recipientId].sort().join('-');
      if (!state.privateMessages[chatKey]) {
        state.privateMessages[chatKey] = [];
      }
      state.privateMessages[chatKey].push(action.payload);
    },
    selectUser: (state, action) => {
      state.selectedUser = action.payload;
      state.currentChatType = action.payload ? 'private' : 'group';
    },
    connectSocket: (state, action) => {
      socketService.connect(action.payload);
    },
    disconnectSocket: () => {
      socketService.disconnect();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPrivateMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPrivateMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { messages, chatKey } = action.payload;
        state.privateMessages[chatKey] = messages;
      })
      .addCase(fetchPrivateMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // eslint-disable-next-line no-unused-vars
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Message will be added via socket
      })
      // eslint-disable-next-line no-unused-vars
      .addCase(sendPrivateMessage.fulfilled, (state, action) => {
        // Message will be added via socket
      })
  },
});

export const { addMessage, addPrivateMessage, selectUser, connectSocket, disconnectSocket } = chatSlice.actions;
export default chatSlice.reducer;