
// Mappings of common licenses to their respective shield badge links and license home page
const shieldBadgeLinks = {
  apache2: "https://img.shields.io/badge/License-Apache_2.0-blue.svg",
  bsd2: "https://img.shields.io/badge/License-BSD_2--Clause-orange.svg",
  bsd3: "https://img.shields.io/badge/License-BSD_3--Clause-blue.svg",
  gpl2: "https://img.shields.io/badge/License-GPL_v2-blue.svg",
  gpl3: "https://img.shields.io/badge/License-GPLv3-blue.svg",
  mit: "https://img.shields.io/badge/License-MIT-yellow.svg"
};

const licenseLinks = {
  apache2: "https://opensource.org/licenses/Apache-2.0",
  bsd2: "https://opensource.org/licenses/BSD-2-Clause",
  bsd3: "https://opensource.org/licenses/BSD-3-Clause",
  gpl2: "https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html",
  gpl3: "https://www.gnu.org/licenses/gpl-3.0",
  mit: "https://opensource.org/licenses/MIT"
}

// TODO: Create a function that returns a license badge based on which license is passed in
// If there is no license, return an empty string
function renderLicenseBadge(license) {
  return `![badge of the ${license} license](${shieldBadgeLinks[license]})`;
}

// TODO: Create a function that returns the license link
// If there is no license, return an empty string
function renderLicenseLink(license) {}

// TODO: Create a function that returns the license section of README
// If there is no license, return an empty string

// class containing markdown section metadata
const sectionRe = new RegExp("^(?<level>#{1,6})[\t\u0020]*(?<name>.+)");

class Section {
	constructor(name, level, parent, subsections) {
	  this.name = name;
	  this.level = level;
	  this.parent = parent;
	  subsections ? this.subsections = subsections : this.subsections = [];
	}
}

/*
	This function is my pride and joy. Creates a circular array (of sorts) that contains each
	section in a markdown text:
		# Section 1
		## Sub Section 1.1
		## Sub Section 1.2
		### Sub Sub Section 1.2.1
		# Section 2
		...
	Section traversal is handled by two properties of the Section object:
		'parent' -> parent section of the current section
		'subsections' -> an array of all sub sections of the current section
	
	The returned array can be flattened for creation into a table of contents
*/
function createSectionTree(markdownText) {
	let sectionTree = [];
	let prevSection, root;
	for (const line of markdownText.split("\n")) {
		const result = line.match(sectionRe);
		if (!result) {
			continue;
		}
		const currentSection = new Section(result.groups.name, result.groups.level.length);
		// First iteration / new root section are handled the same:
		if (!root || (currentSection.level <= root.level)) {
			sectionTree.push(currentSection);
			prevSection = currentSection;
			root = currentSection;
			continue;
		}

		// If the previous section has no parent then it is a root section and we add the
		// section immediately to the parent's subsection
		if (!prevSection.parent) {
			currentSection.parent = root;
			root.subsections.push(currentSection);
			prevSection = currentSection;
			continue;
		}

		if (currentSection.level > prevSection.level) {
			currentSection.parent = prevSection;
			prevSection.subsections.push(currentSection);
		} else {
			// recursively travel up until we are at an adequate level for the section
			while (currentSection.level < prevSection.level) {
				prevSection = prevSection.parent
			}
			prevSection.parent.subsections.push(currentSection);
			currentSection.parent = prevSection.parent;
		}
		prevSection = currentSection;
	}
	for (const root of sectionTree) {
		console.log("root -> ", root.name);
		for (const children of root.subsections) {
			console.log("child level 1 -> ", children.name);
			for (const child2 of children.subsections) {
				console.log("child level 2 -> ", child2.name);
				for (const child3 of child2.subsections) {
					console.log("child level 3 -> ", child3.name);
				}
			}
		}
	}
	return sectionTree;
}

function renderLicenseSection(license) {}

/*
	 Create a table of contents markdown string like the following:

	 # Table of Contents
	 1. [Header 1](#header-1)
	 2. [Header 2](#header-2)
	 ...

	 ## Header 1
	 ...

	 ## Header 2
	 ...
*/
function renderTableOfContents(...sections) {
	let templateString = `# Table of Contents\n`;
	
	for (let i=0; i<sections.length; i++) {
		const section = sections[i];
		// main string creation logic. markdown links can't have whitespace so this code
		// replaces all spaces with a '-'
		templateString += `${i+1}. [${section}](#${section.trim().replaceAll(" ", "-")})\n`
	}
	return templateString;
}

// TODO: Create a function to generate markdown for README
function generateMarkdown(data) {
  return `# ${data.title}

`;
}

module.exports = generateMarkdown;
