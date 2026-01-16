import React, { useState } from 'react';

const Dictionary = () => {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  const searchWord = async () => {
    if (!word.trim()) {
      setError('Please enter a word');
      return;
    }

    setLoading(true);
    setError('');
    setDefinition('');

    try {
      // Using Free Dictionary API
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      
      if (!response.ok) {
        throw new Error('Word not found');
      }

      const data = await response.json();
      
      if (data && data[0]) {
        const wordData = data[0];
        
        let definitions = '';
        
        // Get meanings and definitions
        if (wordData.meanings && wordData.meanings.length > 0) {
          wordData.meanings.forEach((meaning, index) => {
            definitions += `<div class="mb-4">`;
            definitions += `<h4 class="font-semibold text-blue-600">${meaning.partOfSpeech}</h4>`;
            
            if (meaning.definitions && meaning.definitions.length > 0) {
              meaning.definitions.slice(0, 3).forEach((def, defIndex) => {
                definitions += `<div class="ml-4 mb-2">`;
                definitions += `<p class="text-gray-700">${defIndex + 1}. ${def.definition}</p>`;
                
                if (def.example) {
                  definitions += `<p class="text-gray-500 italic ml-4">Example: "${def.example}"</p>`;
                }
                
                definitions += `</div>`;
              });
            }
            definitions += `</div>`;
          });
        }
        
        // Add to search history
        const newSearch = {
          word: word,
          timestamp: new Date().toLocaleTimeString(),
          success: true
        };
        
        setSearchHistory(prev => [newSearch, ...prev.slice(0, 4)]);
        localStorage.setItem('dictionary-history', JSON.stringify([newSearch, ...searchHistory.slice(0, 4)]));
        
        setDefinition(definitions);
        
        // Show success message
        const event = new CustomEvent('showToast', {
          detail: { message: `Found definition for "${word}"`, type: 'success' }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      setError('Word not found. Please try another word.');
      
      // Add failed search to history
      const newSearch = {
        word: word,
        timestamp: new Date().toLocaleTimeString(),
        success: false
      };
      
      setSearchHistory(prev => [newSearch, ...prev.slice(0, 4)]);
      localStorage.setItem('dictionary-history', JSON.stringify([newSearch, ...searchHistory.slice(0, 4)]));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchWord();
    }
  };

  const loadSearchHistory = () => {
    const saved = localStorage.getItem('dictionary-history');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  };

  React.useEffect(() => {
    loadSearchHistory();
  }, []);

  const clearHistory = () => {
    if (window.confirm('Clear search history?')) {
      setSearchHistory([]);
      localStorage.removeItem('dictionary-history');
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">📖 Dictionary</h2>
      
      <div className="mb-4">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter a word (English)..."
            disabled={loading}
          />
          <button
            onClick={searchWord}
            disabled={loading || !word.trim()}
            className={`px-4 py-2 rounded-lg font-medium ${loading || !word.trim() 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {definition && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-gray-800">{word}</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(definition.replace(/<[^>]*>/g, ''));
                  const event = new CustomEvent('showToast', {
                    detail: { message: 'Definition copied!', type: 'success' }
                  });
                  window.dispatchEvent(event);
                }}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Copy
              </button>
            </div>
            <div 
              className="text-gray-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: definition }}
            />
          </div>
        )}
      </div>

      {searchHistory.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">Recent Searches</h3>
            <button
              onClick={clearHistory}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {searchHistory.map((search, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${search.success ? 'bg-green-50' : 'bg-red-50'}`}
                onClick={() => {
                  setWord(search.word);
                  searchWord();
                }}
              >
                <div className="flex justify-between">
                  <span className={`font-medium ${search.success ? 'text-green-700' : 'text-red-700'} cursor-pointer hover:underline`}>
                    {search.word}
                  </span>
                  <span className="text-gray-500 text-xs">{search.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dictionary;