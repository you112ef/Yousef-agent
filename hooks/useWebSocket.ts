'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseWebSocketOptions {
  taskId?: string
  onTaskUpdate?: (data: any) => void
  onTaskProgress?: (data: any) => void
  onTaskComplete?: (data: any) => void
  onTaskError?: (data: any) => void
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: Event) => void
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    taskId,
    onTaskUpdate,
    onTaskProgress,
    onTaskComplete,
    onTaskError,
    onConnected,
    onDisconnected,
    onError,
  } = options

  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionStatus('connecting')

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/ws${taskId ? `?taskId=${taskId}` : ''}`

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        onConnected?.()

        // Send initial subscription if taskId is provided
        if (taskId) {
          ws.send(JSON.stringify({ type: 'subscribe', taskId }))
        }
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          switch (message.type) {
            case 'task_update':
              onTaskUpdate?.(message.payload)
              break
            case 'task_progress':
              onTaskProgress?.(message.payload)
              break
            case 'task_complete':
              onTaskComplete?.(message.payload)
              break
            case 'task_error':
              onTaskError?.(message.payload)
              break
            case 'heartbeat':
              // Respond to server heartbeat
              ws.send(JSON.stringify({ type: 'heartbeat' }))
              break
            case 'connected':
              console.log('WebSocket connected:', message.message)
              break
            case 'error':
              console.error('WebSocket error message:', message)
              break
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        setConnectionStatus('disconnected')
        onDisconnected?.()

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }

      ws.onerror = (error) => {
        setConnectionStatus('error')
        onError?.(error)
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Error creating WebSocket:', error)
      setConnectionStatus('error')
    }
  }, [taskId, onTaskUpdate, onTaskProgress, onTaskComplete, onTaskError, onConnected, onDisconnected, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  const subscribe = useCallback((newTaskId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', taskId: newTaskId }))
    }
  }, [])

  const unsubscribe = useCallback((taskIdToUnsubscribe: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', taskId: taskIdToUnsubscribe }))
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
  }
}
