// components/AutoNotes.jsx
import React, { useState, useEffect, useRef } from 'react';

const AutoNotes = ({ isActive, addNoteTrigger }) => { // Changed prop name
  const [notes, setNotes] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const textareaRef = useRef(null);

  // Default notes that always show when activated
  const defaultNotes = [
    { id: 1, text: "Click to edit this note", x: 50, y: 100, color: '#fff9c4' },
    { id: 2, text: "Drag header to move note", x: 50, y: 200, color: '#c8e6c9' }
  ];

  // Load notes
  useEffect(() => {
    if (!isActive) return;
    
    const saved = localStorage.getItem('auto-notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        setNotes(defaultNotes);
      }
    } else {
      setNotes(defaultNotes);
    }
  }, [isActive]);

  // Save notes
  useEffect(() => {
    localStorage.setItem('auto-notes', JSON.stringify(notes));
  }, [notes]);

  // Focus textarea
  useEffect(() => {
    if (editingNote && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingNote]);

  // Add note when trigger changes (each click adds a note)
  useEffect(() => {
    if (!isActive || !addNoteTrigger) return;
    
    addNewNote();
  }, [addNoteTrigger, isActive]);

  // Prevent text selection during drag
  useEffect(() => {
    const preventSelection = (e) => {
      if (dragging) {
        e.preventDefault();
      }
    };

    document.addEventListener('selectstart', preventSelection);
    
    return () => {
      document.removeEventListener('selectstart', preventSelection);
    };
  }, [dragging]);

  // Drag handling
  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      setNotes(prevNotes => 
        prevNotes.map(n => 
          n.id === dragging.id ? {
            ...n,
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
          } : n
        )
      );
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      setDragging(null);
      window.getSelection().removeAllRanges();
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset]);

  // Add note function
  const addNewNote = () => {
    const newNote = {
      id: Date.now(),
      text: `Note ${notes.length + 1} - click to edit`,
      x: 100 + (notes.length * 30),
      y: 100 + (notes.length * 30),
      color: notes.length % 3 === 0 ? '#bbdefb' : 
             notes.length % 3 === 1 ? '#ffccbc' : 
             '#c8e6c9'
    };
    
    setNotes([...notes, newNote]);
    setEditingNote(newNote.id);
    setEditText(newNote.text);
  };

  // Start editing
  const startEditing = (noteId, e) => {
    if (e) e.stopPropagation();
    if (dragging) return;
    
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditingNote(noteId);
      setEditText(note.text);
    }
  };

  // Save edit
  const saveEdit = (noteId) => {
    if (!editText.trim()) {
      setShowDeleteConfirm(noteId);
    } else {
      setNotes(notes.map(n => 
        n.id === noteId ? { ...n, text: editText } : n
      ));
    }
    setEditingNote(null);
  };

  // Handle textarea keys
  const handleKeyDown = (e, noteId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit(noteId);
    } else if (e.key === 'Escape') {
      setEditingNote(null);
    }
  };

  // Delete note
  const deleteNote = (noteId, e) => {
    if (e) e.stopPropagation();
    setNotes(notes.filter(n => n.id !== noteId));
    setShowDeleteConfirm(null);
  };

  // Confirm delete
  const confirmDelete = (noteId, e) => {
    if (e) e.stopPropagation();
    setShowDeleteConfirm(noteId);
  };

  // Cancel delete
  const cancelDelete = (e) => {
    if (e) e.stopPropagation();
    setShowDeleteConfirm(null);
  };

  // Start dragging - ONLY from header
  const startDragging = (note, e) => {
    if (editingNote === note.id || showDeleteConfirm === note.id) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    window.getSelection().removeAllRanges();
    
    setDragging(note);
    setDragOffset({
      x: e.clientX - note.x,
      y: e.clientY - note.y
    });
  };

  if (!isActive) return null;

  return (
    <>
      {/* Show all notes */}
      {notes.map(note => (
        <div
          key={note.id}
          className="fixed z-40 shadow-lg rounded-lg max-w-xs min-w-[180px] select-none"
          style={{
            left: `${note.x}px`,
            top: `${note.y}px`,
            backgroundColor: note.color,
            border: '1px solid rgba(0,0,0,0.15)',
            transform: editingNote === note.id ? 'scale(1.02)' : 'scale(1)',
            zIndex: editingNote === note.id ? 50 : 40,
            opacity: showDeleteConfirm === note.id ? 0.8 : 1,
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* Delete confirmation */}
          {showDeleteConfirm === note.id && (
            <div 
              className="absolute inset-0 bg-red-50 bg-opacity-90 rounded-lg flex flex-col items-center justify-center z-10 p-3"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="text-sm font-medium text-red-700 mb-2">Delete this note?</div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => deleteNote(note.id, e)}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Draggable header with X button */}
          <div 
            className="flex justify-between items-center p-2 border-b border-gray-300 bg-gray-800 bg-opacity-10 rounded-t cursor-move select-none"
            onMouseDown={(e) => startDragging(note, e)}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <span className="text-xs text-gray-600 select-none">Note</span>
            <button
              onClick={(e) => confirmDelete(note.id, e)}
              className="text-gray-500 hover:text-red-600 text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors select-none"
              title="Delete note"
              style={{ userSelect: 'none' }}
            >
              ✕
            </button>
          </div>

          {/* Note content - click to edit */}
          <div 
            className="p-3 min-h-[70px] cursor-text select-text"
            onClick={(e) => startEditing(note.id, e)}
            style={{ userSelect: 'text' }}
          >
            {editingNote === note.id ? (
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, note.id)}
                onBlur={() => saveEdit(note.id)}
                className="w-full bg-transparent border-none outline-none resize-none text-sm select-text"
                rows={2}
                autoFocus
                style={{ userSelect: 'text' }}
              />
            ) : (
              <div className="text-sm whitespace-pre-wrap break-words select-text">
                {note.text}
              </div>
            )}
          </div>

          {/* Editing instructions */}
          {editingNote === note.id && (
            <div className="text-xs text-gray-500 px-3 pb-2 border-t border-gray-200 pt-1 select-none">
              Press Enter to save, click outside to cancel
            </div>
          )}
        </div>
      ))}

      {/* Click overlay to save edit */}
      {editingNote && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => saveEdit(editingNote)}
          style={{ cursor: 'default', userSelect: 'none' }}
        />
      )}

      {/* Drag overlay to prevent text selection */}
      {dragging && (
        <div 
          className="fixed inset-0 z-30"
          style={{ 
            cursor: 'grabbing',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        />
      )}
    </>
  );
};

export default AutoNotes;