var minimist = require("minimist");

const http = require("http");
const fs = require("fs").promises;

//Get cmd arguments
var args = minimist(process.argv.slice(2), opts={
	string: 'host',
	string: 'port',
	alias: {h: 'host', p: 'port'},
	default: {host: 'localhost', port: '8000'}
});

const port = Number(args.port);

let indexFile;

const requestListener = function (req, res) {
  res.setHeader("Content-Type", "text/html");
  res.writeHead(200);
  res.end(indexFile);
};

const server = http.createServer(requestListener);

fs.readFile(__dirname + "/html/index.html")
  .then(contents => {
    indexFile = contents;
    server.listen(port,args.host, () => {
      console.log(`Server is running on http://${args.host}:${port}`);
    });
  })
  .catch(err => {
    console.error(`Could not read index.html file: ${err}`);
    process.exit(1);
  });
