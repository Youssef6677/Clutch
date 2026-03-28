import React, { useState } from 'react';

const SpotifyWidget = () => {
  const [playlistUrl, setPlaylistUrl] = useState('https://open.spotify.com/playlist/5IaAs8icJ2V9xsQ0goUgbP?si=ea90c6e927074303');
  const [inputUrl, setInputUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Fonction pour convertir une URL Spotify classique en URL Embed
  const convertToEmbedUrl = (url) => {
    if (!url) return '';
    
    // Si l'URL contient déjà /embed/, on la retourne telle quelle
    if (url.includes('/embed/')) return url;

    // Remplacement de open.spotify.com/ par open.spotify.com/embed/
    try {
      const embedUrl = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
      // On s'assure que l'URL commence bien par https://
      return embedUrl.startsWith('http') ? embedUrl : `https://${embedUrl}`;
    } catch (error) {
      console.error('Erreur conversion URL Spotify:', error);
      return url;
    }
  };

  const handleLoadPlaylist = (e) => {
    e.preventDefault();
    if (inputUrl.trim() && inputUrl.includes('spotify.com')) {
      setPlaylistUrl(inputUrl.trim());
      setInputUrl('');
    } else {
      alert("Veuillez entrer une URL Spotify valide (ex: https://open.spotify.com/playlist/...)");
    }
  };

  const convertedUrl = convertToEmbedUrl(playlistUrl);

  return (
    <div className="fixed bottom-4 right-20 z-40 animate-in slide-in-from-right duration-300">
      {/* Bouton Réduit (toujours présent, caché si étendu) */}
      <button 
        onClick={() => setIsExpanded(true)}
        className={`${isExpanded ? 'hidden' : 'flex'} w-14 h-14 bg-emerald-400 border-4 border-gray-800 rounded-lg items-center justify-center text-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group`}
        title="Ouvrir le Juke-box"
      >
        <span className="group-hover:animate-bounce">🎵</span>
      </button>

      {/* Fenêtre Complète (toujours présente, cachée si réduite) */}
      <div className={`${isExpanded ? 'flex' : 'hidden'} bg-[#f5e6d3] border-4 border-gray-800 p-4 rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,1)] w-80 flex-col gap-4`}>
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-gray-800 pb-2">
          <span className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
            📻 Juke-box Rétro
          </span>
          <button 
            onClick={() => setIsExpanded(false)}
            className="w-6 h-6 bg-rose-500 text-white border-2 border-gray-800 flex items-center justify-center text-xs font-black hover:bg-rose-600 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Player iFrame - NE JAMAIS DÉMONTER POUR GARDER LA MUSIQUE */}
        <div className="bg-black border-2 border-gray-800 rounded overflow-hidden">
          <iframe 
            src={convertedUrl} 
            width="100%" 
            height="152" 
            frameBorder="0" 
            allowFullScreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
            title="Spotify Player"
          ></iframe>
        </div>

        {/* Playlist Input */}
        <form onSubmit={handleLoadPlaylist} className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-gray-600 uppercase">Changer de playlist :</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Lien Spotify..."
              className="flex-1 border-2 border-gray-800 p-1 text-[10px] font-bold focus:outline-none bg-white/50"
            />
            <button 
              type="submit"
              className="bg-blue-400 border-2 border-gray-800 px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpotifyWidget;
