import React, { useState, useEffect } from 'react';
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
  console.log(pythonScript)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (topic) {
      generateVideo();
    }
  }, [topic]);

  const generateVideo = async () => {
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setPythonScript(null);

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
      let result = middleLines.join('\n');
      setPythonScript(result);
      await executeManimScript(result);

    } catch (err) {
      console.error('Error generating video:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
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

      if (!response.ok) {
        throw new Error(`Failed to execute script: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.videoUrl) {
        // Make sure the video URL is absolute
        const fullVideoUrl = result.videoUrl.startsWith('http') 
          ? result.videoUrl 
          : `${apiUrl}${result.videoUrl}`;
        setVideoUrl(fullVideoUrl);
      } else {
        throw new Error(result.error || 'Failed to generate video');
      }

    } catch (err) {
      console.error('Error executing Manim script:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute Python script');
    }
  };

  const handleRegenerate = () => {
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

      {videoUrl && (
        <div className="video-container">
          <h3>Generated Video</h3>
          <video 
            controls 
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


