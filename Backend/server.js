require("dotenv").config();
const express = require("express");
const { Groq } = require("groq-sdk");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const app = express();
const PORT = 3000;

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files from the videos directory
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Function to call Claude API
async function callClaudeAPI(userPrompt) {
  console.log("Calling Claude API with prompt:", userPrompt);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: userPrompt
          }
        ]
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Claude API Response:", data);
    return data.content[0]?.text || "";
  } catch (error) {
    console.error("Error calling Claude API:", error);
    if (error.name === 'AbortError') {
      throw new Error('Claude API request timed out after 30 seconds');
    } else if (error.code === 'UND_ERR_CONNECT_TIMEOUT') {
      throw new Error('Claude API connection timeout - please check your internet connection');
    } else {
      throw new Error(`Claude API error: ${error.message}`);
    }
  }
}
async function callClaudeAPIWithSystem(userPrompt, systemPrompt) {
  console.log("Calling Claude API with custom system prompt");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt
          }
        ]
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Claude API Response:", data);
    return data.content[0]?.text || "";
  } catch (error) {
    console.error("Error calling Claude API:", error);
    if (error.name === 'AbortError') {
      throw new Error('Claude API request timed out after 30 seconds');
    } else if (error.code === 'UND_ERR_CONNECT_TIMEOUT') {
      throw new Error('Claude API connection timeout - please check your internet connection');
    } else {
      throw new Error(`Claude API error: ${error.message}`);
    }
  }
}

// Function to call Groq API
async function callGroqAPI(userPrompt) {
  console.log("Calling Groq API with prompt:", userPrompt);

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an educational AI assistant built to help students understand and visualize concepts interactively. 
Your job is to teach, not just tell. You adapt your explanations to the user's preferred learning style: visual, practical, or auditory.
When responding:
- Simplify complex ideas with examples, analogies, or diagrams.
- For **visual learners**, describe diagrams or sketches for the whiteboard.
- For **practical learners**, give example-based reasoning or real-world exercises.
- For **auditory learners**, explain in spoken-style language.
- Use LaTeX notation wrapped in $$ for math, e.g. $$x^2 + y^2 = r^2$$.
- Be concise, interactive, and encourage experimentation.
- Suggest actions like 'try sketching a parabola opening upward' when appropriate.
- If the user draws something, interpret or explain it.
- Focus on helping the user *understand*, not just giving answers. Dont use bullet points in the explanation, use paragraphs instead. 
- Help the user and dont focus on giving answers, give an explentaion that is easy to follow. dont ask the user any follow up questions
- you should not act as an LLM. Act as a teacher and do not thank or say anything related to the question. Simply give the explenation step by step`
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
      stop: null
    });

    console.log("Groq API Response:", chatCompletion);
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw new Error(`Groq API error: ${error.message}`);
  }
}

async function callGroqAPIWithSystem(userPrompt, systemPrompt) {
  console.log("Calling Groq API with custom system prompt");

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
      stop: null
    });

    console.log("Groq API Response:", chatCompletion);
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw new Error(`Groq API error: ${error.message}`);
  }
}

app.get("/", (req, res) => {
  res.send("API is up");
});

app.post("/userQuestionText", async (req, res) => {
  console.log("=== /userQuestionText endpoint called ===");
  console.log("Request body:", req.body);

  try {
    const userPrompt = req.body.prompt;
    const educationLevel = req.body.educationLevel || 'high-school';
    const learningStyle = req.body.learningStyle || 'visual';

    if (!userPrompt) {
      console.log("Error: No prompt provided");
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.GROQ_API_KEY) {
      console.log("Error: GROQ_API_KEY not configured");
      console.log(
        "Available env vars:",
        Object.keys(process.env).filter((k) => k.includes("GROQ"))
      );
      return res.status(500).json({ error: "GROQ_API_KEY not configured" });
    }

    console.log("API Key found, calling Groq API...");
    console.log(`User settings - Education: ${educationLevel}, Learning Style: ${learningStyle}`);
    
    // Create enhanced prompt with user settings
    const enhancedPrompt = `User Education Level: ${educationLevel}
User Learning Style: ${learningStyle}
User Question: ${userPrompt}

Please tailor your response to match their education level and learning style.`;
    
    // Call Groq API with the enhanced prompt
    const groqResponse = await callGroqAPI(enhancedPrompt);

    console.log("Successfully got response from Groq");
    res.json({
      promptReceived: userPrompt,
      response: groqResponse,
      success: true,
    });
  } catch (error) {
    console.error("Error in /userQuestionText:", error);
    res.status(500).json({
      error: "Failed to get response from Claude API",
      message: error.message,
    });
  }
});

// ...existing code...
app.post("/userQuestionQuiz", async (req, res) => {
  console.log("=== /userQuestionQuiz endpoint called ===");
  console.log("Request body:", req.body);

  try {
    const topic = req.body.topic;
    const educationLevel = req.body.educationLevel || 'high-school';
    const learningStyle = req.body.learningStyle || 'visual';

    if (!topic) {
      console.log("Error: No topic provided");
      return res.status(400).json({ error: "Topic is required" });
    }

    if (!process.env.GROQ_API_KEY) {
      console.log("Error: GROQ_API_KEY not configured");
      return res.status(500).json({ error: "GROQ_API_KEY not configured" });
    }

    console.log(`User settings - Education: ${educationLevel}, Learning Style: ${learningStyle}`);

    const quizSystemPrompt = `You are a quiz generator. Generate exactly 5 multiple choice questions on the given topic.
User Education Level: ${educationLevel}
User Learning Style: ${learningStyle}

Return ONLY valid JSON (no markdown, no code blocks, no extra text) in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
    "correctAnswer": "A) First option",
    "explanation": "Brief explanation of why this is correct"
  }
]

