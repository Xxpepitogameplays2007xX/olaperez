'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import CaseIntelligence from '@/app/components/CaseIntelligence'

type Message = {
  user_message: string
  ai_message: string
}

type Chat = {
  id: string
  title: string
  status: string
  client_id?: string
}

type Client = {
  id: string
  name: string
  email?: string
  dpi?: string
}

export default function Chat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [chatId, setChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState('')

  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [activeClient, setActiveClient] = useState<Client | null>(null)

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  // 🔽 AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 🔽 CARGAR CLIENTES
  useEffect(() => {
    const loadClients = async () => {
      const { data } = await supabase
        .from('clients')
        .select('id, name, email, dpi')

      if (data) setClients(data)
    }

    loadClients()
  }, [])

  // 🔽 CARGAR CHATS
  useEffect(() => {
    const loadChats = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('chats')
        .select('id, title, status, client_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setChats(data)

        if (data.length > 0) {
          setChatId(data[0].id)
          setActiveChat(data[0])
        }
      }
    }

    loadChats()
  }, [router])

  // 🔽 CARGAR MENSAJES (🔥 AQUÍ VA EL FIX)
  useEffect(() => {
    if (!chatId) return

    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('user_message, ai_message')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (data) {
        if (data.length === 0 && activeClient) {
          setMessages([
            {
              user_message: '',
              ai_message: `Hablame del caso de "${activeClient.name}". Puedes comenzar describiendo los hechos.`
            }
          ])
        } else {
          setMessages(data)
        }
      }
    }

    loadMessages()
  }, [chatId, activeClient])

  // 🔽 CARGAR CLIENTE ACTIVO
  useEffect(() => {
    const loadClient = async () => {
      if (!activeChat?.client_id) return setActiveClient(null)

      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('id', activeChat.client_id)
        .single()

      if (data) setActiveClient(data)
    }

    loadClient()
  }, [activeChat])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const createNewChat = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (!selectedClient) {
      alert('Selecciona un cliente')
      return
    }

    const { data: newChat } = await supabase
      .from('chats')
      .insert([
        {
          user_id: user.id,
          client_id: selectedClient,
          title: 'Nuevo expediente',
          status: 'en entrevista'
        }
      ])
      .select()
      .single()

    if (newChat) {
      setChats((prev) => [newChat, ...prev])
      setChatId(newChat.id)
      setActiveChat(newChat)
      setMessages([])
    }
  }

  const switchChat = (chat: Chat) => {
    setChatId(chat.id)
    setActiveChat(chat)
  }

  // 🔥 ENVÍO (PDF + CLIENTE)
  const sendMessage = async () => {
    if (!message && !file) return
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()

    let fileBase64 = null
    let fileName = null

    if (file) {
      fileName = file.name

      const reader = new FileReader()

      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
      })

      reader.readAsDataURL(file)
      fileBase64 = await base64Promise
    }

    setMessages((prev) => [
      ...prev,
      {
        user_message: message || '📎 Archivo enviado',
        ai_message: 'Analizando...'
      }
    ])

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        message,
        fileBase64,
        fileName,
        chatId,
        client: activeClient
      })
    })

    const data = await res.json()

    setMessages((prev) => {
      const updated = [...prev]
      updated[updated.length - 1].ai_message = data.reply
      return updated
    })

    setMessage('')
    setFile(null)
    setLoading(false)
  }

  return (
    <div className="flex h-screen bg-zinc-900 text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-zinc-950 p-4 flex flex-col gap-2">

        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="p-2 bg-zinc-800 rounded"
        >
          <option value="">Cliente</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          onClick={createNewChat}
          className="bg-blue-600 p-2 rounded"
        >
          + Expediente
        </button>

        <div className="flex-1 overflow-y-auto mt-2">
          {chats.map((chat) => (
            <div key={chat.id} className="mb-3">
              <div
                onClick={() => switchChat(chat)}
                className={`p-2 rounded cursor-pointer ${
                  chat.id === chatId ? 'bg-zinc-700' : 'hover:bg-zinc-800'
                }`}
              >
                {chat.title}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="bg-zinc-700 p-2 rounded"
        >
          ⬅️ Menú
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-600 p-2 rounded"
        >
          Cerrar sesión
        </button>
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">

        <div className="flex-1 overflow-y-auto p-4">

          <CaseIntelligence chatId={chatId} />

          {messages.map((m, i) => (
            <div key={i} className="mb-3">
              <div className="bg-zinc-700 p-2 rounded mb-1">
                {m.user_message}
              </div>
              <div className="bg-blue-600 p-2 rounded">
                {m.ai_message}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-zinc-700">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 bg-zinc-800 rounded"
            placeholder="Escribe..."
          />

          <div className="flex gap-2 mt-2">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 px-4 rounded"
            >
              {loading ? '...' : 'Enviar'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}