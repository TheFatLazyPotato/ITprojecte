#include "F_Boxblur.h"

using json = nlohmann::json;

F_Boxblur::F_Boxblur(unsigned int index, json *js, cimg_library::CImg<uint8_t>* img) :
	IFilter(index, js, img)
{}

F_Boxblur::~F_Boxblur()
{
}

IFilter::ReturnStatus F_Boxblur::RunFilter()
{
	unsigned int bnd = 0;

	if		((*parameters)[id_str]["boundary"] == "dirichlet")	bnd = 0;
	else if ((*parameters)[id_str]["boundary"] == "neumann")	bnd = 1;
	else if ((*parameters)[id_str]["boundary"] == "periodic")	bnd = 2;
	else if ((*parameters)[id_str]["boundary"] == "mirror")		bnd = 3;
	else return(IFilter::ReturnStatus::ERR_PARAM);

	try
	{
		image->blur_box((*parameters)[id_str]["a"], (*parameters)[id_str]["b"], 1, bnd, (*parameters)[id_str]["iterations"]);
	}
	catch (const std::exception e)
	{
		std::cout << e.what() << std::endl;
		return(IFilter::ReturnStatus::ERR_PARAM);
	}
	return(IFilter::ReturnStatus::SUCCESS);
}
