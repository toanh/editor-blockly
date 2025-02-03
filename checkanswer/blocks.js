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
    execCode += "input = 0; result = -1;" +  bodyCode + " testResult &&= (result == input);";
    // test 2
    execCode += "input = 1; result = -1;" + bodyCode + " testResult &&= (result == input);";
    return execCode;
}