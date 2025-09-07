import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useWebSocket = () => {
  const socketRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Connect to WebSocket server
    socketRef.current = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token'),
        userId: user.id,
        role: user.role,
      },
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    // Order status updates
    socket.on('orderStatusUpdate', (data) => {
      const { orderId, status, productName } = data;
      toast.success(`Order #${orderId} for ${productName} is now ${status}`);
    });

    // Deal expiry notifications
    socket.on('dealExpiring', (data) => {
      const { productName, timeLeft } = data;
      toast(`🔥 ${productName} deal expires in ${timeLeft}!`, {
        duration: 6000,
        icon: '⏰',
      });
    });

    // New order notifications (for sellers)
    socket.on('newOrder', (data) => {
      const { orderId, productName, buyerName } = data;
      toast.success(`New order #${orderId} for ${productName} from ${buyerName}`);
    });

    // Product approval notifications (for sellers)
    socket.on('productApproved', (data) => {
      const { productName } = data;
      toast.success(`Your product "${productName}" has been approved!`);
    });

    socket.on('productRejected', (data) => {
      const { productName, reason } = data;
      toast.error(`Your product "${productName}" was rejected. Reason: ${reason || 'Not specified'}`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      toast.error('Connection error occurred');
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  // Return socket instance for manual operations
  return socketRef.current;
};
