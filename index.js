// Include the packages needed for this application
const fs = require("fs");
const inquirer = require("inquirer");

/*
	The below code is a hacky way to fix Issue #1144 of Inquirer on github: 
	https://github.com/SBoudrias/Inquirer.js/issues/1144

	The issue is about the 'postfix' parameter and how it essentially does
	nothing. I wanted to fix this behavior since the postfix parameter allows
	editor prompts to be opened with markdown  (or any other language) syntax
	highlighting.
*/
try {
	const { editAsync } = require('external-editor');

	inquirer.prompt.prompts.editor.prototype.startExternalEditor = function() {
    	// Pause Readline to prevent stdin and stdout from being modified while the editor is showing
    	this.rl.pause();
    	editAsync(this.currentText, this.endExternalEditor.bind(this), fileOptions={postfix: this?.opt?.postfix || '.txt'});
	};
} catch(error) {
	// Do nothing since the postfix parameter is only for user convenience and is not essential to our program
}

// TODO: Create an array of questions for user input

function isValid(input, answers) {

	return (input.trim().length > 0);
}

const questions = [
	{
		message: "What is your project title?",
		name: "projectTitle",
		type: "input",
		validate: isValid
	},
	{
		message: "Can you provide installation instructions for your project?",
		name: "installationInstructions",
		type: "editor",
		postfix: ".md"
	},
	{
		message: "Can you provide usage information for your project?",
		name: "usageInformation",
		type: "editor",
		postfix: ".md"
	},
	{
		message: "Can you provide contribution guidelines for your project?",
		name: "contributionGuidelines",
		type: "editor",
		postfix: ".md"
	},
	{
		message: "Can you provide usage information for your project?",
		name: "usageInformation",
		type: "editor",
		postfix: ".md"
	},
];

// TODO: Create a function to write README file
function writeToFile(fileName, data) {
    fs.writeFile(fileName, data, "utf8", (error) => console.error(error));
}

// TODO: Create a function to initialize app
function init() {
	inquirer
		.prompt(questions)
		.then((answers) => {
			console.log("Hey your answers are: ", answers);
		});
}

// Function call to initialize app
init();
