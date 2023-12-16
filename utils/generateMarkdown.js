
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
