const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

class CodeExecutor {
  constructor() {
    this.tempDir = path.join(__dirname, "../temp");
  }

  async initializeTempDirectory() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error("Error creating temp directory:", error);
      throw error;
    }
  }

  async executeJavaScript(code) {
    return this.executeCode(code, "js", "node");
  }

  async executePython(code) {
    return this.executeCode(code, "py", "python");
  }

  async executeCpp(code) {
    return this.executeCode(code, "cpp", "g++", "./a.out");
  }

  async executeCode(code, extension, compileCommand, runCommand = null) {
    const fileName = `${uuidv4()}.${extension}`;
    const filePath = path.join(this.tempDir, fileName);

    try {
      await fs.writeFile(filePath, code);

      return new Promise((resolve, reject) => {
        const commands = runCommand
          ? [compileCommand, filePath, "&&", runCommand]
          : [compileCommand, filePath];
        const process = spawn(commands.join(" "), { shell: true });

        let output = "";
        let error = "";

        process.stdout.on("data", (data) => {
          output += data.toString();
        });

        process.stderr.on("data", (data) => {
          error += data.toString();
        });

        process.on("close", (code) => {
          fs.unlink(filePath).catch(console.error);

          if (code === 0) {
            resolve({ success: true, output, error: null });
          } else {
            resolve({ success: false, output: null, error });
          }
        });

        setTimeout(() => {
          process.kill();
          reject(new Error("Execution timed out"));
        }, 5000);
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CodeExecutor;
