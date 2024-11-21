//----------------------------------------------------------------
//							DEPENDENCIES
//----------------------------------------------------------------

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const http = require("http");
const express = require("express");
const session = require("express-session");
const expressSql = require("express-mysql-session")(session);

var minimist = require("minimist");
const fs = require("fs").promises;
import open from "node:fs";
import formidable from 'formidable';
const mysql = require("mysql");

const __dirname = import.meta.dirname;

//----------------------------------------------------------------
//							  SETTINGS
//----------------------------------------------------------------

let settings;
await fs.readFile(__dirname + "/config.json")
	.then(set =>
	{
		settings = JSON.parse(set);
	})
	.catch(err =>
	{
		console.error(err.message);
		process.exit(1);
	});

//----------------------------------------------------------------
//							CMD ARGUMENTS
//----------------------------------------------------------------
/*
//Get cmd arguments
var args = minimist(process.argv.slice(2), {
	string: 'host',
	string: 'port',
	alias: {h: 'host', p: 'port'},
	default: {host: "localhost", port: "8000"}
});

const port = Number(args.port);

*/

var sqlConnection = mysql.createConnection(
{
	host: settings.sqlHost,
	user: settings.sqlUser,
	password: settings.sqlPassword,	
	database: settings.sqlDatabase
});

sqlConnection.connect(
	err =>
	{
		if(err)
		{
			console.error("Cannot connect to database");
			console.log(err.message);
			process.exit(1);
		}
	}
);

sqlConnection.query("SELECT * FROM users",
	(error, result, fields) =>
	{
		if(error)
		{
			console.error("Cannot read database");
			process.exit(1);
		}
		console.log(result[0]);
	}
);


//----------------------------------------------------------------
//							 EXPRESS
//----------------------------------------------------------------

const app = express();
const sessionStore = new expressSql({}, sqlConnection);

const sessionMiddleware = session(
{
	secret: settings.cookieSecret,
	resave: true,
	saveUninitialized: true
});

//const httpServer = createServer(app);

app.use(sessionMiddleware);

app.all("/*", (req, res) => {requestListener(req, res);});

//----------------------------------------------------------------
//							HTML FILES
//----------------------------------------------------------------
	
async function addHtmlFileToMap(htmlMap, fileLoc, url)
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
for(let i in settings.html)
{
	await addHtmlFileToMap(htmlFiles, settings.html[i].source, settings.html[i].url);
}

//----------------------------------------------------------------
//								GET
//----------------------------------------------------------------

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

//----------------------------------------------------------------
//								POST
//----------------------------------------------------------------

async function handlePostRequest(req, res, urlPath, urlArgs)
{
	
	if(urlPath == "/sendFile")
	{	
		const form = formidable({ uploadDir: __dirname + "/images/requests/raw/", 
			filename: function ({name, ext, part, form})
			{
				return urlArgs.name;
			},
			filter: function ({name, oroginalFilename, mimetype})
			{
				return mimetype && mimetype.includes("image");
			}
		});
		let fields;
		let files;
		try
		{
			[fields, files] = await form.parse(req);
			console.log("File created");
		}
		catch (err)
		{
			res.setHeader("Content-Type", "text/plain");
			res.writeHead(err.httpCode || 400);
			res.end(String(err));
			return;
		}
		
		fs.readFile(__dirname + "/images/requests/raw/" + urlArgs.name)
			.then(im => 
			{
				res.setHeader("Content-Type", "image/png");
				res.writeHead(201);
				res.end(im);
			})
			.catch(err =>
			{
				console.error(err);
				res.setHeader("Content-Type", "text/html");
				res.writeHead(403);
				res.end("<h1>File was sent on the server but cannot be read back<h1>");
		});
	}
	else if(urlPath = "/login")
	{
		const form = formidable({});
		let fields;
		let files;
		
		//TODO
		[fields, files] = await form.parse(req);
		
		sqlConnection.query('SELECT id FROM users WHERE username = ? AND password = ?',
			[fields.login, fields.password],
			function(sqlerr, sqlres, sqlfld)
			{
				if(sqlerr)
				{
					res.setHeader("Content-Type", "text/html");
					res.writeHead(403);
					res.end(`<h1> Blad dostepu do bazy danych: ${sqlerr} </h1>`)
					return;
				}
				console.log(sqlres);
				if(isEmpty(sqlres))
				{
					res.setHeader("Content-Type", "text/html");
					res.writeHead(403);
					res.end(`<h1> Nie udalo sie zalogowac </h1>`);
					return;
				}
					res.setHeader("Content-Type", "text/html");
					res.writeHead(401);
					res.end(`<h1> Zalogowano, id uzytownika: ${sqlres[0].id} </h1>`);
			});
		
		//TODO: Usuwac niebezpieczne znaki z login
		//TODO: Enkrypcja hasla
		
		console.log(fields);
	}
	else
	{
		res.writeHead(403);
		res.end("wrong url");
	}
}

//----------------------------------------------------------------
//							SERVER
//----------------------------------------------------------------

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
		for(let i in urlTemp)
		{
			const argsTemp = urlTemp[i].split("=");
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

//----------------------------------------------------------------
//								MISC
//----------------------------------------------------------------

function isEmpty(obj)
{
	return Object.keys(obj).length === 0;
}

//----------------------------------------------------------------
//								MAIN
//----------------------------------------------------------------



const server = http.createServer(app);
  
server.listen(settings.serverPort, settings.serverHost, () => {
  console.info(`Server is running on http://${settings.serverHost}:${settings.serverPort}`);
});