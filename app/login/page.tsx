'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      router.push('/dashboard') // 👈 manda al chat si todo está bien
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="welcome">Bienvenido 👋</h2>
        <h1 className="title">Login</h1>

        <input
          className="input"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn" onClick={handleLogin}>
          Iniciar sesión
        </button>

        <p className="text">
          ¿No tienes cuenta?{' '}
          <Link href="/singup" className="link">
            Regístrate
          </Link>
        </p>
      </div>

      <style jsx>{`
        .container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #0f0f0f;
          color: white;
        }

        .card {
          width: 350px;
          padding: 30px;
          background: #1a1a1a;
          border-radius: 15px;
          box-shadow: 0 0 20px rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: center;
        }

        .welcome {
          font-size: 18px;
          color: #aaa;
        }

        .title {
          margin-bottom: 10px;
        }

        .input {
          padding: 10px;
          border-radius: 8px;
          border: none;
          background: #2a2a2a;
          color: white;
          outline: none;
        }

        .btn {
          padding: 10px;
          border-radius: 8px;
          border: none;
          background: #2563eb;
          color: white;
          cursor: pointer;
        }

        .btn:hover {
          background: #1d4ed8;
        }

        .text {
          font-size: 13px;
          color: #aaa;
        }

        .link {
          color: #60a5fa;
          text-decoration: none;
        }

        .link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}