// Function to clean the string
function cleanString(inputString) {
	// Remove non-printable ASCII characters (except for common printable characters)
	// This regex matches any character that is not between 0x20 (space) and 0x7E (tilde)
	var cleanedString = inputString.replace(/[^\x20-\x7E]/g, '');

	// Remove trailing '+' if present
	cleanedString = cleanedString.replace(/\+$/, '');

	return cleanedString;
}

// Example usage
var input = " P0.000+0.000÷+20.00+19.00";
var result = cleanString(input.slice(2));

console.log(result); // Output the cleaned string
