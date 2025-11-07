import { WebSocketMessage, ClientInfo, TaskUpdateMessage } from './types'

class WebSocketManager {
  private static instance: WebSocketManager
  private rooms: Map<string, Set<WebSocket>> = new Map()
  private clientInfo: Map<WebSocket, ClientInfo> = new Map()
  private taskSubscriptions: Map<string, Set<WebSocket>> = new Map()

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  addClient(ws: WebSocket, userId: string, taskId?: string) {
    const clientInfo: ClientInfo = {
      userId,
      taskId,
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
    }

    this.clientInfo.set(ws, clientInfo)

    // Subscribe to task-specific room
    if (taskId) {
      this.subscribeToTask(ws, taskId)
    }

    console.log(`WebSocket client connected: User ${userId}, Task ${taskId || 'none'}`)
  }

  removeClient(ws: WebSocket) {
    const clientInfo = this.clientInfo.get(ws)
    if (clientInfo?.taskId) {
      this.unsubscribeFromTask(ws, clientInfo.taskId)
    }

    this.clientInfo.delete(ws)
    console.log(`WebSocket client disconnected`)
  }

  updateHeartbeat(ws: WebSocket) {
    const clientInfo = this.clientInfo.get(ws)
    if (clientInfo) {
      clientInfo.lastHeartbeat = new Date()
    }
  }

  subscribeToTask(ws: WebSocket, taskId: string) {
    if (!this.taskSubscriptions.has(taskId)) {
      this.taskSubscriptions.set(taskId, new Set())
    }
    this.taskSubscriptions.get(taskId)!.add(ws)
  }

  unsubscribeFromTask(ws: WebSocket, taskId: string) {
    const subscribers = this.taskSubscriptions.get(taskId)
    if (subscribers) {
      subscribers.delete(ws)
      if (subscribers.size === 0) {
        this.taskSubscriptions.delete(taskId)
      }
    }
  }

  broadcastToTask(taskId: string, message: WebSocketMessage) {
    const subscribers = this.taskSubscriptions.get(taskId)
    if (subscribers) {
      const messageStr = JSON.stringify(message)
      subscribers.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(messageStr)
          } catch (error) {
            console.error('Error sending WebSocket message:', error)
          }
        }
      })
    }
  }

  sendToUser(userId: string, message: WebSocketMessage) {
    const messageStr = JSON.stringify(message)
    this.clientInfo.forEach((clientInfo, ws) => {
      if (clientInfo.userId === userId && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr)
        } catch (error) {
          console.error('Error sending WebSocket message:', error)
        }
      }
    })
  }

  handleTaskUpdate(taskId: string, update: TaskUpdateMessage) {
    const message: WebSocketMessage = {
      type: 'task_update',
      payload: update,
      timestamp: Date.now(),
    }

    this.broadcastToTask(taskId, message)
  }

  handleTaskProgress(taskId: string, progress: number, message: string) {
    const wsMessage: WebSocketMessage = {
      type: 'task_progress',
      payload: { taskId, progress, message },
      timestamp: Date.now(),
    }

    this.broadcastToTask(taskId, wsMessage)
  }

  handleTaskComplete(taskId: string) {
    const message: WebSocketMessage = {
      type: 'task_complete',
      payload: { taskId },
      timestamp: Date.now(),
    }

    this.broadcastToTask(taskId, message)
  }

  handleTaskError(taskId: string, error: string) {
    const message: WebSocketMessage = {
      type: 'task_error',
      payload: { taskId, error },
      timestamp: Date.now(),
    }

    this.broadcastToTask(taskId, message)
  }

  getActiveConnections(): number {
    return this.clientInfo.size
  }

  getTaskSubscribers(taskId: string): number {
    return this.taskSubscriptions.get(taskId)?.size || 0
  }

  cleanupInactiveConnections(maxAgeMinutes: number = 30) {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000)
    const toRemove: WebSocket[] = []

    this.clientInfo.forEach((clientInfo, ws) => {
      if (clientInfo.lastHeartbeat < cutoff) {
        toRemove.push(ws)
      }
    })

    toRemove.forEach(ws => this.removeClient(ws))
  }
}

export const wsManager = WebSocketManager.getInstance()