Important rules:
- Generate exactly 5 questions
- Each question must have exactly 4 options labeled A), B), C), D)
- correctAnswer must exactly match one of the options (including the letter prefix)
- Keep questions clear and educational
- Provide helpful explanations
- Tailor difficulty and style to the user's education level (${educationLevel})
- Adapt question format to their learning style (${learningStyle})
- For each question have a very easy question, 2 easy questions 1 medium question and 1 hard question`;

    const quizPrompt = `Generate a quiz on the topic: "${topic}"`;

    console.log("API Key found, calling Groq API for quiz...");
    const groqResponse = await callGroqAPIWithSystem(
      quizPrompt,
      quizSystemPrompt
    );

    // Try to parse the JSON response
    let quiz;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanResponse = groqResponse.trim();

      // Remove markdown code fences
      cleanResponse = cleanResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");

      // Extract JSON array - look for the outermost array
      const jsonMatch = cleanResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);

      if (jsonMatch) {
        quiz = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the whole response
        quiz = JSON.parse(cleanResponse);
      }

      // Validate the quiz structure
      if (!Array.isArray(quiz)) {
        throw new Error("Response is not an array");
      }

      if (quiz.length !== 5) {
        console.warn(`Expected 5 questions, got ${quiz.length}`);
      }

      // Validate each question
      quiz.forEach((q, index) => {
        if (
          !q.question ||
          !Array.isArray(q.options) ||
          !q.correctAnswer ||
          !q.explanation
        ) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }
        if (q.options.length !== 4) {
          throw new Error(`Question ${index + 1} must have exactly 4 options`);
        }
        if (!q.options.includes(q.correctAnswer)) {
          throw new Error(
            `Question ${index + 1}: correctAnswer must match one of the options`
          );
        }
      });

      console.log(
        `Successfully parsed and validated quiz with ${quiz.length} questions`
      );
    } catch (parseError) {
      console.error("Failed to parse quiz JSON:", parseError);
      console.error("Raw response:", groqResponse);
      return res.status(500).json({
        error: "Failed to parse quiz from Groq",
        details: parseError.message,
        raw: groqResponse.substring(0, 500), // Send first 500 chars for debugging
      });
    }

    res.json({
      topic: topic,
      quiz: quiz,
      success: true,
    });
  } catch (error) {
    console.error("Error in /userQuestionQuiz:", error);
    res.status(500).json({
      error: "Failed to generate quiz",
      message: error.message,
    });
  }
});

app.post("/updateUserSettings", (req, res) => {
  const newSettings = req.body.settings;

  res.send({
    text: "settings have been updated",
  });
});

app.post("/createVideo", async (req, res) => { 
    const masterPrompt = `You will be creating a manim animation in python. Respond ONLY with code - no explanations, no questions, no other text. If the animation requested is not possible, create a blank animation. For any topic, pick a simple fundamental case. Do not use ffmpeg, avconv, or any external libraries beyond manim. 
