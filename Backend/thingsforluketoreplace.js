app.post("/createVideo", async (req, res) => { 
    const userPrompt = req.body.prompt;
    const complexity = req.body.complexity || 2; // Default to medium complexity
    
    // Build complexity instructions
    let complexityInstructions = "";
    if (complexity === 0) {
      complexityInstructions = "- ANIMATION COMPLEXITY: VERY SIMPLE (complexity level 0) - Use minimal objects (3-5 total), simple movements, basic shapes only";
    } else if (complexity === 1) {
      complexityInstructions = "- ANIMATION COMPLEXITY: SIMPLE (complexity level 1) - Use few objects (5-10 total), straightforward animations, basic transformations";
    } else if (complexity === 2) {
      complexityInstructions = "- ANIMATION COMPLEXITY: MEDIUM (complexity level 2) - Use moderate objects (8-15 total), standard animations with some complexity";
    } else if (complexity === 3) {
      complexityInstructions = "- ANIMATION COMPLEXITY: ADVANCED (complexity level 3) - Use many objects (10-20 total), complex transformations, sophisticated visuals";
    } else {
      complexityInstructions = "- ANIMATION COMPLEXITY: VERY ADVANCED (complexity level 4) - Use maximum objects (15-25 total), highly complex animations, intricate visual effects";
    }
    
    const masterPrompt = `You will be creating a manim animation in python. Respond ONLY with code - no explanations, no questions, no other text. If the animation requested is not possible, create a blank animation. For any topic, pick a simple fundamental case. Do not use ffmpeg, avconv, or any external libraries beyond manim. 
Requirements:
${complexityInstructions}
- Video duration: 15 - 25 seconds - SHORT and focused for faster rendering
- Make sure the animation reflects to the source material and reflects the actual behaior of the topic
- Minimize wait times - use 0.5-1 second waits instead of longer pauses
- Class name: create_video (exactly this name)
- IMPORTANT: Use 'class create_video(Scene):' for 2D animations or 'class create_video(ThreeDScene):' for 3D animations
- For 3D animations (vectors, 3D surfaces, rotations), MUST use ThreeDScene and you CAN use set_camera_orientation() and move_camera()
- For 2D animations, use Scene class
- For 3D animations: Keep them SIMPLE - use FEWER objects (max 8-10 arrows/vectors), use lower resolution for complex scenes
- For 3D vector fields: Use a sparse grid (distance 1.5 or more between vectors) to reduce rendering time
- SPEED OPTIMIZATION: Use run_time=0.5-1 for most animations, avoid heavy computations
- SPEED OPTIMIZATION: Use Transform instead of Create/FadeOut for faster rendering when possible
- SPEED OPTIMIZATION: Minimize the number of objects shown at once - use FadeOut frequently
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
- DO NOT use Latex syntax DO NOT use libraries besides Manim
- NEVER use axes.get_axis_labels() as it requires LaTeX - instead manually add Text labels next to axes
- NEVER use mobject.center (it's a method, not a property) - use mobject.get_center() instead
- IMPORTANT: Only use these safe colors: RED, BLUE, GREEN, YELLOW, WHITE, BLACK, GRAY, ORANGE, PURPLE, PINK. Do NOT use CYAN or other color constants that may not be available.
-Make the animations concistant and easy to follow. Create graphs or visual disagrams that go along with the equations. 
-Make these videos professional and similar to ThreeBlueOneBrown. 
-make sure no text is overlaping with other texts or graphic
- focus on showing the entire process of the algorithm but feel free to keep the animation clean and not cluttered.
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
from manim import RED, BLUE, GREEN, YELLOW, WHITE, BLACK, GRAY, ORANGE, PURPLE, PINK

${scriptContent}`;
    }
    
    fs.writeFileSync(tempFilePath, wrappedScript);
    console.log(`Created temporary script file: ${tempFilePath}`);
    
    // Execute the Manim script - videos will be generated in the same directory as the script
    // PERFORMANCE OPTIMIZATIONS (keeping full animation quality):
    // -ql = low quality (480p, 15fps) for faster rendering
    // --disable_caching = skip hash checking for faster startup
    // --write_to_movie = render directly to MP4 (skip partial frame files)
    const manimCommand = `manim -ql --disable_caching --write_to_movie ${tempFilePath} create_video`;
    console.log(`Executing command: ${manimCommand}`);
    console.log(`Script content preview:`, wrappedScript.substring(0, 300));
    
    // Get ffmpeg path from ffmpeg-static
    const ffmpegPath = require('ffmpeg-static');
    
    exec(manimCommand, { 
      timeout: 300000, // 300 second timeout (5 minutes) for complex 3D scenes
      cwd: scriptsDir, // Run from scripts directory
      env: { 
        ...process.env, 
        PYTHONPATH: process.env.PYTHONPATH || '',
        // Set ffmpeg path for pydub
        FFMPEG_BINARY: ffmpegPath,
        PYDUB_FFMPEG_PATH: ffmpegPath,
        PATH: process.env.PATH + ';' + path.dirname(ffmpegPath),
        // Performance optimizations
        NUMBA_NUM_THREADS: '4', // Use 4 CPU cores for parallel processing
        MPLBACKEND: 'Agg', // Use non-interactive backend
        MANIM_DISABLE_CACHING: '1' // Force caching off
      }
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
