import { io } from 'socket.io-client';
import { store } from '../redux/store';
import { addMessage, addPrivateMessage } from '../redux/slices/chatSlice';
import { SOCKET_URL } from '../../api';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket');
    });

    this.socket.on('hall:new-message', (message) => {
      store.dispatch(addMessage(this.mapMessage(message)));
    });

    this.socket.on('private:new-message', (message) => {
      store.dispatch(addPrivateMessage(this.mapPrivateMessage(message)));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  mapMessage(m) {
    const { auth } = store.getState();
    return {
      id: m._id,
      text: m.text,
      imageBase64: m.imageBase64,
      voiceBase64: m.voiceBase64,
      senderId: m.owner_id._id,
      senderName: m.owner_id.name,
      timestamp: new Date(m.createdAt).toISOString(),
      isOwn: m.owner_id._id === auth.user?.id,
    };
  }

  mapFetchedMessage(m) {
    const { auth } = store.getState();
    return {
      id: m._id,
      text: m.text,
      imageBase64: m.imageBase64,
      voiceBase64: m.voiceBase64,
      senderId: m.owner_id._id,
      senderName: m.owner_id.name,
      timestamp: new Date(m.createdAt).toISOString(),
      isOwn: m.owner_id._id === auth.user?.id,
    };
  }

  mapPrivateMessage(m) {
    const { auth } = store.getState();
    return {
      id: m._id,
      text: m.text,
      imageBase64: m.imageBase64,
      voiceBase64: m.voiceBase64,
      senderId: m.owner_id._id,
      senderName: m.owner_id.name,
      recipientId: m.recipient_id._id,
      recipientName: m.recipient_id.name,
      timestamp: new Date(m.createdAt).toISOString(),
      isOwn: m.owner_id._id === auth.user?.id,
    };
  }

  sendMessage(text, imageBase64, voiceBase64 = null) {
    if (this.socket) {
      this.socket.emit('hall:send-message', { text, imageBase64, voiceBase64 });
    }
  }

  sendPrivateMessage(text, recipientId, imageBase64 = null, voiceBase64 = null) {
    if (this.socket) {
      this.socket.emit('private:send-message', { text, recipientId, imageBase64, voiceBase64 });
    }
  }
}

export default new SocketService();