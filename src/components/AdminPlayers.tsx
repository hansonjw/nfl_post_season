import { useEffect, useState } from 'react';
import { fetchPlayers, createPlayer, updatePlayer, deletePlayer } from '../api/client';
import type { Player } from '../types';
import './AdminPlayers.css';

export function AdminPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', color: '#FF5733' });

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPlayers();
      setPlayers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load players');
      console.error('Error loading players:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(playerId?: string) {
    try {
      if (playerId) {
        // Update existing player
        await updatePlayer(playerId, formData);
      } else {
        // Create new player
        await createPlayer(formData.name, formData.color);
      }
      await loadPlayers();
      setEditingId(null);
      setShowAddForm(false);
      setFormData({ name: '', color: '#FF5733' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save player');
      console.error('Error saving player:', err);
    }
  }

  async function handleDelete(playerId: string) {
    if (!confirm('Are you sure you want to delete this player?')) {
      return;
    }
    try {
      await deletePlayer(playerId);
      await loadPlayers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete player');
      console.error('Error deleting player:', err);
    }
  }

  function handleEdit(player: Player) {
    setEditingId(player.id);
    setFormData({ name: player.name, color: player.color || '#FF5733' });
    setShowAddForm(false);
  }

  function handleCancel() {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: '', color: '#FF5733' });
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <p>Loading players...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <p>Error: {error}</p>
        <button onClick={loadPlayers}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-players">
      <div className="admin-header">
        <h2>Manage Players</h2>
        <button 
          className="admin-add-button"
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            setFormData({ name: '', color: '#FF5733' });
          }}
        >
          + Add Player
        </button>
      </div>

      {showAddForm && (
        <div className="admin-form">
          <h3>Add Player</h3>
          <div className="admin-form-row">
            <label>
              Name:
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Player name"
              />
            </label>
            <label>
              Color:
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button onClick={() => handleSave()}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-list">
        {players.map((player) => (
          <div key={player.id} className="admin-item">
            {editingId === player.id ? (
              <div className="admin-form">
                <div className="admin-form-row">
                  <label>
                    Name:
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Color:
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </label>
                </div>
                <div className="admin-form-actions">
                  <button onClick={() => handleSave(player.id)}>Save</button>
                  <button onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="admin-item-content">
                  <div 
                    className="admin-item-color"
                    style={{ backgroundColor: player.color || '#FF5733' }}
                  />
                  <span className="admin-item-name">{player.name}</span>
                </div>
                <div className="admin-item-actions">
                  <button 
                    className="admin-edit-button"
                    onClick={() => handleEdit(player)}
                  >
                    Edit
                  </button>
                  <button 
                    className="admin-delete-button"
                    onClick={() => handleDelete(player.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
