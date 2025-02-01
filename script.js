// Wait for the DOM content to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load the unified data file (data.json)
    fetch('data.json')
      .then(response => response.json())
      .then(function(data) {
        // Extract blocks, checks, and generators arrays from the data file.
        var blockDefs = data.blocks;
        var checkStrategies = data.checks;
        var generatorDefs = data.generators;
  
        // Define blocks from the blocks array.
        Blockly.defineBlocksWithJsonArray(blockDefs);
  
        // Inject Blockly into the page.
        var workspace = Blockly.inject('blocklyDiv', {
          toolbox: document.getElementById('toolbox'),
          trashcan: true
        });
  
        // Register generator functions based on the generator definitions.
        generatorDefs.forEach(function(genDef) {
          Blockly.JavaScript[genDef.type] = function(block) {
            var code = genDef.code;
            if (genDef.isExpression) {
              // Use the order defined in the generator definition.
              var order = genDef.order ? Blockly.JavaScript[genDef.order] : Blockly.JavaScript.ORDER_ATOMIC;
              return [code, order];
            } else {
              return code;
            }
          };
        });
  
        // Generic function to check if a given block matches a pattern.
        function matchesPattern(block, pattern) {
          if (!block || block.type !== pattern.type) {
            return false;
          }
          if (pattern.inputs) {
            for (var inputName in pattern.inputs) {
              var expectedType = pattern.inputs[inputName];
              var child = block.getInputTargetBlock(inputName);
              if (!child || child.type !== expectedType) {
                return false;
              }
            }
          }
          // Optionally: ensure no extra blocks are attached.
          if (block.getNextBlock()) {
            return false;
          }
          return true;
        }
  
        // Function to display the result in the custom dialog.
        function showResult(message, type) {
          var dialog = document.getElementById("resultDialog");
          var iconDiv = dialog.querySelector(".icon");
          var msgDiv = dialog.querySelector(".msg");
  
          if (type === "correct") {
            iconDiv.innerHTML = "&#x2714;";  // Unicode check mark.
            iconDiv.style.color = "green";
          } else if (type === "snowman") {
            iconDiv.innerHTML = "&#9731;";  // Unicode snowman.
            iconDiv.style.color = "blue";
          } else {
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
  
        // Refactored checkBlocks function using the data-driven strategy.
        function checkBlocks() {
          var topBlocks = workspace.getTopBlocks(true);
          if (topBlocks.length !== 1) {
            showResult("Not quite, try again!", "incorrect");
            return;
          }
          var block = topBlocks[0];
          var matched = false;
          // Iterate over each check strategy.
          for (var i = 0; i < checkStrategies.length; i++) {
            var strategy = checkStrategies[i];
            if (matchesPattern(block, strategy.pattern)) {
              showResult(strategy.result.message, strategy.result.type);
              matched = true;
              break;
            }
          }
          if (!matched) {
            showResult("Not quite, try again!", "incorrect");
          }
        }
  
        // Attach the checkBlocks function to the Run button.
        document.getElementById("runButton").addEventListener("click", checkBlocks);
      })
      .catch(function(error) {
        console.error("Error loading data.json:", error);
      });
  });
  