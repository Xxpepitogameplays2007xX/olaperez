'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accepted, setAccepted] = useState(false)

  const router = useRouter()

  const handleSignup = async () => {
    // 🔴 VALIDACIÓN
    if (!accepted) {
      alert('Debes aceptar los términos para continuar')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    const user = data.user

    if (user) {
      const { error: dbError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: user.id,
            email: user.email,
          },
        ])

      if (dbError) {
        alert('Error guardando en DB: ' + dbError.message)
      } else {
        alert('Usuario creado 🎉')
        router.push('/login')
      }
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Crear cuenta</h1>

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

        {/* 🔥 AVISO LEGAL */}
        <div className="legal">
          <input
            type="checkbox"
            checked={accepted}
            onChange={() => setAccepted(!accepted)}
          />

          <p>
            Acepto el <span>Aviso Legal y Términos de Uso</span>
          </p>
        </div>

        {/* TEXTO COMPLETO */}
        <div className="legal-box">
          <p>
            <strong>Aviso Legal y Términos de Uso del Sistema</strong><br /><br />
            Al registrarse y utilizar esta plataforma, el usuario acepta expresamente que el sistema tiene como finalidad exclusiva servir como una herramienta de apoyo para profesionales del derecho, proporcionando asistencia en la organización de información, análisis preliminar y generación de borradores de documentos.<br /><br />
            El usuario reconoce y acepta que todas las decisiones legales, interpretaciones, estrategias jurídicas, redacción final de documentos y cualquier actuación profesional derivada del uso de la plataforma son de su entera y exclusiva responsabilidad.<br /><br />
            Asimismo, el usuario entiende que el sistema incorpora tecnologías de inteligencia artificial que pueden generar resultados inexactos, incompletos o erróneos, por lo que todo debe ser revisado y validado antes de su uso profesional.<br /><br />
            La plataforma no sustituye el criterio profesional del abogado ni constituye asesoría legal definitiva.<br /><br />
            El uso del sistema implica la aceptación total de estos términos.
          </p>
        </div>

        <button className="btn" onClick={handleSignup}>
          Registrarse
        </button>

        <button className="btn-back" onClick={() => router.push('/login')}>
          ← Atrás
        </button>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #0f0f0f;
          color: white;
        }

        .card {
          width: 400px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 25px;
          background: #1a1a1a;
          border-radius: 15px;
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .title {
          text-align: center;
        }

        .input {
          padding: 10px;
          border-radius: 8px;
          border: none;
          background: #2a2a2a;
          color: white;
        }

        .legal {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .legal span {
          color: #60a5fa;
        }

        .legal-box {
          background: #111;
          padding: 10px;
          border-radius: 8px;
          font-size: 12px;
          color: #aaa;
          max-height: 150px;
          overflow-y: auto;
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

        .btn-back {
          padding: 10px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #aaa;
          cursor: pointer;
        }

        .btn-back:hover {
          color: white;
        }
      `}</style>
    </div>
  )
}