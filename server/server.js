//----------------------------------------------------------------
//							DEPENDENCIES
//----------------------------------------------------------------

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const http = require("http");
const express = require("express");
const session = require("express-session");
const expressSql = require("express-mysql-session")(session);

const net = require("net");

var minimist = require("minimist");
const fs = require("fs").promises;
import open from "node:fs";
import formidable from 'formidable';
const mysql = require("mysql2");

const __dirname = import.meta.dirname;

//----------------------------------------------------------------
//							  SETTINGS
//----------------------------------------------------------------

let settings;
await fs.readFile(__dirname + "/config.json")
	.then(set =>
	{
		settings = JSON.parse(set);
		console.log(settings);
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
	port: settings.sqlPort,
	user: settings.sqlUserData,
	password: settings.sqlPasswordData,	
	database: settings.sqlDatabase
});

sqlConnection.connect(
	err =>
	{
		if(err)
		{
			console.error("Regular - Cannot connect to database");
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
			console.error("Regular - Cannot read database");
			process.exit(1);
		}
		console.log(result[0]);
	}
);


//----------------------------------------------------------------
//							 EXPRESS
//----------------------------------------------------------------

const app = express();

const mySqlSessionOptions =
{
	host: settings.sqlHost,
	port: settings.sqlPort,
	user: settings.sqlUserSession,
	password: settings.sqlPasswordSession,
	database: settings.sqlDatabase
}

let sessionStore = {};

try
{
	sessionStore = new expressSql(mySqlSessionOptions);
}
catch (err)
{
	console.error("Express Session - Cannot connect to database");
	process.exit(1);
}

const sessionMiddleware = session(
{
	secret: settings.cookieSecret,
	//name: "uniqueSessionID",
	resave: false,
	saveUninitialized: true,
	store: sessionStore,
	cookie: {
		path: '/',
		httpOnly: false,
		secure: false,
		maxAge: settings.sessionExpiration,
		sameSite: "Lax"
		}
});

//const httpServer = createServer(app);

app.use(sessionMiddleware);

app.all("/*", (req, res) => 
{
	req.session.init = "init";
	requestListener(req, res);
});

//----------------------------------------------------------------
//						IMAGE SERVER CONNECTION
//----------------------------------------------------------------

const imageConnection = new net.Socket();
imageConnection.connect(8078, "localhost");

async function ApplyImageFilter(name)
{
	
}

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
	//--------------------------IMAGE-----------------------------
	if(urlPath.startsWith("/images/"))
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
	
	//------------------------JAVASCRIPT---------------------------
	else if(urlPath.startsWith("/scripts/"))
	{
		res.setHeader("Content-Type", "text/javascript");
		fs.readFile(__dirname + urlPath)
			.then(scrpt => 
			{
				res.writeHead(200);
				res.end(scrpt);
				console.log(`\tSent JavaScript: ${urlPath}`);
				//res.end(scrpt.replace("#HOST", `http://${host}:${port}`));
			})
			.catch(err =>
			{
				res.writeHead(404);
			});
	}
	
	//--------------------------JSON-------------------------------
	else if(urlPath.startsWith("/filters/"))
	{
		res.setHeader("Content-Type", "text/json");
		fs.readFile(__dirname + urlPath)
			.then(filt => 
			{
				res.writeHead(200);
				res.end(filt);
				console.log(`\tSent json: ${urlPath}`);
			})
			.catch(err =>
			{
				res.writeHead(404);
			});
	}
	
	//--------------------------CSS-------------------------------
	else if(urlPath.startsWith("/html/styles/"))
	{
		res.setHeader("Content-Type", "text/css");
		fs.readFile(__dirname + urlPath)
			.then(f => 
			{
				res.writeHead(200);
				res.end(f);
				console.log(`\tSent css: ${urlPath}`);
			})
			.catch(err =>
			{
				res.writeHead(404);
			});
	}
	
	//--------------------------HTML------------------------------
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
		console.log(`\tSent html: ${urlPath}`);
	}
}

//----------------------------------------------------------------
//								POST
//----------------------------------------------------------------

