// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { DependencyChecker } from "./dependencyChecker";
import { AxamlFormatter } from "./axamlFormatter";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  var result = await DependencyChecker.checkMissingDependencies();

  if (!result) {
    vscode.window.showErrorMessage(
      "There were missing dependencies. Please install them and restart vscode."
    );
    return;
  }

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.languages.registerDocumentFormattingEditProvider(
    { scheme: "file", language: "AXAML" },
    {
      provideDocumentFormattingEdits: (document) =>
        AxamlFormatter.format(document),
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
