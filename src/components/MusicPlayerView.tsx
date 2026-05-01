
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, 
  Repeat, Shuffle, Music, Users, ListMusic, 
  Search, SlidersHorizontal, LayoutGrid, Heart 
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface Track {
  title: string;
  url: string;
  duration: string | number;
  thumbnail: string;
  author: string;
}

interface PlayerStats {
  event: string;
  timestamp: number;
  listeners: number;
  tracks: number;
  volume: number;
  paused: boolean;
  repeatMode: string;
  track: Track | null;
  queue: Track[];
}

export function MusicPlayerView() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");

  const wsUrl = (import.meta.env.VITE_BotAPI || '').replace('http', 'ws');
  const token = localStorage.getItem('ziji-token');

  useEffect(() => {
    if (!token) {
      setError("Please login to access the music player.");
      return;
    }

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setConnected(true);
      socket.send(JSON.stringify({ event: "identify", token }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "authenticated") {
        setAuthenticated(true);
        socket.send(JSON.stringify({ event: "GetVoice" }));
      } else if (data.event === "statistics") {
        setStats(data);
        setVolume(data.volume);
      } else if (data.event === "error") {
        setError(data.message);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      setAuthenticated(false);
    };

    setWs(socket);

    return () => socket.close();
  }, [wsUrl, token]);

  // Update progress bar
  useEffect(() => {
    if (stats?.track && !stats.paused) {
      const interval = setInterval(() => {
        // This is a rough estimation since we only get stats every second
        // For real precision we'd need more data from backend
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stats]);

  const sendCommand = (event: string, data: any = {}) => {
    if (ws && authenticated) {
      ws.send(JSON.stringify({ event, ...data }));
    }
  };

  const formatTime = (ms: number | string) => {
    const totalSeconds = typeof ms === 'number' ? Math.floor(ms / 1000) : 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass p-10 rounded-3xl text-center">
          <p className="text-vibrant-pink font-bold mb-4">{error}</p>
          <a href="#/dashboard" className="text-xs uppercase tracking-widest font-black hover:text-discord transition-colors">Go Back</a>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-white/10 border-t-discord rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8 min-h-[800px]">
        
        {/* Sidebar / Navigation */}
        <div className="lg:w-64 space-y-8">
          <div className="flex items-center gap-3 px-4">
             <div className="w-10 h-10 bg-discord rounded-xl flex items-center justify-center">
               <Music className="w-6 h-6 text-white" />
             </div>
             <h2 className="font-black text-2xl tracking-tighter">Melody</h2>
          </div>

          <nav className="space-y-2">
            {[
              { icon: LayoutGrid, label: 'Home', active: true },
              { icon: Search, label: 'Search' },
              { icon: ListMusic, label: 'Your Library' },
            ].map((item, idx) => (
              <button 
                key={idx}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${item.active ? 'bg-white/5 text-white font-bold' : 'text-zinc-500 hover:text-white'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6 px-4">Playlists</h3>
            <div className="space-y-4">
               {[
                 { color: 'bg-vibrant-pink', name: 'Chill Vibes' },
                 { color: 'bg-discord', name: 'Night Drive' },
                 { color: 'bg-green-500', name: 'Study Focus' },
               ].map((pl, idx) => (
                 <div key={idx} className="flex items-center gap-3 px-4 group cursor-pointer">
                    <div className={`w-10 h-10 ${pl.color} rounded-xl opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">{pl.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Main Content / Queue */}
        <div className="flex-grow glass rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/5">
          
          <div className="flex-grow p-8 md:p-12 space-y-10 border-r border-white/5">
            <div className="flex items-center justify-between">
               <div className="relative flex-grow max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                 <input 
                   placeholder="Search songs, artists, albums..."
                   className="w-full bg-black/20 border border-white/5 rounded-2xl ps-12 pe-4 py-3 text-sm outline-none focus:border-discord/30 transition-all"
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && sendCommand('play', { trackUrl: searchQuery })}
                 />
               </div>
               <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                 <SlidersHorizontal className="w-5 h-5" />
               </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-end justify-between px-2">
                <div>
                  <h3 className="font-black text-4xl tracking-tighter mb-2">Chill Vibes</h3>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stats?.tracks || 0} songs • {stats?.listeners || 0} listeners</p>
                </div>
              </div>

              <div className="space-y-2">
                {stats?.queue && stats.queue.length > 0 ? (
                  stats.queue.map((track, idx) => (
                    <div 
                      key={idx} 
                      className="group flex items-center gap-4 p-4 rounded-3xl hover:bg-white/[0.03] transition-all cursor-pointer"
                    >
                      <span className="w-6 text-center font-bold text-zinc-600 group-hover:text-discord transition-colors">{idx + 1}</span>
                      <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded-xl object-cover border border-white/5 shadow-lg" />
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm truncate">{track.title}</h4>
                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{track.author}</p>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{track.duration}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center opacity-30 italic font-medium">No tracks in queue</div>
                )}
              </div>
            </div>
          </div>

          {/* Now Playing Panel */}
          <div className="w-full md:w-[400px] bg-gradient-to-b from-white/[0.05] to-transparent p-8 md:p-12 flex flex-col items-center justify-between text-center gap-8">
            <div className="space-y-8 w-full">
               <div className="flex items-center justify-between w-full">
                  <button className="text-zinc-500 hover:text-white transition-colors"><Repeat className="w-5 h-5" /></button>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Now Playing</p>
                  <button className="text-zinc-500 hover:text-white transition-colors"><Shuffle className="w-5 h-5" /></button>
               </div>

               <div className="relative group">
                 <div className="absolute inset-0 bg-discord/20 blur-[60px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
                 <img 
                   src={stats?.track?.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop'} 
                   alt="Album Art" 
                   className="relative w-full aspect-square rounded-[3rem] shadow-2xl border border-white/10 z-10 animate-float"
                 />
               </div>

               <div className="space-y-2">
                 <h2 className="font-black text-3xl tracking-tighter truncate px-2">{stats?.track?.title || 'Nothing Playing'}</h2>
                 <p className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">{stats?.track?.author || 'Join a voice channel'}</p>
               </div>

               <div className="space-y-4 pt-4">
                 <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-vibrant-pink"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                 </div>
                 <div className="flex justify-between text-[10px] font-mono text-zinc-500 font-bold">
                    <span>1:42</span>
                    <span>{stats?.track?.duration || '0:00'}</span>
                 </div>
               </div>

               <div className="flex items-center justify-center gap-8 py-4">
                  <button onClick={() => sendCommand('back')} className="p-4 bg-white/5 rounded-3xl hover:bg-white/10 transition-all text-zinc-400 hover:text-white group">
                    <SkipBack className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => sendCommand('pause')}
                    className="w-20 h-20 bg-gradient-to-br from-discord to-vibrant-pink rounded-[2.5rem] flex items-center justify-center shadow-xl hover:scale-105 transition-all text-white glow-pink"
                  >
                    {stats?.paused ? <Play className="w-8 h-8 fill-current translate-x-0.5" /> : <Pause className="w-8 h-8 fill-current" />}
                  </button>
                  <button onClick={() => sendCommand('skip')} className="p-4 bg-white/5 rounded-3xl hover:bg-white/10 transition-all text-zinc-400 hover:text-white group">
                    <SkipForward className="w-6 h-6" />
                  </button>
               </div>
            </div>

            <div className="w-full space-y-6 pt-8">
               <div className="flex items-center gap-4">
                  <Volume2 className="w-5 h-5 text-zinc-500" />
                  <div className="relative flex-grow h-1 bg-white/5 rounded-full cursor-pointer group">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={volume}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setVolume(val);
                        sendCommand('volume', { volume: val });
                      }}
                      className="absolute inset-0 w-full opacity-0 z-10 cursor-pointer" 
                    />
                    <div className="absolute top-0 left-0 h-full bg-white/20 rounded-full group-hover:bg-discord transition-colors" style={{ width: `${volume}%` }} />
                  </div>
               </div>

               <div className="flex items-center justify-between text-zinc-600">
                  <button className="hover:text-white transition-colors"><Users className="w-4 h-4" /></button>
                  <button className="hover:text-white transition-colors"><Repeat className="w-4 h-4" /></button>
                  <button className={`hover:text-white transition-colors ${stats?.repeatMode !== 'off' ? 'text-discord' : ''}`}><Repeat className="w-4 h-4" /></button>
                  <button className="hover:text-white transition-colors"><SlidersHorizontal className="w-4 h-4" /></button>
               </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
