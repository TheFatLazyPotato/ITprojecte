
#include "IThread.h"
#include "CImg.h"
#include "filters.h"

#include "Server.h"

#include <json.hpp>
#include <fstream>

using json = nlohmann::json;

int main(int argn, char* argv)
{
	/*
	auto imageData = new cimg_library::CImg<UINT8>;
	imageData->assign("teste.png");

	imageData->laplacian();
	imageData->save_png("teste_mod.png", 4);
	*/

	
	std::cout << "testettete" << std::endl;

	Server server(8078);
	server.Start();

	std::cout << "Server is running" << std::endl;
	

	/*
	std::fstream file;
	file.open("teste_filter.json", std::ios_base::in);
	json teste = json::parse(file);

	cimg_library::CImg<uint8_t> img;
	img.assign("teste.png");
	*/

	//IFilter *fil = FilterManager::CreateFilter(&teste, 1, &img);

	//fil->AddInstruction();
	//fil->RunFilter();

	//img.save_png("teste2.png");

	for (;;);

	server.Stop();
}