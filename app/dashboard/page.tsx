'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

type Chat = {
  id: string
  title: string
  status: string
}

export default function Dashboard() {
  const [chats, setChats] = useState<Chat[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      setUser(data.user)

      const { data: chatsData } = await supabase
        .from('chats')
        .select('id, title, status')
        .eq('user_id', data.user.id)

      if (chatsData) setChats(chatsData)

      setLoading(false)
    }

    loadData()
  }, [router])

  // 🔥 FILTROS
  const activos = chats.filter(c =>
    !['resuelto', 'archivado'].includes(c.status)
  )

  const pendientes = chats.filter(c =>
    [
      'pendiente de información',
      'pendiente de documentos',
      'pendiente de revisión',
      'pendiente de firma'
    ].includes(c.status)
  )

  const finalizados = chats.filter(c =>
    ['resuelto', 'archivado'].includes(c.status)
  )

  // 🔥 LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <p style={{ padding: 20 }}>Cargando...</p>

  return (
    <div className="container">

      {/* HEADER */}
      <div className="header">
        <div>
          <h1>📊 Dashboard</h1>
          {user && <p className="user">👤 {user.email}</p>}
        </div>

        <button className="logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {/* RESUMEN */}
      <div className="cards">

        <div className="card blue">
          <h2>{activos.length}</h2>
          <p>Casos activos</p>
        </div>

        <div className="card yellow">
          <h2>{pendientes.length}</h2>
          <p>Pendientes</p>
        </div>

        <div className="card green">
          <h2>{finalizados.length}</h2>
          <p>Finalizados</p>
        </div>

      </div>

      {/* LISTAS */}
      <div className="lists">

        <div className="list">
          <h3>⏳ Pendientes</h3>
          {pendientes.length === 0 ? (
            <p>No hay pendientes</p>
          ) : (
            <ul>
              {pendientes.map(c => (
                <li key={c.id}>{c.title}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="list">
          <h3>📂 Activos</h3>
          {activos.length === 0 ? (
            <p>No hay activos</p>
          ) : (
            <ul>
              {activos.map(c => (
                <li key={c.id}>{c.title}</li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* BOTONES */}
      <div className="actions">
        <button onClick={() => router.push('/chat')}>
          💬 Ir al Chat
        </button>

        <button onClick={() => router.push('/clientes')}>
          👤 Ver Clientes
        </button>
      </div>

      {/* ESTILOS */}
      <style jsx>{`
        .container {
          min-height: 100vh;
          background: #0f0f0f;
          color: white;
          padding: 30px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .user {
          color: #aaa;
          font-size: 14px;
        }

        .logout {
          background: #dc2626;
          padding: 10px 15px;
          border-radius: 8px;
          border: none;
          color: white;
          cursor: pointer;
        }

        .logout:hover {
          background: #b91c1c;
        }

        .cards {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 30px;
        }

        .card {
          width: 150px;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          font-weight: bold;
        }

        .blue {
          background: #2563eb;
        }

        .yellow {
          background: #d97706;
        }

        .green {
          background: #16a34a;
        }

        .lists {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .list {
          width: 300px;
          background: #1a1a1a;
          padding: 15px;
          border-radius: 10px;
        }

        ul {
          padding-left: 20px;
        }

        li {
          margin-bottom: 5px;
        }

        .actions {
          margin-top: 30px;
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        button {
          padding: 10px 15px;
          border: none;
          border-radius: 8px;
          background: #2563eb;
          color: white;
          cursor: pointer;
        }

        button:hover {
          background: #1d4ed8;
        }
      `}</style>

    </div>
  )
}