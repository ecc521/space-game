const fs = require("fs")
const path = require("path")

function getFilesInDirectory (dir, files_){

    files_ = files_ || [];

    //Return if we were passed a file or symbolic link
    let dirStats = fs.lstatSync(dir)
    if (dirStats.isSymbolicLink()) {
        return [];
    }
    if (!dirStats.isDirectory()) {
        return [dir]
    }

    let files;

    try {
        files = fs.readdirSync(dir);
    }
    catch (e) {
        //Likely a permission denied error
        //Return an empty array
        console.warn(e);
        return []
    }

    for (var i in files){
        let name = path.join(dir, files[i])
        //Currently ignores symbolic links
        //Change lstatSync to statSync to stat the target of the symbolic link, not the link itself

        let stats = fs.lstatSync(name)

        if (stats.isSymbolicLink()) {
            continue;
        }

        if (stats.isDirectory()){
            getFilesInDirectory(name, files_);
            process.noAsar = true
        }
        else {
            files_.push(name);
        }
    }
    return files_;
}



let srcDir = path.join(__dirname, "src")
let files = getFilesInDirectory(srcDir)

let outputFiles = [];
files.forEach((filePath) => {
	if (path.extname(filePath) === ".js") {
		let jsonAssets = path.join(path.dirname(filePath), path.basename(filePath, ".js") + ".json")
		if (fs.existsSync(jsonAssets)) {
			outputFiles.push([path.relative(srcDir, filePath), jsonAssets])
		}
	}
})

console.log(outputFiles)

let res = {}
outputFiles.forEach((arr) => {
	let filePath = arr[1]

	let contents = fs.readFileSync(filePath, {encoding: "utf-8"})
	//TODO: We should use a javascript object-like JSON parser.
	let obj;
	try {
		eval("obj  = " + contents)
	}
	catch (e) {
		console.error(e)
		throw "Failed to parse JSON asset at " + filePath
	}

	res[arr[0]] = obj
})

console.log(res)
fs.writeFileSync(path.join(__dirname, "packages", "assets.json"), JSON.stringify(res))
