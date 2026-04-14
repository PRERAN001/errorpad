import User from '../model/usermodel.js';
import { hasPadAccess } from './padAccess.js';

export const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', (roomName) => {
      if (!roomName) return;
      socket.join(roomName);
      console.log(`User joined room: ${roomName}`);
    });

    socket.on('update-content', async (data) => {
      const { roomName, usercontext, password } = data || {};
      if (!roomName) return;

      try {
        const existingPad = await User.findOne({ userquery: roomName });

        if (existingPad && !hasPadAccess(existingPad, password)) {
          socket.emit('content-update-error', 'Invalid password for protected pad');
          return;
        }

        if (!existingPad) {
          await User.create({
            userquery: roomName,
            usercontext: typeof usercontext === 'string' ? usercontext : JSON.stringify(usercontext || ''),
            isProtected: false,
            passwordHash: '',
          });
        } else {
          existingPad.usercontext = typeof usercontext === 'string' ? usercontext : JSON.stringify(usercontext || '');
          await existingPad.save();
        }

        socket.to(roomName).emit('receive-content', usercontext);
      } catch (error) {
        console.error('Error updating DB via socket:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};
