// Array of all licenses supported by this project
const licenseCommonNames = ["Apache License v2.0", "BSD-2", "BSD-3", "GNU GPL v2", "GNU GPL v3", "MIT"];

// Mappings of common licenses to their respective shield badge links and license home page
const shieldBadgeLinks = new Map();
const licenseLinks = new Map();

[
	"https://img.shields.io/badge/License-Apache_2.0-blue.svg",
	"https://img.shields.io/badge/License-BSD_2--Clause-orange.svg",
	"https://img.shields.io/badge/License-BSD_3--Clause-blue.svg",
	"https://img.shields.io/badge/License-GPL_v2-blue.svg",
	"https://img.shields.io/badge/License-GPLv3-blue.svg",
	"https://img.shields.io/badge/License-MIT-yellow.svg"
].forEach((shieldLink, i) => shieldBadgeLinks.set(licenseCommonNames[i], shieldLink));

[
	"https://opensource.org/licenses/Apache-2.0",
	"https://opensource.org/licenses/BSD-2-Clause",
	"https://opensource.org/licenses/BSD-3-Clause",
	"https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html",
	"https://www.gnu.org/licenses/gpl-3.0",
	"https://opensource.org/licenses/MIT"
].forEach((licenseLink, i) => licenseLinks.set(licenseCommonNames[i], licenseLink));


// Render a shield license badge. If there is no license, return an empty string
function renderLicenseBadge(license) {
	return licenseCommonNames.includes(license) ? `![Badge of the ${license} license](${shieldBadgeLinks.get(license)})` : "";
}

// Render a link to the license homepage. If there is no license, return an empty string
function renderLicenseLink(license) {
	return licenseCommonNames.includes(license) ? licenseLinks.get(license) : "";
}

// Render the complete License section in the README. If there is no license, return an empty string
function renderLicenseSection(license) {
	if (!license) {
		return "";
	}
	return `# License\n\nThis project is covered under the ${license} license\nFor more information refer to: ${renderLicenseLink(license)}\n\n`;
}

// Regex's used for parsing markdown
const sectionRe = new RegExp("^[\t\u0020]*(?<level>#{1,6})[\t\u0020]*(?<name>.+)");
const newLineRe = new RegExp("\r?\n+");

/*
  A class containing markdown section data. Used exclusively by the createSectionTree function.

  These Sections are used to create a table of contents
*/
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
*/
function createSectionTree(markdownText) {
	let sectionTree = [];
	let prevSection, root;
	for (const line of markdownText.split(newLineRe)) {
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

		// If the previous section has no parent then it is a root section. We add the
		// current section immediately to the root subsections
		if (!prevSection.parent) {
			currentSection.parent = root;
			root.subsections.push(currentSection);
			prevSection = currentSection;
			continue;
		}

		// If the current section has a deeper level than the previous section then the
		// current section is a subsection of the previous section
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
	return sectionTree;
}

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
function renderTableOfContents(sectionTree) {
	let templateString = `# Table of Contents\n`;
	let rootCount = 0;
	function walkSection(section, sectionCount, isRoot=false) {
		templateString += "\t\t".repeat(section.level - 1);
		if (isRoot) {
			sectionCount = rootCount;
			rootCount++;
		}
		templateString += `${sectionCount+1}. [${section.name}](#${section.name.trim().replaceAll(" ", "-")})\n`;
		
		let subSectionCount = 0;

		for (const subsection of section.subsections) {
			if (subsection.level === 1) {
				walkSection(subsection, rootCount, true);
			} else {
				walkSection(subsection, subSectionCount); // Start a new 
				subSectionCount++;
			}
		}
	}
	sectionTree.forEach((section, i) => walkSection(section, i, true));
	return templateString;
}

// Render the Questions section of the README by providing a link to the users' Github account
// and the provided email address
function renderQuestionsSection(username, email) {
	// If no username and email are provided then we trash the Questions section
	if (!username && !email) {
		return "";
	}
	return `# Questions\n\nGitHub Profile: https://github.com/${username}\nDirect questions to: ${email}`;
}

// Final function in the pipeline. Using the various parameters, generate a block of markdown text that
// is ready to be written directly to a README file
function generateMarkdown(title, license, sections, username, email, wantTableOfContents=false) {
	let markdownText = `# ${title}\n\n`;

	// render license badge
	if (license) {
		markdownText += `${renderLicenseBadge(license)}\n\n`;
	}

	// render table of contents only if the user wanted them
	let tableOfContents = "";
	if (wantTableOfContents) {
		sections.forEach((section, i) => section.subsections = createSectionTree(section.text));
		tableOfContents = `${renderTableOfContents(sections)}\n\n`;
	}
	markdownText += tableOfContents;

	// Add the actual text for each section the user may have added to the README
	for (const section of sections) {
		markdownText += `# ${section.name}\n`;
		if (section.text) {
			markdownText += `${section.text}\n`;
		}
		markdownText += '\n';
	}
	// Render the license section
	markdownText += renderLicenseSection(license)

	// Finally, add the questions section to the readme and then return it
	return markdownText + renderQuestionsSection(username, email);
}

// Export our generateMarkdown function and the Section class. The Section class is needed
module.exports = {generateMarkdown, Section};