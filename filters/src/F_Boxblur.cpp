#include "F_Boxblur.h"

using json = nlohmann::json;

static struct param {
	float a;
	float b;
	int boundary;
	int iterations;
};

F_Boxblur::F_Boxblur(unsigned int index, json *js, cimg_library::CImg<uint8_t>* img) :
	IFilter(index, js, img)
{}

F_Boxblur::~F_Boxblur()
{
}

IFilter::ReturnStatus F_Boxblur::RunFilter()
{
	unsigned int bnd = 0;

	//auto p = (*parameters)["1"].template get<param>();

	if		((*parameters)[id_str]["boundary"] == "dirichlet")	bnd = 0;
	else if ((*parameters)[id_str]["boundary"] == "neumann")	bnd = 1;
	else if ((*parameters)[id_str]["boundary"] == "periodic")	bnd = 2;
	else if ((*parameters)[id_str]["boundary"] == "mirror")		bnd = 3;
	else return(IFilter::ReturnStatus::ERR_PARAM);

	int a = std::stoi((*parameters)[id_str].value("a", "1"));
	int b = std::stoi((*parameters)[id_str].value("b", "1"));
	int iter = std::stoi((*parameters)[id_str].value("iter", "1"));

	try
	{
		//image->blur_box((*parameters)[id_str]["a"], (*parameters)[id_str]["b"], 1, bnd, (*parameters)[id_str]["iterations"]);
		image->blur_box(a, b, bnd, iter);
	}
	catch (const std::exception e)
	{
		std::cout << e.what() << std::endl;
		return(IFilter::ReturnStatus::ERR_PARAM);
	}
	return(IFilter::ReturnStatus::SUCCESS);
}
