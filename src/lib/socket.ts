import { io, Socket } from 'socket.io-client';
import { useTenantStore } from '@/stores/use-tenant';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.bizos.com';

let socket: Socket | null = null;

/**
 * Initializes the global Socket.IO connection.
 * Connects only client-side to prevent Next.js SSR build errors.
 */
export function getSocket(): Socket | null {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false, // Explicitly connect later based on active session
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket'], // Restrict to WebSocket for performance
    });

    // Handle authentication context binding on connection
    socket.on('connect', () => {
      console.log('[Socket] Connected to realtime gateway');
      
      const { activeBusinessId, activeBranchId } = useTenantStore.getState();
      if (socket && activeBusinessId) {
        // Join tenant-specific updates room
        socket.emit('tenant:join', {
          businessId: activeBusinessId,
          branchId: activeBranchId,
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection Error:', error.message);
    });
  }

  return socket;
}

/**
 * Helper to update room binding when changing active branch
 */
export function updateSocketTenantRoom(businessId: string, branchId: string | null) {
  const activeSocket = getSocket();
  if (activeSocket && activeSocket.connected) {
    activeSocket.emit('tenant:switch', { businessId, branchId });
  }
}
