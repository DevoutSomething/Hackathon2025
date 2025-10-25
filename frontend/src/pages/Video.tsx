import React, { useState } from 'react';
import VideoTab from '../components/VideoTab';
import './Video.css';

export default function Video() {
  const [topic, setTopic] = useState('mathematical concepts');
  const [customTopic, setCustomTopic] = useState('');

  const handleTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim()) {
      setTopic(customTopic.trim());
    }
  };

  return (
    <div className="video-page">
      <div className="video-content">
        <div className="video-header">
          <h1 className="video-title">Create Educational Videos</h1>
          <p className="video-subtitle">
            Generate animated visualizations to help understand complex concepts
          </p>
        </div>

        <div className="topic-selector">
          <h3>Choose a topic for your video:</h3>
          <div className="topic-options">
            <button 
              className={`topic-btn ${topic === 'mathematical concepts' ? 'active' : ''}`}
              onClick={() => setTopic('mathematical concepts')}
            >
              Mathematical Concepts
            </button>
            <button 
              className={`topic-btn ${topic === 'physics' ? 'active' : ''}`}
              onClick={() => setTopic('physics')}
            >
              Physics
            </button>
            <button 
              className={`topic-btn ${topic === 'algorithms' ? 'active' : ''}`}
              onClick={() => setTopic('algorithms')}
            >
              Algorithms
            </button>
            <button 
              className={`topic-btn ${topic === 'data structures' ? 'active' : ''}`}
              onClick={() => setTopic('data structures')}
            >
              Data Structures
            </button>
          </div>
          
          <form onSubmit={handleTopicSubmit} className="custom-topic-form">
            <label htmlFor="customTopic">Or enter a custom topic:</label>
            <div className="input-group">
              <input
                type="text"
                id="customTopic"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g., calculus derivatives, sorting algorithms, quantum mechanics..."
                className="topic-input"
              />
              <button type="submit" className="submit-topic-btn">
                Use This Topic
              </button>
            </div>
          </form>
        </div>

        <VideoTab topic={topic} />
      </div>
    </div>
  );
}


