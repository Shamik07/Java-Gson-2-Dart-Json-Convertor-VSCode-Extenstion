// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  /*console.log(
    'Congratulations, your extension "javaGsonToDartJsonConvertor" is now active!'
  );
  */

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('javaGsonToDartJsonConvertor.javaGsonToDartJsonConvertor',() => {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("editor does not exist");
        return;
      }

      const text = editor.document.getText(editor.selection);
      // vscode.window.showInformationMessage(`selected text: ${text}`);

      var entireArray = text.split(/\r\n|\r|\n/);
     
      var util = require('util');
      var s = util.format("%s lines converted to Dart", entireArray.length)

      vscode.window.showInformationMessage(s);

      var jsonTags = new Array();
      var javaVariables = new Array();
      var javaVariableNames = new Array();

      var firstLineDart;
      var finalDart = "";
      var javaClassName = "";
      var partOneEndChecker = 0;
      var partOneHasEnded = false;

      for (let i = 0; i < entireArray.length; i++) {
        console.log(
          'i is ',i
        );

        if(i == 0){
          firstLineDart = entireArray[i];
          firstLineDart = firstLineDart.replace("public ", "");
          finalDart = firstLineDart + " ";

          javaClassName = firstLineDart.replace("class ", "");
          javaClassName = javaClassName.replace(" {", "");
        }

        console.log(
          'Array is ',entireArray[i]
        );

        if(i > 0){
          if(!partOneHasEnded){
            console.log(
              'partOneEndChecker is ',partOneEndChecker
            );

            partOneEndChecker++;

            if(entireArray[i].includes("SerializedName")){
              console.log(
                'Reached SerializedName for i',i
              );

              partOneEndChecker = 1;
              var tempString = entireArray[i].replace('@SerializedName(',"");
              tempString = tempString.replace(')',"");
              jsonTags.push(tempString);
            }else if (partOneEndChecker == 2){
              console.log(
                'Reached partOneEndChecker == 2'
              );

              var tempString = entireArray[i].replace('private final ',"");
              finalDart = finalDart + tempString;
              javaVariables.push(tempString);

              tempString = tempString.replace('int',"");
              tempString = tempString.replace('String',"");
              tempString = tempString.replace('double',"");
              tempString = tempString.replace('boolean',"");
              tempString = tempString.replace(' ',"");

              javaVariableNames.push(tempString);
            }else if(partOneEndChecker > 3){
              console.log(
                'Reached partOneHasEnded'
              );

              partOneHasEnded = true;
            }
          }
        }else{
          partOneEndChecker = 0;
        }
      }

      // Part 2
      ///* 
      finalDart = finalDart + javaClassName + ".fromJsonMap(Map<String, dynamic> map):";
      for (let i = 0; i < jsonTags.length; i++) {
        if(i == (jsonTags.length - 1)){
          finalDart = finalDart + javaVariableNames[i].replace(";","")+" = "+"map["+jsonTags[i]+"];";
        }else{
          finalDart = finalDart + javaVariableNames[i].replace(";","")+" = "+"map["+jsonTags[i]+"],";
        }
      }
      //*/

      // Part 3
      ///* 
      finalDart = finalDart + "Map<String, dynamic> toJson() { final Map<String, dynamic> data = new Map<String, dynamic>();"
      for (let i = 0; i < jsonTags.length; i++) {
        var tempStringAlt = jsonTags[i].replace('"','');
          tempStringAlt = tempStringAlt.replace('"','');
          tempStringAlt = "data['"+tempStringAlt+"'] = "+javaVariableNames[i];
          tempStringAlt = tempStringAlt.replace("'    ","'");
        
          finalDart = finalDart + tempStringAlt;
        if(i == (jsonTags.length - 1)){
          finalDart = finalDart + "return data;}}"
        }
      }
      //*/

      editor.edit(edit => {
        edit.replace(editor.selection, finalDart);
      });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}