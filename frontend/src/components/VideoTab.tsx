import React, { useState, useEffect, useRef } from 'react';
import './VideoTab.css';

interface VideoResponse {
  response: string;
  success: boolean;
}

interface VideoTabProps {
  topic?: string;
}

interface VideoState {
  isReady: boolean;
  videoUrl: string | null;
  isGenerating: boolean;
  pythonScript: string | null;
  timestamp?: number;
}

const VideoTab: React.FC<VideoTabProps> = ({ topic = "mathematical concepts" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pythonScript, setPythonScript] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const generationInProgress = useRef(false);
  const currentTopic = useRef<string | null>(null);
  const hasGeneratedVideo = useRef(false);
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Storage key for session persistence
  const getStorageKey = (topic: string) => `video_state_${topic}`;

  // Load video state from sessionStorage
  const loadVideoState = (topic: string): VideoState | null => {
    try {
      const stored = sessionStorage.getItem(getStorageKey(topic));
      if (stored) {
        const state: VideoState = JSON.parse(stored);
        // Check if the video is still valid (less than 24 hours old)
        if (state.timestamp && Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
          return state;
        }
      }
    } catch (e) {
      console.error('Error loading video state:', e);
    }
    return null;
  };

  // Save video state to sessionStorage
  const saveVideoState = (topic: string, state: VideoState) => {
    try {
      const stateWithTimestamp = { ...state, timestamp: Date.now() };
      sessionStorage.setItem(getStorageKey(topic), JSON.stringify(stateWithTimestamp));
    } catch (e) {
      console.error('Error saving video state:', e);
    }
  };

  useEffect(() => {
    if (!topic) return;
    
    currentTopic.current = topic;
    const videoState = loadVideoState(topic);
    
    console.log('Checking video state for topic:', topic, videoState);
    
    if (videoState) {
      if (videoState.isReady && videoState.videoUrl) {
        // Video is ready, load it immediately
        console.log('Loading existing video for topic:', topic);
        setVideoUrl(videoState.videoUrl);
        setPythonScript(videoState.pythonScript);
        setIsVideoReady(true);
        setIsGenerating(false);
        setIsLoading(false);
        setError(null);
        hasGeneratedVideo.current = true;
        return;
      } else if (videoState.isGenerating) {
        // Video is being generated in background - start checking status
        console.log('Video was being generated in background for topic:', topic);
        setIsGenerating(true);
        setIsLoading(true);
        // Start generation process
        generateVideo();
        return;
      }
    }
    
    // No video exists, start new generation immediately
    console.log('Starting new video generation for topic:', topic);
    hasGeneratedVideo.current = false;
    setIsVideoReady(false);
    setIsGenerating(false);
    generateVideo();
  }, [topic]);

  const generateVideo = async () => {
    // Prevent multiple simultaneous generations for the same topic
    if (generationInProgress.current) {
      return;
    }
    
    generationInProgress.current = true;
    setIsLoading(true);
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setPythonScript(null);
    setIsVideoReady(false);

    // Mark this topic as being generated
    saveVideoState(topic, { 
      isReady: false, 
      videoUrl: null, 
      isGenerating: true,
      pythonScript: null
    });

    try {
      // Step 1: Call the createVideo endpoint to get Python script
      const response = await fetch(`${apiUrl}/createVideo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: topic }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: VideoResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to generate video script');
      }
      
      let lines = data.response.split('\n');     
      let middleLines = lines.slice(1, -1);
      let result = middleLines
        .filter(line => line.trim() !== '') 
        .filter(line => !line.trim().startsWith('```')) 
        .join('\n');
      
      setPythonScript(result);
      await executeManimScript(result);

    } catch (err) {
      console.error('Error generating video:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Clear generation state on error
      saveVideoState(topic, { 
        isReady: false, 
        videoUrl: null, 
        isGenerating: false,
        pythonScript: null
      });
    } finally {
      setIsLoading(false);
      generationInProgress.current = false;
    }
  };

  const executeManimScript = async (script: string) => {
    try {
      // Create a temporary Python file
      const scriptBlob = new Blob([script], { type: 'text/python' });
      const formData = new FormData();
      formData.append('script', scriptBlob, 'manim_script.py');

      // Send to backend to execute
      const response = await fetch(`${apiUrl}/executeManim`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success && result.videoUrl) {
        // Make sure the video URL is absolute
        const fullVideoUrl = result.videoUrl.startsWith('http') 
          ? result.videoUrl 
          : `${apiUrl}${result.videoUrl}`;
        
        // Store the video in sessionStorage
        const finalState: VideoState = { 
          isReady: true, 
          videoUrl: fullVideoUrl, 
          isGenerating: false,
          pythonScript: script
        };
        saveVideoState(topic, finalState);
        
        setVideoUrl(fullVideoUrl);
        setIsVideoReady(true);
        setIsGenerating(false);
        setError(null);
        hasGeneratedVideo.current = true;
      } else {
        throw new Error(result.error || 'Failed to generate video');
      }

    } catch (err) {
      console.error('Error executing Manim script:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute Python script');
      setIsGenerating(false);
      // Clear generation state on error
      saveVideoState(topic, { 
        isReady: false, 
        videoUrl: null, 
        isGenerating: false,
        pythonScript: null
      });
    }
  };

  const handleRegenerate = () => {
    // Clear stored state for this topic
    sessionStorage.removeItem(getStorageKey(topic));
    hasGeneratedVideo.current = false;
    setIsVideoReady(false);
    setIsGenerating(false);
    setIsLoading(true);
    setError(null);
    generateVideo();
  };

  return (
    <div className="video-tab">
      <div className="video-header">
        <h2>Video Generation</h2>
        <p>Creating an animated visualization for: <strong>{topic}</strong></p>
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Generating video animation...</p>
          <div className="loading-steps">
            <div className="step">1. Creating Python script</div>
            <div className="step">2. Executing with Manim</div>
            <div className="step">3. Rendering video</div>
          </div>
        </div>
      )}

      {isGenerating && !isLoading && (
        <div className="generating-container">
          <div className="loading-spinner"></div>
          <p>Video is being generated in the background...</p>
          <p className="background-note">You can navigate away and return later. The video will be ready when you come back.</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={handleRegenerate} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {videoUrl && isVideoReady && (
        <div className="video-container">
          <h3>Generated Video</h3>
          <video 
            controls 
            autoPlay
            muted
            className="generated-video"
            src={videoUrl}
            poster="/api/placeholder"
          >
            Your browser does not support the video tag.
          </video>
          <div className="video-actions">
            <a href={videoUrl} download className="download-button">
              Download Video
            </a>
            <button onClick={handleRegenerate} className="regenerate-button">
              Generate New Video
            </button>
          </div>
        </div>
      )}

      {pythonScript && (
        <div className="script-container">
          <h3>Generated Python Script</h3>
          <pre className="python-script">
            <code>{pythonScript}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default VideoTab;


