import { useState } from 'react'
import './App.css'
import { Scoreboard, Bracket, AdminPlayers, AdminGames } from './components'

function App() {
  const [view, setView] = useState<'scoreboard' | 'bracket' | 'admin-players' | 'admin-games'>('scoreboard')


  return (
    <div className="app">
      <header className="app-header">
        <h1>Hanson NFL Playoffs</h1>
        <nav className="app-nav">
              <button 
                className={view === 'scoreboard' ? 'active' : ''}
                onClick={() => setView('scoreboard')}
              >
                Leader Board
              </button>
          <button 
            className={view === 'bracket' ? 'active' : ''}
            onClick={() => setView('bracket')}
          >
            Games
          </button>
          <button 
            className={view === 'admin-games' ? 'active' : ''}
            onClick={() => setView('admin-games')}
          >
            Admin: Games
          </button>
          <button 
            className={view === 'admin-players' ? 'active' : ''}
            onClick={() => setView('admin-players')}
          >
            Admin: Players
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {view === 'scoreboard' && <Scoreboard />}
        {view === 'bracket' && <Bracket />}
        {view === 'admin-games' && <AdminGames />}
        {view === 'admin-players' && <AdminPlayers />}
      </main>
    </div>
  )
}

export default App
