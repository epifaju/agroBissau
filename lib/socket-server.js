const { Server: SocketIOServer } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

let io = null;

function initializeSocket(server) {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || process.env.APP_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socket.io',
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join a conversation room (between two users)
    socket.on('join-conversation', ({ userId, otherUserId }) => {
      const roomId = getConversationRoomId(userId, otherUserId);
      socket.join(roomId);
      console.log(`User ${userId} joined conversation ${roomId}`);
    });

    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { senderId, receiverId, content, listingId } = data;

        // Save message to database
        const message = await prisma.message.create({
          data: {
            content,
            senderId,
            receiverId,
            listingId: listingId || null,
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            receiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        });

        // Send to receiver's personal room
        io.to(`user-${receiverId}`).emit('new-message', message);

        // Send to conversation room (for both users)
        const roomId = getConversationRoomId(senderId, receiverId);
        io.to(roomId).emit('message-received', message);

        // Confirm to sender
        socket.emit('message-sent', message);

        // Create notification for receiver
        try {
          const { createNotification } = require('./notifications');
          const { sendNewMessageEmail } = require('./notifications/email');
          const senderName = `${message.sender.firstName} ${message.sender.lastName}`;
          
          await createNotification({
            userId: receiverId,
            title: `Nouveau message de ${senderName}`,
            message: content.length > 100 ? content.substring(0, 100) + '...' : content,
            type: 'MESSAGE',
            relatedId: senderId,
            relatedType: 'user',
          });

          // Send email notification
          const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: { email: true, firstName: true },
          });

          if (receiver) {
            await sendNewMessageEmail(
              receiver.email,
              receiver.firstName,
              senderName,
              content,
              `${process.env.NEXTAUTH_URL}/dashboard/messages?userId=${senderId}`
            );
          }
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
          // Don't fail message sending if notification fails
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { error: 'Erreur lors de l\'envoi du message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { receiverId, isTyping, senderId } = data;
      const roomId = getConversationRoomId(senderId, receiverId);
      socket.to(roomId).emit('user-typing', { senderId, isTyping });
    });

    // Mark messages as read
    socket.on('mark-read', async (data) => {
      try {
        const { userId, otherUserId } = data;
        
        await prisma.message.updateMany({
          where: {
            senderId: otherUserId,
            receiverId: userId,
            isRead: false,
          },
          data: {
            isRead: true,
          },
        });

        // Notify sender that messages were read
        io.to(`user-${otherUserId}`).emit('messages-read', { readBy: userId });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

// Helper function to create consistent room IDs
function getConversationRoomId(userId1, userId2) {
  const sorted = [userId1, userId2].sort();
  return `conversation-${sorted[0]}-${sorted[1]}`;
}

module.exports = { initializeSocket, getIO };

