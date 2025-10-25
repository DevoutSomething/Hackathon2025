import React, { useState, useEffect, useRef } from 'react';
import './VideoTab.css';

interface VideoResponse {
  response: string;
  success: boolean;
}

interface VideoTabProps {
  topic?: string;
}

const VideoTab: React.FC<VideoTabProps> = ({ topic = "mathematical concepts" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pythonScript, setPythonScript] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const generationInProgress = useRef(false);
  const currentTopic = useRef<string | null>(null);
  const hasGeneratedVideo = useRef(false);
  
  // Video cache - stores generated videos by topic
  const videoCache = useRef<Map<string, { videoUrl: string; pythonScript: string }>>(new Map());
  
  console.log(pythonScript)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    console.log('useEffect triggered for topic:', topic);
    console.log('Current cache keys:', Array.from(videoCache.current.keys()));
    console.log('hasGeneratedVideo:', hasGeneratedVideo.current);
    console.log('generationInProgress:', generationInProgress.current);
    
    if (topic && topic !== currentTopic.current) {
      currentTopic.current = topic;
      
      // Check if we have a cached video for this topic
      const cachedVideo = videoCache.current.get(topic);
      console.log('Cached video for topic:', topic, cachedVideo);
      
      if (cachedVideo) {
        console.log('Loading cached video for topic:', topic);
        setVideoUrl(cachedVideo.videoUrl);
        setPythonScript(cachedVideo.pythonScript);
        setIsVideoReady(true);
        setError(null);
        setIsLoading(false);
        hasGeneratedVideo.current = true;
        return; // Exit early - don't generate new video
      }
      
      // No cached video, reset flags for new generation
      hasGeneratedVideo.current = false;
      setIsVideoReady(false);
    }
    
    // Only generate if no cached video exists and not already generated
    if (topic && !hasGeneratedVideo.current && !generationInProgress.current) {
      const cachedVideo = videoCache.current.get(topic);
      if (!cachedVideo) {
        console.log('No cached video found, generating new video for topic:', topic);
        hasGeneratedVideo.current = true;
        generateVideo();
      } else {
        console.log('Cached video exists, not generating new video');
      }
    }
  }, [topic]);

  const generateVideo = async () => {
    // Prevent multiple simultaneous generations
    if (generationInProgress.current) {
      return;
    }
    
    generationInProgress.current = true;
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setPythonScript(null);
    setIsVideoReady(false);

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
        
        // Cache the video for this topic
        if (topic) {
          videoCache.current.set(topic, {
            videoUrl: fullVideoUrl,
            pythonScript: script
          });
          console.log('Cached video for topic:', topic);
          console.log('Cache now contains:', Array.from(videoCache.current.keys()));
        }
        
        setVideoUrl(fullVideoUrl);
        setIsVideoReady(true); // Only show video when completely ready
        setError(null); // Clear any previous errors
      } else {
        throw new Error(result.error || 'Failed to generate video');
      }

    } catch (err) {
      console.error('Error executing Manim script:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute Python script');
    }
  };

  const handleRegenerate = () => {
    // Clear cache for current topic to force regeneration
    if (topic) {
      videoCache.current.delete(topic);
      console.log('Cleared cache for topic:', topic);
    }
    hasGeneratedVideo.current = false;
    setIsVideoReady(false);
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