Requirements:
- Video duration: 20 - 30 seconds make sure you focus on the animation being as clear and intuitive as possible above all other directions besides the sntax and libraries
- Class name: create_video (exactly this name)
- Include a brief introduction title (0.5-1 second)
- Show visual graphic representations that build intuition
- Connect all visual elements to equations/formulas when applicable
- For algorithms: show step-by-step variable updates with clear labels
- Avoid overlapping text by using strategic positioning (to_edge, to_corner, shift, next_to)
- Use color coding to distinguish different states/steps (e.g., YELLOW for processing, GREEN for completed, BLUE for final)
- Keep animations smooth with appropriate run_time parameters
- Ensure text is readable (font_size 22-40 depending on importance)
- Use FadeOut transitions between major steps to prevent clutter
- The class name should always be "create_video" (not "CreateVideo" or any other variation)
- example working output from manim import, it should be in the same exact format, just different animation. 
- dont use any external libraries besides manim
- IMPORTANT: Use only Text() for text rendering, never use MathTex, Tex, or any LaTeX-based text
- Avoid mathematical symbols that require LaTeX compilation
- Use simple text strings instead of LaTeX expressions
- For equations, use plain text like "x^2 + y^2 = r^2" instead of LaTeX syntax
- DO NOT use Latex syntax DO NOT use libraries besides Manim. 
-NEVER have  compile_tex    
 from manim import *
class create_video(Scene):
    def construct(self):
        # Title
        title = Text("Curl of a Vector Field", font_size=40, color=BLUE)
        self.play(Write(title))
        self.wait(0.5)
        self.play(FadeOut(title))
        # Create a grid
        grid = NumberPlane(
            x_range=[-3, 3, 1],
            y_range=[-3, 3, 1],
            background_line_style={
                "stroke_color": GRAY,
                "stroke_width": 1,
                "stroke_opacity": 0.3
            }
        ).scale(0.8)
        # Rotating vector field
        def rotating_field(pos):
            x, y = pos[0], pos[1]
            return np.array([-y, x, 0]) * 0.3
        # Create vector field
        vectors = []
        for x in np.arange(-2.5, 3, 0.8):
            for y in np.arange(-2.5, 3, 0.8):
                start_pos = np.array([x, y, 0]) * 0.8
                direction = rotating_field(start_pos)
                if np.linalg.norm(direction) > 0.01:
                    arrow = Arrow(
                        start_pos,
                        start_pos + direction,
                        buff=0,
                        stroke_width=3,
                        max_tip_length_to_length_ratio=0.2,
                        color=YELLOW
                    )
                    vectors.append(arrow)
        vector_group = VGroup(*vectors)
        self.play(Create(grid), run_time=1)
        self.play(Create(vector_group), run_time=2)
        # Add curl label
        curl_label = Text("Positive Curl", font_size=32, color=GREEN).to_edge(UP)
        self.play(Write(curl_label))
        # Create rotation indicator at origin
        circle = Circle(radius=0.5, color=GREEN, stroke_width=4).move_to(ORIGIN)
        self.play(Create(circle), run_time=1)
        # Rotation arrow
        rotation_arrow = CurvedArrow(
            start_point=circle.point_from_proportion(0.75),
            end_point=circle.point_from_proportion(0.25),
            color=GREEN,
            stroke_width=5
        )
        self.play(Create(rotation_arrow), run_time=1)
        self.wait(1)
        # Fade rotation indicators
        self.play(FadeOut(circle), FadeOut(rotation_arrow))
        # Show curl formula
        formula = Text("curl = dF_y/dx - dF_x/dy", font_size=28, color=WHITE).to_edge(DOWN)
        self.play(Write(formula))
        self.wait(1)
        # Highlight vectors in yellow during rotation
        self.play(vector_group.animate.set_color(BLUE), run_time=1)
        self.wait(1)
        # Show counterclockwise rotation with traced path
        dot = Dot(color=RED, radius=0.08).move_to([1.6, 0, 0])
        self.play(FadeIn(dot))
        path = Circle(radius=2, color=RED, stroke_width=3).scale(0.8)
        self.play(MoveAlongPath(dot, path), run_time=3, rate_func=linear)
        self.wait(1)
        # Fade all
        self.play(
            FadeOut(grid),
            FadeOut(vector_group),
            FadeOut(curl_label),
            FadeOut(formula),
            FadeOut(dot),
            run_time=1
        )
        # Final message
        final = Text("Curl measures rotation", font_size=36, color=GREEN)
        self.play(Write(final))
        self.wait(1)
        self.play(FadeOut(final))
