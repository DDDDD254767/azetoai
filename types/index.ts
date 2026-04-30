export interface User {
  id: string
  email: string
  created_at: string
}

export interface ApiKey {
  id: string
  user_id: string
  key: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Tool {
  id: string
  name: string
  description: string
  script: string
  created_at: string
  updated_at: string
}

export interface Settings {
  plugin_download_url: string
  tools: Tool[]
}

export interface PluginChatRequest {
  message: string
  api_key: string
  context?: string
  selected_scripts?: string[]
}

export interface PluginChatResponse {
  reply: string
  error?: string
}

export interface VerifyResponse {
  valid: boolean
  user_id?: string
  email?: string
  error?: string
}
