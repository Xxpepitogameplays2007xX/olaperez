'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

type Client = {
  id: string
  name: string
  email: string
}

export default function Clients() {
  const router = useRouter()

  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dpi: '',
    nit: '',
    address: '',
    profession: '',
    notes: '',
  })

  const loadClients = async (value: string) => {
    const { data } = await supabase
      .from('clients')
      .select('id, name, email')
      .ilike('name', `%${value}%`)
      .order('created_at', { ascending: false })

    if (data) setClients(data)
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      loadClients(search)
    }, 300)

    return () => clearTimeout(delay)
  }, [search])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  // 🟢 CREAR O ACTUALIZAR
  const saveClient = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (!form.name) return alert('Nombre requerido')

    if (editingId) {
      // ✏️ UPDATE
      await supabase
        .from('clients')
        .update(form)
        .eq('id', editingId)

      setEditingId(null)
    } else {
      // ➕ CREATE
      await supabase.from('clients').insert([
        {
          user_id: user.id,
          ...form,
        },
      ])
    }

    resetForm()
    loadClients(search)
  }

  // 🗑️ ELIMINAR
  const deleteClient = async (id: string) => {
    const confirmDelete = confirm('¿Eliminar cliente?')
    if (!confirmDelete) return

    await supabase.from('clients').delete().eq('id', id)

    loadClients(search)
  }

  // ✏️ EDITAR
  const editClient = async (id: string) => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        dpi: data.dpi || '',
        nit: data.nit || '',
        address: data.address || '',
        profession: data.profession || '',
        notes: data.notes || '',
      })

      setEditingId(id)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      dpi: '',
      nit: '',
      address: '',
      profession: '',
      notes: '',
    })
  }

  return (
    <div className="container">

      <div className="card">

        {/* HEADER */}
        <div className="header">
          <h1>👤 Clientes</h1>
          <button onClick={() => router.push('/dashboard')} className="back">
            ← Menú
          </button>
        </div>

        {/* SEARCH */}
        <input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search"
        />

        {/* FORM */}
        <div className="form">
          <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange} />
          <input name="dpi" placeholder="DPI" value={form.dpi} onChange={handleChange} />
          <input name="nit" placeholder="NIT" value={form.nit} onChange={handleChange} />
          <input name="address" placeholder="Dirección" value={form.address} onChange={handleChange} />
          <input name="profession" placeholder="Profesión" value={form.profession} onChange={handleChange} />
          <input name="notes" placeholder="Notas" value={form.notes} onChange={handleChange} />

          <button onClick={saveClient} className="create">
            {editingId ? 'Actualizar Cliente' : 'Crear Cliente'}
          </button>

          {editingId && (
            <button onClick={resetForm} className="cancel">
              Cancelar edición
            </button>
          )}
        </div>

        {/* LIST */}
        <div className="list">
          <h2>Lista</h2>

          {clients.map((c) => (
            <div key={c.id} className="client">
              <div>
                <p className="name">{c.name}</p>
                <p className="email">{c.email}</p>
              </div>

              <div className="actions">
                <button onClick={() => editClient(c.id)}>✏️</button>
                <button onClick={() => deleteClient(c.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: #0f0f0f;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
        }

        .card {
          width: 900px;
          max-width: 95%;
          background: #1a1a1a;
          padding: 25px;
          border-radius: 16px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .back {
          background: #374151;
          padding: 6px 10px;
          border-radius: 8px;
        }

        .search {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          background: #262626;
          border: none;
          border-radius: 10px;
          color: white;
        }

        .form {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }

        .form input {
          padding: 10px;
          border-radius: 10px;
          border: none;
          background: #262626;
          color: white;
        }

        .create {
          grid-column: span 2;
          background: #2563eb;
          padding: 10px;
          border-radius: 10px;
        }

        .cancel {
          grid-column: span 2;
          background: #6b7280;
          padding: 10px;
          border-radius: 10px;
        }

        .client {
          display: flex;
          justify-content: space-between;
          background: #262626;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .actions button {
          margin-left: 5px;
          background: #374151;
          padding: 5px 8px;
          border-radius: 6px;
        }
      `}</style>

    </div>
  )
}