async function handlePostRequest(req, res, urlPath, urlArgs)
{
	//--------------------------FILE-----------------------------
	if(urlPath == "/sendFile")
	{	
		
		const form = formidable({
			uploadDir: __dirname + "/images/requests/raw", 
			filename: (name, ext, part, form) =>
			{
				let filetype = part.originalFilename.split('.');
				if(!req.session.filetype)
					req.session.filetype = "";
				req.session.filetype = filetype.at(-1);
				console.log(filetype.at(-1));
				req.session.save();
				return req.session.id.toString() + '.' + filetype.at(-1);
			
			},
			filter: function ({name, originalFilename, mimetype})
			{
				return mimetype && mimetype.includes("image");
			}
		});
		
		try
		{
		let fields;
		let files;
			// Read image data and create file in correct folder
			//console.log(form.IncomingForm.options.filename.toString());
			
			[fields, files] = await form.parse(req);
			console.log("File created");
			/*imageConnection.write(req.session.id.padEnd(1024, '\0'));
			imageConnection.on('data',
				data =>
				{
					console.log(data);
				}
			)
			*/
			
			form.on("end", () =>
			{
				fs.readFile(__dirname + "/images/requests/raw/" + req.session.id)
					.then(im => 
					{
						res.setHeader("Content-Type", "image/png");
						res.writeHead(201);
						res.end(im);
					})
					.catch(err =>
					{
						console.error(err);

						WriteHeaderPlain(res, 500, "File was sent on the server but cannot be read back")
					});
			});
			
		
		}
		catch (err)
		{
			console.error(err);
			WriteHeaderPlain(res, err.httpCode || 400, String(err));
			return;
		}
		
	}
	//-----------------------APPLY-FILTERS------------------------
	else if(urlPath == "/applyFilter")
	{
		const form = formidable({});
		let fields;
		let files;
		
		[fields, files] = await form.parse(req);
		
		console.log(fields);
		console.log(files);
		
		// Zapisanie instrukcji
		fs.writeFile(__dirname + "/images/requests/raw/" + req.session.id.toString() + ".json", JSON.stringify(fields))
			.then( () =>
			{
				console.log("File created");
				let message = req.session.id.toString() + "." + req.session.filetype;
				
				imageConnection.write(message.padEnd(1024, "\0"), () =>
				{
					
					// TODO: Przestawic eventa w inne miejsce bo powoduje problemy
					imageConnection.on("data", (data) =>
					{
					let read = data.toString()
					console.log(read);	
					
					if(read.search("GOOD") != -1)
					{
					console.log("Jest GOOD");
					WriteHeaderPlain(res, 201, "/images/requests/post_full/"+req.session.id.toString() + ".png");
					}
					else
					{
					WriteHeaderPlain(res, 500, "Wystapil blad podczas edytowania obrazu");
					}
					});
				});
			})
			.catch ( (err) =>
			{
				if (err)
				{
					WriteHeaderPlain(res, 500, "Wystapil blad podczas odczytu przeslanych danych");
					return;
				}
			});
	}
	
	//--------------------------LOGIN-----------------------------
	else if(urlPath == "/login")
	{
		const form = formidable({});
		let fields;
		let files;
		
		[fields, files] = await form.parse(req);
		
		sqlConnection.query('SELECT id, username FROM users WHERE username = ? AND password = ?',
			[fields.login[0], fields.password[0]],
			function(sqlerr, sqlres, sqlfld)
			{
				if(sqlerr)
				{
					WriteHeaderPlain(res, 500, "Blad dostepu do bazy danych")
					return;
				}
				console.log(sqlres);
				if(isEmpty(sqlres))
				{
					WriteHeaderPlain(res, 403, "Nie udalo sie zalogowac");
					return;
				}
				if(req.session.loggedIn)
				{
					WriteHeaderPlain(res, 403, "Uzytkownik juz zalogowany");
					 return;
				}
					req.session.loggedIn = true;
					req.session.username = sqlres[0].username;

					WriteHeaderPlain(res, 201, "Zalogowano");
					
					req.session.save(function(err) {
						if (err) throw err
					})
			});
		
		//TODO: Usuwac niebezpieczne znaki z login
		//TODO: Enkrypcja hasla
	}
	
	//--------------------------LOGOUT----------------------------
	else if(urlPath == "/logout")
	{
		if(req.session.loggedIn == true)
		{
			sessionStore.destroy(req.session.id, function(err)
			{
				if (err) throw err;
			});
			
			WriteHeaderPlain(res, 200, "Wylogowano");
			return;
		}
		else
		{
			WriteHeaderPlain(res, 401, "Nie zalogowano aby wylogowac");
			return;
		}	
	}
	
	//-------------------------REGISTER---------------------------
	else if(urlPath == "/register")
	{
		const form = formidable({});
		let fields;
		let files;
		
		[fields, files] = await form.parse(req);
		
		if(fields.password[0] !== fields.confpassword[0])
		{
			WriteHeaderPlain(res, 403, "Hasla nie sa takie same");
			return;
		}
		
		if( await CheckIfUsernameExists(fields.login[0]) === true)
		{
			WriteHeaderPlain(res, 403, "Ta nazwa uzytkownika jest juz zajeta")
			return;
		}
		
		sqlConnection.query('INSERT INTO users(username, password) VALUES (?, ?);',
			[fields.login[0], fields.password[0]],
			function(sqlerr, sqlres, sqlfld)
			{
				if(sqlerr)
					{
						WriteHeaderPlain(res, 500, "Blad dostepu do bazy danych")
						return;
					}
					
				if(req.session.loggedIn)
					{
						sessionStore.destroy(req.session.id, function(err)
						{
							if (err) throw err;
						});
					}
				req.session.loggedIn = true;
				req.session.username = fields.login[0];

				WriteHeaderPlain(res, 201, "Zarejestrowano");

				req.session.save(function(err) {
					if (err) throw err
				})
			});
	}
		
	else
	{
		WriteHeaderPlain(res, 404, "Wrong URL");
	}
}

//----------------------------------------------------------------
//							HTTP SERVER
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
//							IMAGE SERVER
//----------------------------------------------------------------


//----------------------------------------------------------------
//								MISC
//----------------------------------------------------------------

function isEmpty(obj)
{
	return Object.keys(obj).length === 0;
}

async function WriteHeaderPlain(res, hdr, msg)
{
	try
	{
	res.setHeader("Content-Type", "text/plain");
	res.writeHead(hdr);
	res.end(msg);
	console.log(`Przeslano ${msg}`);
	}
	catch
	{
		console.warn(`Nie mozna wyslac: ${msg}`);
	}
}

//----------------------------------------------------------------
//							  PROMISES
//----------------------------------------------------------------

const CheckIfUsernameExists = function(username)
{
	return new Promise ((resolve, reject) =>
	{
		sqlConnection.query('SELECT username FROM users WHERE username = ?', username,
			(sqlerr, sqlres, sqlfld) =>
			{
				if(sqlerr)
				{
					return reject(sqlerr)
				}
				if(isEmpty(sqlres))
				{
					return resolve(false);
				}
				return resolve(true);
			});
	});
};


//----------------------------------------------------------------
//								MAIN
//----------------------------------------------------------------



const server = http.createServer(app);


  
server.listen(settings.serverPort, settings.serverHost, () => {
  console.info(`Server is running on http://${settings.serverHost}:${settings.serverPort}`);
});
