#include "IThread.h"
#include "CImg.h"

#include "Server.h"


int main(int argn, char* argv)
{
	/*
	auto imageData = new cimg_library::CImg<UINT8>;
	imageData->assign("teste.png");

	imageData->laplacian();
	imageData->save_png("teste_mod.png", 4);
	*/

	Server server(8078);
	server.Start();

	std::cout << "Server is running" << std::endl;

	for (;;);

	server.Stop();
}