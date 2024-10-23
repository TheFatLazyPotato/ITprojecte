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
		.then(cont => {htmlMap.set(url, cont);})
		.catch(err => {
			console.error(`File error: ${err.code}: ${err.path}`);
			process.exit(1);
		});
}

const htmlFiles = new Map();
	addHtmlFileToMap(htmlFiles, "/html/index.html", "/");
	addHtmlFileToMap(htmlFiles, "/html/indexTeste.html", "/teste");


const requestListener = function (req, res) {

	//Process URL into path and arguments
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
	
	//Send HTML file
	res.setHeader("Content-Type", "text/html");
	if(!htmlFiles.has(urlPath))
	{
		res.writeHead(404);
		res.end("<h1>404 Wrong URL</h1>");
	}
	else
	{
		res.writeHead(200);
		res.end(htmlFiles.get(urlPath));
	}
};

const server = http.createServer(requestListener);

/*fs.readFile(__dirname + "/html/index.html")
  .then(contents => {
    indexFile = contents;
    server.listen(port,args.host, () => {
      console.log(`Server is running on http://${args.host}:${port}`);
    });
  })
  .catch(err => {
    console.error(`Could not read index.html file: ${err}`);
    process.exit(1);
  });*/
  
server.listen(port, args.host, () => {
  console.log(`Server is running on http://${args.host}:${port}`);
});