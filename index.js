// Include the packages needed for this application
const fs = require("fs");
const inquirer = require("inquirer");

// import our self-implemented generateMarkdown function as well as a
// Section class (wrapper around a markdown section: # A / ## B / ### C ...)
const {generateMarkdown, Section} = require("./utils/generateMarkdown");


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

// First round of prompts gets the users' project name and every desired section they want in their README.
// The sections they wish to add are directly fed to promptRound2 - that dynamically generates questions based
// on their selections.
async function promptRound1() {
	const questions = [
		{
			message: "What is your project title?",
			name: "title",
			type: "input",
		},
		{
			message: "Select the sections you would like to add to your README",
			name: "selectedSections",
			type: "checkbox",
			choices: [
				"Table of Contents", "Installation Instructions", "Dependencies",
				"Usage Information", "Contribution Guidelines", "Tests",
			],
		},
	];
	return await inquirer
		.prompt(questions)
		.then((answers) => {
			return answers;
		});
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
			postfix: ".md",
		}
	});
	return await inquirer
		.prompt(questions)
		.then((answers) => {
			return [wantTableOfContents, answers];
		})
}

// Give the user a list of licenses to choose from for their project. Using the license
// name, we render a license badge and provide a link to the license in the README
async function promptRound3() {
	const question = 
	[{
		message: `Select a license for your project`,
		name: "license",
		type: "list",
		choices: ["Apache License v2.0", "BSD-2", "BSD-3", "GNU GPL v2", "GNU GPL v3", "MIT"]
	}];
	return await inquirer
		.prompt(question)
		.then((answers) => {
			return answers.license;
		});
}

// Prompt the user for their github username and email to place in the Questions section
// of the README
async function promptRound4() {
	const questions = 
	[{
		message: `Enter your GitHub username to place in the Questions section`,
		name: "username",
		type: "input"
	},
	{
		message: `Enter an email you wish to receive comments/feedback/inquiries`,
		name: "email",
		type: "input"	
	}
];
	return await inquirer
		.prompt(questions)
		.then((answers) => {
			return answers;
		});
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
			});
	}
	fs.writeFile(fileName, data, "utf8", (error) => error ? console.error(error): console.log("Successfully created README"));
}

async function init() {
	// await our first prompt so we receive all the desired sections the
	// user wishes to add to their read me. Additionaly, we get the title of the project
	const {title, selectedSections} = await promptRound1();

	// Second round of prompts give the user a chance to populate their desired README
	// sections with text. This leverages the editor style of prompt from inquirer
	const [wantTableOfContents, sectionData] = await promptRound2(selectedSections);

	// Third prompt gets the users' desired license for their project
	const license = await promptRound3();

	// Fourth and final round of prompts asks the user for their GitHub username and email
	// to place in the Questions section of the README
	const {username, email} = await promptRound4();

	// Create Section objects from all the user specified sections and any text they may have added to the section
	const sections = Object.entries(sectionData).map(([sectionName , sectionText], i) => {
		const section = new Section(sectionName, 1);
		section.text = sectionText;
		return section;
	});
	const markdownText = generateMarkdown(title, license, sections, username, email, wantTableOfContents);
	writeReadMe("README.md", markdownText);
}

// Function call to initialize app
init();
