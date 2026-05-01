
import { motion } from "motion/react";
import { Bot, LayoutDashboard, Github, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const activeStyles = "text-white border-b-2 border-discord pb-1";
  const inactiveStyles = "text-zinc-400";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-6 py-3">
        <Link 
          to="/"
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2 bg-gradient-to-br from-discord to-vibrant-pink rounded-xl group-hover:rotate-12 transition-transform">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tighter uppercase">Ziji<span className="text-discord">.</span>Best</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink 
            to="/"
            className={({ isActive }) => `text-sm font-semibold uppercase tracking-widest transition-colors hover:text-white ${isActive ? activeStyles : inactiveStyles}`}
          >
            Trang chủ
          </NavLink>
          <NavLink 
            to="/dashboard"
            className={({ isActive }) => `text-sm font-semibold uppercase tracking-widest transition-colors hover:text-white ${isActive ? activeStyles : inactiveStyles}`}
          >
            Bảng điều khiển
          </NavLink>
          <a 
            href="https://github.com/ZiProject/Ziji-bot-discord" 
            target="_blank" 
            rel="noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          <Link 
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-2 bg-discord hover:brightness-110 text-white rounded-full text-sm font-bold transition-all hover:glow"
          >
            <LayoutDashboard className="w-4 h-4" />
            Vào Dashboard
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-zinc-400" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 left-6 right-6 glass rounded-2xl p-6 flex flex-col gap-4"
        >
          <Link to="/" onClick={() => setIsOpen(false)} className="text-left py-2 text-lg font-medium">Trang chủ</Link>
          <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-left py-2 text-lg font-medium">Bảng điều khiển</Link>
          <a href="https://github.com/ZiProject/Ziji-bot-discord" target="_blank" rel="noreferrer" className="flex items-center gap-2 py-2 text-lg font-medium text-zinc-400">
            <Github className="w-5 h-5" /> GitHub
          </a>
        </motion.div>
      )}
    </nav>
  );
}
