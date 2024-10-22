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
  res.setHeader("Content-Type", "text/html");
  res.writeHead(200);
  res.end(htmlFiles.get(req.url));
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