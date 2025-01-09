#include "Server.h"

using json = nlohmann::json;

static std::string path = "../server/images/requests/";

Server::Server(unsigned short p) :
	port(p)
{}

Server::~Server()
{}

const static int maxFrameLength = 1024;

void ProcessImage(std::string fileName, asio::ip::tcp::socket* socket, std::mutex* mutSocket)
{
	auto imageData = new cimg_library::CImg<uint8_t>;
	//char pathTmp[sizeof(fileName) / sizeof(char) + 64];
	uint8_t message[maxFrameLength];
	std::ifstream paramFile;
	json js;

	char line[34];
	int i = 0;
	std::vector<IFilter*> filters;
	std::vector<IFilter*>::iterator it;
	IFilter::ReturnStatus filterStatus;

	#ifndef NDEBUG
	std::cout << "Processing of " << fileName << " has started" << std::endl;
	#endif

	
	std::string pathImage = path; pathImage.append("raw / ").append(fileName);
	std::string pathInstruction = pathImage; pathInstruction.append(".json");
	//std::string pathPreview = path; pathPreview.append("post_preview/").append(fileName);
	std::string pathFull = path; pathFull.append("post_full/").append(fileName);

	// Open image file
	imageData->assign(&pathImage[0]);

	// Open parameters file
	paramFile.open(pathInstruction, std::ios_base::in);

	if (!paramFile.good())
	{
		std::cout << "Error in parameter file" << std::endl;
		return;
	}
	js = json::parse(paramFile);
	unsigned int i = 1;

	while (true)
	{
		IFilter* fil = FilterManager::CreateFilter(&js, i, imageData);
		if (fil == nullptr)
			break;

		filters.push_back(fil);
	}


	for (it = filters.begin(); it != filters.end(); it++)
	{
		(*it)->RunFilter();
	}

	imageData->save_png(&pathFull[0],4);


	#ifndef NDEBUG
	std::cout << "Processing ended" << std::endl;
	#endif // !NDEBUG


	//mutSocket->lock();
	std::memset(message, '\0', sizeof(message));
	sprintf_s((char*)message, sizeof(message), "FINISH %s", fileName);
	asio::write(*socket, asio::buffer(message, maxFrameLength));
	//mutSocket->unlock();

	delete imageData;
	return;
}

void session(asio::ip::tcp::socket socket)
{
	//auto imageData = new cimg_library::CImg<uint8_t>;
	uint8_t message[maxFrameLength];
	char fileName[32];
	std::mutex mutSocket;

	std::cout << "Connected to JavaScript server" << std::endl;
	try
	{
		for (;;)
		{
			//std::cout << "petla" << std::endl;

			// Wait for message from JavaScript server
			asio::read(socket, asio::buffer(message, maxFrameLength));
			//mutSocket.lock();
			std::cout << "Message from Javascript server: " << message << std::endl;
			
			// Process message
			strcpy_s(fileName, 32, (char *)message);
			// Wrong info
				// Return error
			// Get image data from file
			// Decode image data into RGB(A) bitmap (maybe do those on separate thread)
				//imageData->assign("teste.png");
			
			std::thread(ProcessImage, fileName, &socket, &mutSocket).detach();
			// Process image
				//imageData->blur_box(100, 2);
			// Encode into right format
			// Save into file
				//imageData->save_png("teste_mod.png");
				//imageData->assign();
			
			// Return success
			std::memset(message, '\0', sizeof(message));
			sprintf_s((char *)message, sizeof(message), "START %s", fileName);
			asio::write(socket, asio::buffer(message, maxFrameLength));

			std::this_thread::yield();
			//mutSocket.unlock();
		}
	}
	catch (std::exception& e)
	{
		std::cerr << "Error in thread: " << e.what() << std::endl;
	}
}

void Server::ThreadRoutine()
{
	asio::io_service io_service; // Any program that uses asio need to have at least one io_service object
	asio::ip::tcp::acceptor acceptor(io_service, asio::ip::tcp::endpoint(asio::ip::tcp::v4(), port)); //create acceptor for listening purposes
	acceptor.listen(1024);
	while (isRunning())
	{
		asio::ip::tcp::socket socket(io_service); //create a socket for communication purposes
		acceptor.accept(socket); //then accept connection

		std::thread(session, std::move(socket)).detach();

		std::this_thread::yield();
	}
}


