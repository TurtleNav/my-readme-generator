// Include the packages needed for this application
const fs = require("fs");
const inquirer = require("inquirer");

const [generateMarkdown, Section] = require("./utils/generateMarkdown");


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

// 
let userSections = [];
async function promptRound1() {

	const questions = [
		{
			message: "What is your project title?",
			name: "projectTitle",
			type: "input",
			validate: isValid
		},
		{
			message: "Select the sections you would like to add to your README",
			name: "selectedSections",
			type: "checkbox",
			choices: [
				"Table of Contents", "Installation Instructions", "Dependencies",
				"Usage Information", "Contribution Guidelines", "Tests",
				"Contributing", "License"
			],
		},
	];

	return await inquirer
		.prompt(questions)
		.then((answers) => {
			return [answers.projectTitle, answers.selectedSections];
		})
		;
}

// This prompt phase gives the user the ability to provide text content to each section they wished
// to add to their README.
async function promptRound2(sections) {
	// Cheaty one liner to both remove a "Table of Contents" entry in the sections array (if it is present)
	// AND store whether or not it was in there in a boolean
	const wantTableOfContents = !!sections.splice(sections.indexOf("Table of Contents"), 1).length;

	// dynamically add questions regarding only the sections the user specified
	questions = sections.map((section) => {
		return {
			message: `Can you provide information on ${section} for your project?`,
			name: section,
			type: "editor",
			postfix: ".md"
		}
	});
	return await inquirer
		.prompt(questions)
		.then((answers) => {
			console.log("answers -> ", answers);
			return [wantTableOfContents, answers];
		})
}

// A wrapper around fs.writeFile that handles creating our README while also
// checking if a README already exists
function writeReadMe(fileName, data) {
	if (fs.existsSync(fileName)) {
		inquirer
			.prompt([
				{
					message: "A README with that filename already exists. Would you like to write over it?",
					name: "addFile",
					type: "confirm"
				}])
			.then((answer) => {
				if (!answer.addFile) {
					return;
				}
			})
	}
	fs.writeFile(fileName, data, "utf8", (error) => error ? console.error(error): console.log("Successfully created README"));
}

function ToCamel(string) {
	isLowerCaseChar = (charCode) => (charCode > 96) && (charCode < 123);
	toUpperCaseChar = (charCode) => (charCode - 32);
	return string.split(" ").reduce((accum, word) => {
		if (!accum) {
			return word;
		}
		const firstCharCode = word.charCodeAt(0);
		if (!isLowerCaseChar(firstCharCode)){
			return accum + word;
		}
		return accum + String.fromCharCode(toUpperCaseChar(firstCharCode)) + word.substring(1);
	}, "");
}



// TODO: Create a function to initialize app
async function init() {
	// await our first prompt so we receive all the desired sections the
	// user wishes to add to their read me
	let [title, userSections] = await promptRound1();
	promptRound2(userSections);
}

// Function call to initialize app
init();
