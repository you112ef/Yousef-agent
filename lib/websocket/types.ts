export interface WebSocketMessage {
  type: 'task_update' | 'task_progress' | 'task_complete' | 'task_error' | 'heartbeat' | 'error'
  payload: any
  timestamp: number
}

export interface TaskUpdateMessage {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'error' | 'stopped'
  progress?: number
  message?: string
  logs?: Array<{
    type: 'info' | 'command' | 'error' | 'success'
    message: string
    timestamp: Date
  }>
  error?: string
}

export interface ClientInfo {
  userId: string
  taskId?: string
  connectedAt: Date
  lastHeartbeat: Date
}

export interface Room {
  id: string
  clients: Set<WebSocket>
  createdAt: Date
}

export type EventCallback = (data: any) => void
