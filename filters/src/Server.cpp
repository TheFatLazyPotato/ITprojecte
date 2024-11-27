#include "Server.h"

Server::Server(unsigned short p) :
	port(p)
{}

Server::~Server()
{}

constexpr static int maxFrameLength = 1024;

void session(asio::ip::tcp::socket socket)
{
	auto imageData = new cimg_library::CImg<uint8_t>;
	uint8_t message[maxFrameLength];
	std::cout << "Connected to JavaScript server" << std::endl;
	try
	{
		for (;;)
		{
			//std::cout << "petla" << std::endl;
			asio::read(socket, asio::buffer(message, maxFrameLength));	//Nie czyta??????
			std::cout << "Message from Javascript server: " << message << std::endl;
				// Wait for message from JavaScript server
				// Process message
				// Wrong info
					// Return error
				// Get image data from file
				// Decode image data into RGB(A) bitmap (maybe do those on separate thread)
				imageData->assign("teste.png");

				// Process image
				imageData->blur_box(100, 2);
				// Encode into right format
				// Save into file
				imageData->save_png("teste_mod.png");
				imageData->assign();
				// Return success
		}
	}
	catch (std::exception& e)
	{
		std::cerr << "Error in thread: " << e.what() << std::endl;
	}

	delete imageData;
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