Anything passed the dollar sign is the topic $`
  try {   
    const userPrompt = req.body.prompt;

    const claudeResponse = await callClaudeAPI(masterPrompt + " " + userPrompt);

    res.json({
      response: claudeResponse,
      success: true,
    });
  } catch (error) {
    console.error("Error in /createVideo:", error);
    res.status(500).json({
      error: "Failed to create video",
      message: error.message,
    });
  }
});

app.post("/executeManim", upload.single('script'), async (req, res) => {
  console.log("=== /executeManim endpoint called ===");
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No script file provided" });
    }

    // Create videos directory if it doesn't exist
    const videosDir = path.join(__dirname, 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    // Read the uploaded script
    const scriptContent = fs.readFileSync(req.file.path, 'utf8');
    console.log("Script content:", scriptContent.substring(0, 200) + "...");
    
    // Create scripts directory if it doesn't exist
    const scriptsDir = path.join(__dirname, 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }
    
    // Create a temporary Python file with proper Manim structure
    const tempFileName = `manim_script_${Date.now()}.py`;
    const tempFilePath = path.join(scriptsDir, tempFileName);
    
    // Wrap the script in proper Manim structure if needed
    let wrappedScript = scriptContent;
    if (!scriptContent.includes('from manim import')) {
      wrappedScript = `from manim import *
