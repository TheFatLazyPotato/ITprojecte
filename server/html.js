var minimist = require("minimist");

const http = require("http");
const fs = require("fs").promises;

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


function handlePostRequest(req, res, urlPath, urlArgs)
{
	if(urlPath == "/sendFile")
	{
		res.writeHead(403);
		res.end("no implentation yet");
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
	
	switch(req.method)
	{
		case "GET":
			handleGetRequest(req, res, urlPath, urlArgs);
			break;
		case "POST":
		/*
			res.setHeader("accept-post", "text/plain");
			res.writeHead(415);
			res.end("<h1>Nie!!!</h1>");
		*/
			handlePostRequest(req, res, urlPath, urlArgs);
			break;
		case "PUT":
		default:
			res.writeHead(404);
			res.end('');
			break;
	}
	
};

const server = http.createServer(requestListener);
  
server.listen(port, args.host, () => {
  console.info(`Server is running on http://${args.host}:${port}`);
});