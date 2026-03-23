import React, { useState } from 'react'
import { supabase } from '../../supabaseClient'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isLogin) {
        // Connexion
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
      } else {
        // Inscription
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError

        // Insertion dans la table 'profiles' après inscription réussie
        if (data?.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id }])
          if (profileError) {
            console.error("Erreur lors de la création du profil :", profileError.message)
            // On ne bloque pas l'inscription si le profil échoue (déjà géré par triggers Supabase idéalement)
          }
        }
        alert("Inscription réussie ! Vérifiez votre email (si configuré) ou connectez-vous.")
        setIsLogin(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border-8 border-gray-800 p-8 rounded-xl shadow-[12px_12px_0px_rgba(31,41,55,1)] max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2" style={{ fontFamily: 'monospace' }}>
            {isLogin ? 'CONNEXION' : 'INSCRIPTION'}
          </h1>
          <div className="h-2 w-24 bg-yellow-400 mx-auto border-2 border-gray-800 shadow-[4px_4px_0px_rgba(31,41,55,1)]"></div>
          <p className="mt-6 text-sm font-bold text-gray-500 uppercase tracking-widest italic">
            {isLogin ? 'Bon retour, Héros !' : 'Rejoignez la guilde de révision !'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase mb-2">Email de l'aventurier</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full border-4 border-gray-800 p-4 rounded-md font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-700 uppercase mb-2">Mot de passe secret</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-4 border-gray-800 p-4 rounded-md font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-rose-100 border-4 border-rose-500 p-3 rounded-md">
              <p className="text-xs font-black text-rose-600 uppercase tracking-tight">⚠️ ERREUR : {error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-gray-800 text-white font-black py-4 rounded-lg border-b-8 border-gray-950 hover:border-b-4 hover:translate-y-1 active:scale-95 transition-all uppercase tracking-widest ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'CHARGEMENT...' : (isLogin ? 'SE CONNECTER' : 'CRÉER MON COMPTE')}
          </button>
        </form>

        <div className="text-center pt-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-black text-gray-400 hover:text-gray-900 uppercase tracking-tighter underline decoration-2 underline-offset-4"
          >
            {isLogin ? "[ Pas encore de compte ? Créer un profil ]" : "[ Déjà un héros ? Se connecter ]"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Auth
