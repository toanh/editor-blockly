function test(input, condition) {
    return (input === condition);
}
function action(action) {
    alert(action);
    return action;
}
function constructTests(code) {

  

    var bodyCode = code;
    
    var execCode = `
    async function runCode() {
        return new Promise(async (resolve) =>  {
            var input = 0; var result = -1;
            // insert bodyCode here
            ${bodyCode}
            resolve(true);
        });
    }
    runCode();

    testResult = 1;
    `;

    return execCode;
}

function clearDialogText() {
    const dialogText = document.getElementById("dialog-text");
    dialogText.innerHTML = "";
}

function setDialogButtonVisible(visible = true) {    
    const dialogButtons = document.getElementById("dialog-buttons");    
    dialogButtons.style.display = visible ? "block" : "none";
}

function print(text) {
    const dialogText = document.getElementById("dialog-text");
    let paragraph = document.createElement("p");
    paragraph.textContent = text;
    dialogText.append(paragraph);

    // always hide buttons after a print
    setDialogButtonVisible(false);
    dialog.show();
    //dialog.style.left = '100px';
    //dialog.style.top = '100px';    
}

function input(options) {

}

// setting up custom generator function for the print_text block due to it using a parameter
Blockly.JavaScript.forBlock['print_text'] = function(block) {
    var text = JSON.stringify(block.getFieldValue('TEXT') || "");
    var code = 'print(' + text + ');\n';
    return code;
};   
/*
      {
        "type": "ask_yes_no",
        "code": "result = await yesOrNo();\n",
        "isExpression": false
      }*/
Blockly.JavaScript.forBlock['ask_yes_no'] = function(block) {
    //var text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_NONE) || '""';
    var text = JSON.stringify(block.getFieldValue('TEXT') || "");
    var code = 'print(' + text + ');\nresult = await yesOrNo();\n';
    return code;
};   

const dialog = document.querySelector("dialog");
const closeBtn = document.getElementById("closeBtn");

closeBtn.addEventListener("click", () => {
    clearDialogText();
    dialog.close();
});

function waitForDialogResponse() {
    return new Promise((resolve) => {
        dialog.show();
        const yesButton = document.getElementById("dialog-yes-button");
        const noButton = document.getElementById("dialog-no-button");

        const handleClick = (response) => {
            dialog.close();
            removeListeners();
            resolve(response);
        };        

        const handleYesClick = () => handleClick(true);
        const handleNoClick = () => handleClick(false);        

        const removeListeners = () => {
            yesButton.removeEventListener("click", handleYesClick);
            noButton.removeEventListener("click", handleNoClick);
        };

        yesButton.addEventListener("click", handleYesClick);
        noButton.addEventListener("click", handleNoClick);
    });
}

async function yesOrNo() {
    // show the buttons after a print
    setDialogButtonVisible(true);

    const response = await waitForDialogResponse();    

    setDialogButtonVisible(false);
    clearDialogText();
    return response;
}

