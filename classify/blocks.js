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

function print(text, colour = "black") {
    const dialogText = document.getElementById("dialog-text");
    let paragraph = document.createElement("p");
    paragraph.style.color = colour;
    paragraph.textContent = text;
    dialogText.append(paragraph);

    // always hide buttons after a print
    setDialogButtonVisible(false);
    showAndCenterDialog(dialog);
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

Blockly.JavaScript.forBlock['ask_yes_no'] = function(block) {
    //var text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_NONE) || '""';
    var text = JSON.stringify(block.getFieldValue('TEXT') || "");
    var code = 'print(' + text + ', \'blue\');\nresult = await yesOrNo();\n';
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
        showAndCenterDialog(dialog);
        //dialog.show();
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

