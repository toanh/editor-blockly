onLoadBlocks = function() {}


// Wait for the DOM content to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load the unified data file (data.json)
    const urlParams = new URLSearchParams(window.location.search);
    var activity = urlParams.get('activity');    
    if (activity === null) {
        activity = "winner";
    }

    fetch(activity + '.json')
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
          toolbox: toolboxBlocks
        });

        // initialise workspace blocks
        Blockly.serialization.workspaces.load(startBlocks, workspace);
  
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
          msgDiv.textContent = message;
          dialog.style.display = "flex";
        }
  
        // Dismiss the dialog when the OK button is clicked.
        document.getElementById("okButton").addEventListener("click", function() {
          document.getElementById("resultDialog").style.display = "none";
        });

        function runCode() {
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
              if (testResult) {
                showResult("Correct! Well done!", "correct");
              } else {
                showResult("Not quite, try again!", "incorrect");
              }
            } catch (e) {
              alert(e);
            }
          }        
        // Attach checkBlocks to the Run button.
        //document.getElementById("runButton").addEventListener("click", checkBlocks);
        document.getElementById("runButton").addEventListener("click", runCode);


        onLoadBlocks();
      })
      .catch(function(error) {
        console.error("Error loading data.json:", error);
      });
  });
  