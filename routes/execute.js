const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const CodeExecutor = require("../utils/codeExecutor");
const Execution = require("../models/execution");

const executor = new CodeExecutor();
executor.initializeTempDirectory();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

router.use(limiter);

router.post("/", async (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: "Language and code are required" });
  }

  const startTime = Date.now();
  let result;

  try {
    switch (language.toLowerCase()) {
      case "javascript":
        result = await executor.executeJavaScript(code);
        break;
      case "python":
        result = await executor.executePython(code);
        break;
      case "cpp":
        result = await executor.executeCpp(code);
        break;
      default:
        return res.status(400).json({ error: "Unsupported language" });
    }

    const executionTime = Date.now() - startTime;

    // Save execution result to MongoDB
    const execution = new Execution({
      language,
      code,
      output: result.output,
      error: result.error,
      executionTime,
      status: result.success ? "success" : "error",
    });

    await execution.save();

    res.json({
      success: result.success,
      output: result.output,
      error: result.error,
      executionTime,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
