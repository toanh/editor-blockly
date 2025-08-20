onLoadBlocks = function() {}

function clearDialogText() {
  const dialogText = document.getElementById("dialog-text");
  dialogText.innerHTML = "";
}

function setDialogButtonVisible(visible = true) {    
  const dialogButtons = document.getElementById("dialog-buttons");    
  dialogButtons.style.display = visible ? "flex" : "none";
}    

function showAndCenterDialog(dialog) {
  const container = document.getElementById('workspaceContainer');
  if (!dialog.open && container) {
      dialog.show();
      dialog.style.visibility = 'hidden';
      dialog.style.position = 'fixed';
      dialog.style.margin = '0';

      const containerRect = container.getBoundingClientRect();
      const left = containerRect.left + (containerRect.width - dialog.offsetWidth) / 2;
      const top = containerRect.top + (containerRect.height - dialog.offsetHeight) / 2;

      dialog.style.left = `${left}px`;
      dialog.style.top = `${top}px`;
      dialog.style.visibility = 'visible';
      
  }
}    

// Wait for the DOM content to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load the unified data file (data.json)
    const urlParams = new URLSearchParams(window.location.search);
    var activity = urlParams.get('activity');    
    if (activity === null) {
        activity = "classify";
    }

    fetch(activity + '/blocks.json?t=1')
      .then(response => response.json())
      .then(function(data) {
        // Extract arrays from the data file.
        var blockDefs = data.blocks;
        var generatorDefs = data.generators;
        var startBlocks = data.startBlocks;
        var toolboxBlocks = data.toolbox;
  
        // Define blocks from the blocks array.
        Blockly.defineBlocksWithJsonArray(blockDefs);
  
        // Inject Blockly into the page.
        var workspace = Blockly.inject('blocklyDiv', {
          trashcan: true,
          toolbox: toolboxBlocks,
          scrollbars: true
        });

        // Check for id parameter and restore workspace if it exists
        const urlParams = new URLSearchParams(window.location.search);
        const idParam = urlParams.get('id');
        
        if (idParam) {
            // Show spinner while fetching
            const spinner = document.createElement('div');
            spinner.id = 'loadingSpinner';
            spinner.innerHTML = `
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                ">
                    <div style="
                        width: 20px;
                        height: 20px;
                        border: 2px solid #f3f3f3;
                        border-top: 2px solid #3498db;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    <span>Loading workspace...</span>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            // Append spinner to the Blockly workspace div instead of body
            const blocklyDiv = document.getElementById('blocklyDiv');
            blocklyDiv.style.position = 'relative'; // Ensure positioning context
            blocklyDiv.appendChild(spinner);
            
            // Fetch the saved workspace from the API
            fetch(`https://codestore-348206.ts.r.appspot.com/get?id=${encodeURIComponent(idParam)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json(); // Parse as JSON instead of text
                })
                .then(workspaceJson => {
                    try {
                        // Clear existing workspace
                        workspace.clear();
                        
                        // Load the JSON workspace directly 
                        Blockly.serialization.workspaces.load(workspaceJson, workspace);
                        
                        // Remove the id parameter from the URL
                        const currentUrl = new URL(window.location.href);
                        currentUrl.searchParams.delete('id');
                        window.history.replaceState({}, '', currentUrl);
                        
                        console.log('Workspace restored from snapshot');
                    } catch (error) {
                        console.error('Error restoring workspace:', error);
                        // If restoration fails, continue with default blocks
                        Blockly.serialization.workspaces.load(startBlocks, workspace);
                    } finally {
                        // Always remove spinner when done
                        const spinner = document.getElementById('loadingSpinner');
                        if (spinner) {
                            spinner.remove();
                        }
                    }
                })
                .catch(error => {
                    console.error('Error fetching snapshot:', error);
                    // If fetching fails, continue with default blocks
                    Blockly.serialization.workspaces.load(startBlocks, workspace);
                    
                    // Remove spinner on error too
                    const spinner = document.getElementById('loadingSpinner');
                    if (spinner) {
                        spinner.remove();
                    }
                });
        } else {
            // No id parameter, load default start blocks
            Blockly.serialization.workspaces.load(startBlocks, workspace);
        }    
  
        // Register generator functions based on the generator definitions.
        generatorDefs.forEach(function(genDef) {
          Blockly.JavaScript.forBlock[genDef.type] = function(block) {
            var code = genDef.code;
            if (genDef.isExpression) {
              var order = genDef.order ? Blockly.JavaScript[genDef.order] : Blockly.JavaScript.ORDER_ATOMIC;
              return [code, order];
            } else {
              return code;
            }
          };
        });  
  
        // Function to display the result in the custom dialog.
        function showResult(message, type) {
          var dialog = document.getElementById("resultDialog");
          var iconDiv = dialog.querySelector(".icon");
          var msgDiv = dialog.querySelector(".msg");
  
          if (type === "correct") {
            iconDiv.innerHTML = "&#x2714;";  // Unicode check mark.
            iconDiv.style.color = "green";
          } else {
            // For any non-correct result, we use red (or you can customize further)
            iconDiv.innerHTML = "&#x2716;";  // Unicode heavy ballot X.
            iconDiv.style.color = "red";
          }
          msgDiv.innerHTML = message;
          dialog.style.display = "flex";
        }
  
        // Dismiss the dialog when the OK button is clicked.
        document.getElementById("okButton").addEventListener("click", function() {
          document.getElementById("resultDialog").style.display = "none";
        });

        async function runCode() {
            // clear the dialog if present
            setDialogButtonVisible(false);
            clearDialogText();            


            // Generate JavaScript code and run it.
            window.LoopTrap = 1000;
            javascript.javascriptGenerator.INFINITE_LOOP_TRAP =
              'if (--window.LoopTrap < 0) throw "Infinite loop.";\n';
 

            var code =
              javascript.javascriptGenerator.workspaceToCode(workspace);
            javascript.javascriptGenerator.INFINITE_LOOP_TRAP = null;

            // add pre- and post- harness code: found in evalutors.js
            code = constructTests(code);

            try {
              var testResult = true;
              eval(code);
              if (testResult === true) {
                showResult("Correct! Well done!", "correct");
              } else if (testResult === false) {
                showResult("Not quite, try again!", "incorrect");
              } else {
                // not a boolean type assigned to testResult (async result is pending), just do nothing
              }
            } catch (e) {
              alert(e);
            }
          }        
        // Attach checkBlocks to the Run button.
        //document.getElementById("runButton").addEventListener("click", checkBlocks);
        document.getElementById("runButton").addEventListener("click", runCode);

        // Add Snapshot to URL button functionality
        document.getElementById("snapshotButton").addEventListener("click", async function() {
          try {
              // Get the workspace blocks as JSON
              const workspaceJson = Blockly.serialization.workspaces.save(workspace);
              
              // Make POST request to the endpoint
              const response = await fetch('https://codestore-348206.ts.r.appspot.com/put', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded', // Changed to JSON content type
                  },
                  body: 'code=' + encodeURIComponent(JSON.stringify(workspaceJson))                  
              });
              
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const id = await response.text();
              
              // Display success message with clickable URL
              const snapshotUrl = new URL(window.location.href);
              snapshotUrl.searchParams.set('id', id);

              showResult(`Snapshot to:<br> <a href="${snapshotUrl.href}" target="_blank" style="color: #007bff; text-decoration: underline;">${snapshotUrl.href}</a>`, "correct");              
              
          } catch (error) {
              console.error('Error saving snapshot:', error);
              showResult('Error saving snapshot: ' + error.message, "incorrect");
        }});  

        onLoadBlocks();
      })
      .catch(function(error) {
        console.error("Error loading data.json:", error);
      });
  });
  