${scriptContent}`;
    }
    
    fs.writeFileSync(tempFilePath, wrappedScript);
    console.log(`Created temporary script file: ${tempFilePath}`);
    
    // Execute the Manim script - videos will be generated in the same directory as the script
    const manimCommand = `manim -ql ${tempFilePath} create_video`;
    console.log(`Executing command: ${manimCommand}`);
    console.log(`Script content preview:`, wrappedScript.substring(0, 300));
    
    exec(manimCommand, { 
      timeout: 20000, // 20 second timeout
      cwd: scriptsDir, // Run from scripts directory
      env: { ...process.env, PYTHONPATH: process.env.PYTHONPATH || '' }
    }, (error, stdout, stderr) => {
      console.log("Manim stdout:", stdout);
      console.log("Manim stderr:", stderr);
      
      // Clean up temporary files
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      if (error) {
        console.error("Manim execution error:", error);
        return res.status(500).json({
          error: "Failed to execute Manim script",
          details: error.message,
          stderr: stderr,
          stdout: stdout
        });
      }
      
      // Look for the generated video file in the scripts directory (same as the Python file)
      const scriptName = tempFileName.replace('.py', '');
      const mediaDir = path.join(scriptsDir, 'media', 'videos', scriptName);
      
      console.log(`Looking for video in: ${mediaDir}`);
      
      // Find the generated video file - check multiple quality directories
      let videoFile = null;
      const possibleDirs = ['1080p60', '480p15', '720p30'];
      
      for (const qualityDir of possibleDirs) {
        const outputDir = path.join(mediaDir, qualityDir);
        console.log(`Checking directory: ${outputDir}`);
        if (fs.existsSync(outputDir)) {
          const files = fs.readdirSync(outputDir);
          console.log(`Files in ${qualityDir}:`, files);
          // Look specifically for create_video.mp4
          const createVideoFile = files.find(file => file === 'create_video.mp4');
          if (createVideoFile) {
            videoFile = path.join(outputDir, createVideoFile);
            console.log(`Found create_video.mp4 in ${qualityDir}: ${videoFile}`);
            break;
          }
          // Fallback to any mp4 file if create_video.mp4 not found
          const mp4Files = files.filter(file => file.endsWith('.mp4'));
          if (mp4Files.length > 0) {
            videoFile = path.join(outputDir, mp4Files[0]);
            console.log(`Found video file in ${qualityDir}: ${videoFile}`);
            break;
          }
        } else {
          console.log(`Directory does not exist: ${outputDir}`);
        }
      }
      
      if (videoFile && fs.existsSync(videoFile)) {
        // Copy the video to our videos directory
        const finalFileName = `video_${Date.now()}.mp4`;
        const finalPath = path.join(videosDir, finalFileName);
        
        try {
          fs.copyFileSync(videoFile, finalPath);
          const videoUrl = `/videos/${finalFileName}`;
          console.log(`Video created successfully: ${videoUrl}`);
          
          res.json({
            success: true,
            videoUrl: videoUrl,
            message: "Video generated successfully"
          });
        } catch (copyError) {
          console.error("Error copying video file:", copyError);
          res.status(500).json({
            error: "Failed to copy generated video",
            details: copyError.message
          });
        }
      } else {
        console.error("Video file was not created or timed out, using test video");
        
        // Use the test video as fallback
        const testVideoPath = path.join(__dirname, 'media', 'videos', 'test_manim', '480p15', 'TestVideo.mp4');
        
        if (fs.existsSync(testVideoPath)) {
          const finalFileName = `test_video_${Date.now()}.mp4`;
          const finalPath = path.join(videosDir, finalFileName);
          
          try {
            fs.copyFileSync(testVideoPath, finalPath);
            const videoUrl = `/videos/${finalFileName}`;
            console.log(`Using test video: ${videoUrl}`);
            
            res.json({
              success: true,
              videoUrl: videoUrl,
              message: "Using test video (Manim timed out or failed)"
            });
          } catch (copyError) {
            console.error("Error copying test video:", copyError);
            res.status(500).json({
              error: "Failed to copy test video",
              details: copyError.message
            });
          }
        } else {
          res.status(500).json({
            error: "Video file was not generated and test video not available",
            stdout: stdout,
            stderr: stderr,
            searchedPath: mediaDir
          });
        }
      }
    });
    
  } catch (error) {
    console.error("Error in /executeManim:", error);
    res.status(500).json({
      error: "Failed to execute Manim script",
      message: error.message,
    });
  }
});

// Test endpoint to check if Manim is working
app.get("/test-manim", (req, res) => {
  const testScript = `from manim import *

class TestVideo(Scene):
    def construct(self):
        text = Text("Hello Manim!", font_size=48)
        self.play(Write(text))
        self.wait(1)`;

  const testFilePath = path.join(__dirname, 'test_manim.py');
  fs.writeFileSync(testFilePath, testScript);
  
  exec(`manim -pql ${testFilePath} TestVideo`, { timeout: 30000 }, (error, stdout, stderr) => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    if (error) {
      res.json({ 
        success: false, 
        error: error.message, 
        stderr: stderr,
        stdout: stdout 
      });
    } else {
      res.json({ 
        success: true, 
        message: "Manim is working",
        stdout: stdout 
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
