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
    execCode += "input = 0; result = -1;" + bodyCode + " testResult &&= (result == input);";
    // combined test
    execCode += "input = 1; result = -1;" + bodyCode + " testResult ||= (result == input);";    
    return execCode;
}

onLoadBlocks = function() {
    var blocklySvg = document.getElementsByClassName("blocklySvg");
    if (blocklySvg.length > 0) {
        blocklySvg[0].style.background = "linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), url('https://www.starship.xyz/wp-content/uploads/2024/11/OurRobots_Tech_RoadCross.jpg')";
        blocklySvg[0].style.backgroundSize = "1080px";
    }
}