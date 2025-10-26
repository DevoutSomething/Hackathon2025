const { vapiSystemPrompt } = require("./config/vapiConfig");

// Vapi AI endpoint for creating assistants
app.post("/vapi/create-assistant", async (req, res) => {
  console.log("=== /vapi/create-assistant endpoint called ===");
  
  try {
    const { subject, learningStyle } = req.body;
    
    if (!subject) {
      return res.status(400).json({ error: "Subject is required" });
    }
    
    const userLearningStyle = learningStyle || 'auditory';

    if (!process.env.VAPI_PRIVATE_KEY) {
      console.log("Error: VAPI_PRIVATE_KEY not configured");
      return res.status(500).json({ 
        error: "VAPI_PRIVATE_KEY not configured. Please add it to your .env file" 
      });
    }

    console.log(`Creating Vapi assistant for subject: ${subject}, learning style: ${userLearningStyle}`);

    // Truncate subject name to fit Vapi's 40 character limit for assistant names
    // " Tutor" is 6 chars, so we limit subject to 34 chars
    const truncatedSubject = subject.length > 34 ? subject.substring(0, 34) + '...' : subject;
    const assistantName = `${truncatedSubject} Tutor`.substring(0, 40);

    // Create learning style specific greeting - more natural and human
    const learningStyleGreetings = {
      'auditory': `Hey there! I'm your AI learning tutor, and I heard you're an auditory learner who wants to learn about ${subject}. That's awesome! I can definitely teach you about that through our conversation here. And hey, feel free to stop me anytime if you have a question or want me to clarify something, okay? Does this sound good to you?`,
      'visual': `Hi! I'm your AI learning tutor. So, I understand you're a visual learner and you want to learn about ${subject}. That's great! Now, even though we're doing this through voice, I'm gonna describe everything in a really visual way - you know, help you picture the concepts in your mind. And feel free to interrupt me anytime with questions! Does that work for you?`,
      'kinesthetic': `Hey! I'm your AI learning tutor, and I heard you're a kinesthetic learner interested in ${subject}. Perfect! I'm gonna teach you through voice, but I'll focus on giving you practical, hands-on examples - things you can actually try or practice. And of course, jump in anytime with questions. Sound good?`,
      'reading-writing': `Hello! I'm your AI learning tutor. I understand you're a reading and writing learner who wants to learn about ${subject}. Great! I'll teach you through voice, but I'll make sure to structure everything really clearly - you know, in a way that's easy to take notes on. Feel free to stop me anytime if something's unclear. Does that sound like a plan?`
    };

    // Create Vapi assistant configuration with advanced human-like settings
    const assistantConfig = {
      name: assistantName,
      
      // LLM Configuration - GPT-4 Turbo for better performance
      model: {
        provider: "openai",
        model: "gpt-4-turbo",
        temperature: 0.6, // Balanced between personality (higher) and focus (lower)
        messages: [
          {
            role: "system",
            content: vapiSystemPrompt(subject, userLearningStyle)
          }
        ],
        maxTokens: 500, // Keep responses concise for natural conversation
        emotionRecognitionEnabled: true // Detect and respond to user emotions
      },
      
      // Voice Configuration - ElevenLabs for highest quality
      voice: {
        provider: "11labs",
        voiceId: "wPZU8v1TgihzaR9aQ8Wj", // Rachel - warm, professional female voice
        stability: 0.5, // Balance between expressiveness and consistency (0.4-0.6 recommended)
        similarityBoost: 0.8, // Enhance voice clarity and consistency (0.7-0.9 recommended)
        style: 0.3, // Add slight style exaggeration for more expression
        useSpeakerBoost: true // Enhance voice quality
      },
      
      firstMessage: learningStyleGreetings[userLearningStyle] || learningStyleGreetings['auditory'],
      
      // Transcriber - Deepgram for accurate speech recognition
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en",
        smartFormat: true // Auto-format transcripts
      },
      
      // Voice Activity Detection (VAD) - Critical for natural interruptions
      startSpeakingPlan: {
        waitSeconds: 0.5, // Slightly faster response for engagement
        smartEndpointingEnabled: true, // LiveKit smart endpointing
        transcriptionEndpointingPlan: {
          onPunctuationSeconds: 0.1, // Quick response after punctuation
          onNoPunctuationSeconds: 0.8, // Wait longer if no punctuation
          onNumberSeconds: 0.5 // Moderate wait after numbers
        }
      },
      
      // Stop Speaking Plan - Handle interruptions gracefully
      stopSpeakingPlan: {
        numWords: 0, // React immediately to any interruption for natural feel
        voiceSeconds: 0.2, // Optimal for detecting user speech start (0.2s recommended)
        backoffSeconds: 0.8 // Natural pause after interruption (0.5-1.0s recommended)
      },
      
      // Background Sound - Mask imperfections and create immersion
      backgroundSound: "office", // Subtle office ambiance for realism
      backgroundDenoisingEnabled: true, // Reduce background noise
      
      // Conversation Flow Settings
      silenceTimeoutSeconds: 30, // Patient with silence
      responseDelaySeconds: 0.3, // Slight delay for natural pacing
      maxDurationSeconds: 1800, // 30 minute max session
      
      // Advanced Features
      interruptionsEnabled: true, // Allow natural conversation flow
      backchannelingEnabled: true, // Respond to "uh-huh", "okay", etc.
            
      // Client Messages - Control what updates frontend receives
      clientMessages: [
        "transcript",
        "hang",
        "function-call",
        "speech-update",
        "metadata",
        "conversation-update"
      ]
    };

    console.log("Calling Vapi API to create assistant...");

    // Call Vapi API to create assistant
    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assistantConfig),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Vapi API error:", errorData);
      throw new Error(`Vapi API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("Vapi assistant created successfully:", data.id);
    
    res.json({
      assistantId: data.id,
      success: true,
    });
  } catch (error) {
    console.error("Error creating Vapi assistant:", error);
    res.status(500).json({
      error: "Failed to create Vapi assistant",
      message: error.message,
    });
  }
});

