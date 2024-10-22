// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { randomBytes } from "crypto";
import { exec } from "child_process";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.languages.registerDocumentFormattingEditProvider(
    "AXAML",
    {
      provideDocumentFormattingEdits(document): Promise<vscode.TextEdit[]> {
        const firstLine = document.lineAt(0);
        const lastLine = document.lineAt(document.lineCount - 1);

        let text = document.getText();

        // store the text into a temporary file of the vscode extension in order to process it with an external tool in the next step
        const tempDir = os.tmpdir();
        const filename = path.join(
          tempDir,
          "vscode",
          "xamlstyler",
          randomBytes(16).toString("hex")
        );

        fs.mkdirSync(path.dirname(filename), { recursive: true });

        fs.writeFileSync(filename, text);

        // process the text with an external tool
        return runXStyler(filename).then((newText) => {
          // remove the temporary file
          fs.unlinkSync(filename);

          return [
            vscode.TextEdit.replace(
              new vscode.Range(firstLine.range.start, lastLine.range.end),
              newText
            ),
          ];
        });
      },
    }
  );

  context.subscriptions.push(disposable);
}
function runXStyler(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Construct the xstyler command with necessary parameters
    const command = `xstyler --file "${filePath}" --write-to-stdout --ignore`;

    // Run the command using child_process
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error} ${stderr}`);
        return;
      }
      // if (stderr) {
      //   console.info(`xstyler: ${stderr}`);
      // }
      resolve(stdout);
    });
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
