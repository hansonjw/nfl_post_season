import { useState } from 'react'
import './App.css'
import { Scoreboard, Bracket, AdminPlayers, AdminGames } from './components'

function App() {
  const [view, setView] = useState<'scoreboard' | 'bracket' | 'admin-players' | 'admin-games'>('scoreboard')

  try {
    return (
      <div className="app">
        <header className="app-header">
          <h1>NFL Playoffs Pick 'Em</h1>
          <p>Family Weekly Pick Game</p>
          <nav className="app-nav">
            <button 
              className={view === 'scoreboard' ? 'active' : ''}
              onClick={() => setView('scoreboard')}
            >
              Scoreboard
            </button>
            <button 
              className={view === 'bracket' ? 'active' : ''}
              onClick={() => setView('bracket')}
            >
              Bracket
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
  } catch (error) {
    console.error('App render error:', error)
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h1>Error Loading App</h1>
        <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
        <pre>{error instanceof Error ? error.stack : String(error)}</pre>
      </div>
    )
  }
}

export default App
