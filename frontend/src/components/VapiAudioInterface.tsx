import { useEffect, useState, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { useUserSettings } from '../contexts/UserSettingsContext';
import './VapiAudioInterface.css';

interface VapiAudioInterfaceProps {
  subject: string;
  isActive: boolean;
  onClose: () => void;
}

export default function VapiAudioInterface({ subject, isActive, onClose }: VapiAudioInterfaceProps) {
  const { settings } = useUserSettings();
  const [isCallActive, setIsCallActive] = useState(false);
  const [vapiMessage, setVapiMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    // Initialize Vapi
    const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      console.error('Vapi public key not found. Please add VITE_VAPI_PUBLIC_KEY to your .env file');
      return;
    }

    vapiRef.current = new Vapi(publicKey);

    // Event listeners
    vapiRef.current.on('call-start', () => {
      console.log('Call started');
      setIsCallActive(true);
      setCallStatus('active');
      setVapiMessage(''); // Clear any previous transcript
    });

    vapiRef.current.on('call-end', () => {
      console.log('Call ended');
      setIsCallActive(false);
      setCallStatus('ended');
      setVapiMessage(''); // Clear transcript when call ends
      setTimeout(() => {
        onClose();
      }, 2000);
    });

    vapiRef.current.on('message', (message: any) => {
      console.log('Vapi message:', message);
      if (message.type === 'transcript' && message.role === 'assistant') {
        setVapiMessage(message.transcript);
      }
    });

    vapiRef.current.on('error', (error: any) => {
      console.error('Vapi error:', error);
      setCallStatus('ended');
      setVapiMessage(''); // Clear transcript on error
    });

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, [onClose]);

  const startCall = async () => {
    if (!vapiRef.current) return;

    try {
      setCallStatus('connecting');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Get assistant configuration from backend
      const response = await fetch(`${apiUrl}/vapi/create-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject,
          learningStyle: settings.learningStyle 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create assistant');
      }

      const { assistantId } = await response.json();

      // Start the call with the assistant
      await vapiRef.current.start(assistantId);
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus('idle');
      alert('Failed to start voice session. Please check your Vapi configuration.');
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    setVapiMessage(''); // Clear transcript when manually ending
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (isActive && !isCallActive && callStatus === 'idle') {
      startCall();
    }
  }, [isActive]);

  // Reset transcript when component becomes inactive
  useEffect(() => {
    if (!isActive) {
      setVapiMessage('');
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="vapi-audio-interface">
      <div className="vapi-container">
        <div className="vapi-header">
          <h3>🎧 Audio Learning Session</h3>
          <button onClick={onClose} className="close-btn" aria-label="Close">
            ×
          </button>
        </div>

        <div className="vapi-content">
          <div className="subject-badge">
            <span>Learning: {subject}</span>
          </div>

          {callStatus === 'connecting' && (
            <div className="status-message">
              <div className="loading-spinner"></div>
              <p>Connecting to your AI tutor...</p>
            </div>
          )}

          {isCallActive && (
            <div className="audio-visualizer">
              <div className="pulse-ring"></div>
              <div className="audio-icon">🎤</div>
            </div>
          )}

          {callStatus === 'ended' && (
            <div className="status-message">
              <p>Session ended. Thank you for learning with us!</p>
            </div>
          )}

          {vapiMessage && (
            <div className="transcript-display">
              <p>{vapiMessage}</p>
            </div>
          )}

          <div className="vapi-controls">
            {!isCallActive && callStatus === 'idle' ? (
              <button onClick={startCall} className="start-btn">
                🎙️ Start Learning Session
              </button>
            ) : isCallActive ? (
              <>
                <button 
                  onClick={toggleMute} 
                  className={`mute-btn ${isMuted ? 'muted' : ''}`}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? '🔇 Unmute' : '🔊 Mute'}
                </button>
                <button onClick={endCall} className="end-btn">
                  📞 End Session
                </button>
              </>
            ) : null}
          </div>

          {isCallActive && (
            <div className="vapi-tips">
              <p>💡 Speak naturally and ask questions anytime!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
