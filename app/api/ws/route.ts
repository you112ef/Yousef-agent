import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { wsManager } from '@/lib/websocket/manager'

export const dynamic = 'force-dynamic' // Disable static optimization

export async function GET(request: NextRequest) {
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected WebSocket', { status: 400 })
  }

  const session = await getServerSession()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('taskId') || undefined

  // @ts-ignore - WebSocket is available in the Edge runtime
  const { SocketAddress } = globalThis
  // @ts-ignore
  const { Socket } = globalThis

  // Create WebSocket pair
  // @ts-ignore
  const { 0: client, 1: server } = new WebSocketPair()

  // @ts-ignore
  server.accept()

  // Add client to manager
  wsManager.addClient(server as unknown as WebSocket, session.user.id, taskId || undefined)

  // Handle messages from client
  // @ts-ignore
  server.addEventListener('message', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)

      if (data.type === 'heartbeat') {
        wsManager.updateHeartbeat(server as unknown as WebSocket)
        // @ts-ignore
        server.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now()
        }))
      } else if (data.type === 'subscribe') {
        if (data.taskId) {
          wsManager.subscribeToTask(server as unknown as WebSocket, data.taskId)
        }
      } else if (data.type === 'unsubscribe') {
        if (data.taskId) {
          wsManager.unsubscribeFromTask(server as unknown as WebSocket, data.taskId)
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error)
    }
  })

  // Handle close
  // @ts-ignore
  server.addEventListener('close', () => {
    wsManager.removeClient(server as unknown as WebSocket)
  })

  // Handle errors
  // @ts-ignore
  server.addEventListener('error', (error: Error) => {
    console.error('WebSocket error:', error)
    wsManager.removeClient(server as unknown as WebSocket)
  })

  // Send initial connection success message
  // @ts-ignore
  server.send(JSON.stringify({
    type: 'connected',
    message: 'WebSocket connected successfully',
    timestamp: Date.now()
  }))

  // Periodically send heartbeat to keep connection alive
  // @ts-ignore
  const heartbeatInterval = setInterval(() => {
    if (server.readyState === server.OPEN) {
      // @ts-ignore
      server.send(JSON.stringify({
        type: 'heartbeat',
        timestamp: Date.now()
      }))
    } else {
      clearInterval(heartbeatInterval)
    }
  }, 30000) // 30 seconds

  // Cleanup interval on close
  // @ts-ignore
  server.addEventListener('close', () => {
    clearInterval(heartbeatInterval)
  })

  // Return the client socket
  return new Response(null, {
    status: 101,
    // @ts-ignore
    webSocket: client,
  })
}
