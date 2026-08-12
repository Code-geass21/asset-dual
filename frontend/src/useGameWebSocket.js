import { useState, useEffect, useRef, useCallback } from 'react';

export function useGameWebSocket(playerId) {
  const [gameState, setGameState] = useState({
    scores: {},
    roles: {},
    currentToss: 0,
    maxTosses: 10,
    gameStarted: false,
    gameOver: false,
    resolutionPending: false,
    awaitingGuess: false,
    myRole: null,
    statusMessage: 'Connecting...',
    winner: null,
    loser: null,
    flipResult: null,
  });
  
  const [lifetimeStats, setLifetimeStats] = useState({});
  const wsRef = useRef(null);

  useEffect(() => {
    if (!playerId) return;

    // Connect using the same domain/port the browser is currently on
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setGameState(prev => ({ ...prev, statusMessage: 'Connected. Joining room...' }));
      // Slight delay to ensure connection stabilizes before joining
      setTimeout(() => ws.send(JSON.stringify({ type: 'join', player_id: playerId })), 300);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'roles':
          setGameState(prev => ({ 
            ...prev, 
            roles: message.roles,
            myRole: message.roles[playerId] || null,
            flipResult: null // Reset the coin
          }));
          break;

        case 'lifetime_stats':
          setLifetimeStats(message.stats);
          break;

        case 'state':
          setGameState(prev => ({
            ...prev,
            scores: message.scores,
            currentToss: message.current_toss,
            maxTosses: message.max_tosses,
            gameStarted: message.game_started,
            gameOver: message.game_over,
            resolutionPending: message.resolution_pending,
            awaitingGuess: message.awaiting_guess,
            statusMessage: getStatusMessage(message, prev.myRole)
          }));
          break;

        case 'guess_locked':
          setGameState(prev => ({ 
            ...prev, 
            awaitingGuess: false, 
            statusMessage: prev.myRole === 'guesser' ? 'Guess locked. Waiting for flip...' : 'Opponent locked guess. FLIP!' 
          }));
          break;

        case 'flip_result':
          setGameState(prev => ({
            ...prev,
            flipResult: message,
            statusMessage: 'Flipping... 🪙'
          }));
          break;

        case 'game_over':
          setGameState(prev => ({
            ...prev,
            gameOver: true,
            resolutionPending: message.resolution_pending,
            winner: message.winner,
            loser: message.loser,
            scores: message.scores
          }));
          break;

        case 'resolution_complete':
          setGameState(prev => ({ ...prev, resolutionPending: false, statusMessage: message.message }));
          break;

        case 'opponent_dropped':
          alert(message.message);
          setGameState(prev => ({ ...prev, statusMessage: 'Opponent left. Waiting...' }));
          break;

        case 'status':
          setGameState(prev => ({ ...prev, statusMessage: message.message }));
          break;

        case 'error':
          alert(message.message);
          break;
          
        default:
          break;
      }
    };

    ws.onclose = () => {
      setGameState(prev => ({ ...prev, statusMessage: 'Disconnected from server.' }));
    };

    return () => ws.close();
  }, [playerId]);

  // Helper function to derive the right status text
  const getStatusMessage = (msg, myRole) => {
    if (!msg.game_started) return 'Waiting for other player...';
    if (msg.resolution_pending) return 'Game frozen for resolution...';
    if (msg.game_over) return 'Game Over!';
    
    if (msg.awaiting_guess) {
      return myRole === 'guesser' ? 'Make your call!' : 'Waiting for guesser...';
    } else {
      return myRole === 'flipper' ? 'Guess locked in. FLIP!' : 'Waiting for flip...';
    }
  };

  // --- Methods to send data back to the server ---
  const sendGuess = useCallback((choice) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'guess', choice }));
    }
  }, []);

  const sendFlip = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'flip' }));
    }
  }, []);

  const sendResolveBet = useCallback((stockName, amount) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'resolve_bet', stock_name: stockName, amount }));
    }
  }, []);

  const sendPlayAgain = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'play_again' }));
    }
  }, []);

  return {
    gameState,
    lifetimeStats,
    sendGuess,
    sendFlip,
    sendResolveBet,
    sendPlayAgain
  };
}
