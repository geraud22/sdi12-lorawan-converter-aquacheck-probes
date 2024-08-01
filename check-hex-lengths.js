function checkHexLength(hexString) {
	return hexString.length;
}

const hexStrings = [
	"0d5001f11e302b3030352e303834332b3030342e373430362b3030342e363030300d0af21e302b3030342e343837352b3030352e313235302b3030312e333132350d0af318302b32302e3632352b32302e3433372b31392e3735300d0af418302b31392e3632352b31392e3735302b31392e3331320d0af500f60f312b302e3030302b302e3030300d0af70f312b31392e30302b31392e30300d0a",
	"0d50010400f11e302b3030362e343235302b3030352e333533312b3030342e343030300d0af21e302b3030342e343334332b30",
	"0d5001040130342e373238312b3030322e313735300d0af318302b32302e3837352b32302e3638372b32302e3030300d0af418",
	"0d50010402302b32302e3235302b32302e3132352b31392e3638370d0af500f60f312b302e3030302b302e3030300d0af70f31",
	"0d500104032b31392e30302b31392e30300d0a"
];

const string1 = (hexStrings[0].length) / 2;
const string2 = (hexStrings[1].length) / 2;
const string3 = (hexStrings[2].length) / 2;
const string4 = (hexStrings[3].length) / 2;
const string5 = (hexStrings[4].length) / 2;
const totalSplit = string2 + string3 + string4 + string5;
console.log(`String 1 Length in Bytes: ${string1},\nString 2 Length in Bytes: ${string2},\nString 3 Length in Bytes: ${string3},\nString 4 Length in Bytes: ${string4},\nString 5 Length in Bytes: ${string5} \nTotal Split Strings Length in Bytes: ${totalSplit}`)
