function test(input, condition) {
    return (input === condition);
}
function action(action) {
    return action;
}
function constructTests(code) {
    var bodyCode = code;
    
    var execCode = "";
    
    // pass 0, declare variables    
    // note: testResult variable was declared in external eval code
    execCode =  "var input = 0; var result = -1;" ;
    // test 1
    execCode += "input = 1; result = -1;" +  bodyCode + " testResult &&= (result == input);";
    // test 2
    execCode += "input = 2; result = -1;" + bodyCode + " testResult &&= (result == input);";
    // test 3
    execCode += "input = 2; result = -1;" + bodyCode + " testResult &&= (result == input);";    

    return execCode;
}

function initWorkspace(workspace) {
    /*
    const startBlocks = {
        blocks: {
            blocks: [
                {type: "controls_if","id":".X}kzQG}|h94Vlz[4l%K","x":100,"y":100}]}}
                */
    const startBlocks = {
        blocks: {
          blocks: [
            {
              kind: 'block',
              type: 'controls_if',
              x: 100,
              y: 100,
              extraState : {
                elseIfCount: 1,
                hasElse: true
              }
            },
          ],
        },
      };
    Blockly.serialization.workspaces.load(startBlocks, workspace);
}