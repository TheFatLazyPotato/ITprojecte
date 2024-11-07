var minimist = require("minimist");

const http = require("http");
const fs = require("fs").promises;
const fsNoProm = require("fs");
const form = require("formidable");

//Get cmd arguments
var args = minimist(process.argv.slice(2), opts={
	string: 'host',
	string: 'port',
	alias: {h: 'host', p: 'port'},
	default: {host: "localhost", port: "8000"}
});

const port = Number(args.port);
	
function addHtmlFileToMap(htmlMap, fileLoc, url)
{
	fs.readFile(__dirname + fileLoc)
		.then(cont => 
		{
			htmlMap.set(url, cont);
		})
		.catch(err => {
			console.error(`File error: ${err.code}: ${err.message}`);
			process.exit(1);
		});
}

//Matching .html files to different url paths
const htmlFiles = new Map();
	addHtmlFileToMap(htmlFiles, "/html/index.html", "/");
	addHtmlFileToMap(htmlFiles, "/html/indexTeste.html", "/teste");

/*
function addSession(session, client, i)
{
	if(session.has(client))
		return;
	
	session.set(client, i);
	i++;
}

const sessions = new Map();
let nSessions = 0;
*/

//-----------------------------GET-----------------------------

function handleGetRequest(req, res, urlPath, urlArgs)
{
	//Send image
	if(urlPath.startsWith("/images/html_images/"))
	{
		res.setHeader("Content-Type", "image/jpg");
		fs.readFile(__dirname + urlPath)
			.then(im => 
			{
				res.writeHead(200);
				res.end(im);
				console.log(`\tSent image: ${urlPath}`);
			})
			.catch(err =>
			{
				res.writeHead(404);
				console.error(`\tNo image: ${urlPath}`);
			});
	}
	
	//Send JavaScript file
	else if(urlPath.startsWith("/scripts/"))
	{
		res.setHeader("Content-Type", "text/javascript");
		fs.readFile(__dirname + urlPath)
			.then(scrpt => 
			{
				res.writeHead(200);
				//res.end(scrpt.replace("#HOST", `http://${host}:${port}`));
			})
			.catch(err =>
			{
				res.writeHead(404);
			});
	}
	
	//Send HTML file
	else if(!htmlFiles.has(urlPath))
	{
		res.setHeader("Content-Type", "text/html");
		res.writeHead(404);
		res.end("<h1>404 Wrong URL</h1>");
	}
	else
	{
		res.setHeader("Content-Type", "text/html");
		res.writeHead(200);
		res.end(htmlFiles.get(urlPath));
	}
}

//-----------------------------POST-----------------------------

async function handlePostRequest(req, res, urlPath, urlArgs)
{
	
	if(urlPath == "/sendFile")
	{
		/*
		let bodyData = [];
		req
			.on('data', chunk =>
			{
				bodyData.push(chunk);
			})
			.on('end', () =>
			{
				bodyData = Buffer.concat(bodyData).toString();
			});*/
		/*var imageFile = await fs.open(__dirname + "images/requests/raw/" + urlArgs.name, 'w');
			.on('error', () =>
			{
				res.writeHead(403);
				res.end("Could not save file on the server.");
			});
		imageFile.write(bodyData);
		imageFIle.close();*/
		
		let fields;
		let files;
		try
		{
			[fields, files] = await form.parse(req);
		}
		catch (err)
		{
			res.setHeader("Content-Type", "text/plain");
			res.writeHead(err.httpCode || 400);
			res.end(String(err));
			return;
		}
		
		console.log(JSON.stringify({fields, files}, null, 2));
		
		fsNoProm.writeFile(__dirname + "images/requests/raw/" + urlArgs.name, bodyData,
			err => 
			{
				if(err)
				{
					console.log(err.message);
					res.writeHead(403);
					res.end("Could not save file on the server");
					return;
				}
				console.log("The file was saved!");
				res.writeHead(201);
				res.end("images/requests/raw/" + urlArgs.name);
			});
	}
	else
	{
		res.writeHead(403);
		res.end("wrong url");
	}
}

const requestListener = function (req, res) {

	//Process URL into path and arguments
	console.log(req.method);
	let urlPath;
	const urlArgs = {};
	if(req.url.includes("?"))
	{
		urlPath = req.url.substr(0,req.url.indexOf("?"));
		
		const urlTemp = req.url.slice(req.url.indexOf("?")+1).split("&");
		console.log(urlTemp);
		for(i in urlTemp)
		{
			argsTemp = urlTemp[i].split("=");
			urlArgs[argsTemp[0]] = argsTemp[1];
		}
	}
	else
	{
		urlPath = req.url;
	}
	console.log(`Request: path = ${urlPath}, args = ${Object.entries(urlArgs)}`);
	
	switch(req.method.toLowerCase())
	{
		case "get":
			handleGetRequest(req, res, urlPath, urlArgs);
			break;
		case "post":
		/*
			res.setHeader("accept-post", "text/plain");
			res.writeHead(415);
			res.end("<h1>Nie!!!</h1>");
		*/
			handlePostRequest(req, res, urlPath, urlArgs);
			break;
		case "put":
		default:
			res.writeHead(404);
			res.end('');
			break;
	}
	
};

//-----------------------------MAIN-----------------------------

const server = http.createServer(requestListener);
  
server.listen(port, args.host, () => {
  console.info(`Server is running on http://${args.host}:${port}`);
});