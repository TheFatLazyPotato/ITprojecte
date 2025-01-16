#include "F_Normalize.h"

using json = nlohmann::json;

F_Normalize::F_Normalize(unsigned int index, json *js, cimg_library::CImg<uint8_t>* img) :
	IFilter(index, js, img)
{}

F_Normalize::~F_Normalize()
{
}

IFilter::ReturnStatus F_Normalize::RunFilter()
{
	unsigned int bnd = 0;

	//auto p = (*parameters)["1"].template get<param>();

	float min = std::stof((*parameters)[id_str].value("min", "0.0"));
	float max = std::stof((*parameters)[id_str].value("max", "1.0"));

	try
	{
		//image->blur_box((*parameters)[id_str]["a"], (*parameters)[id_str]["b"], 1, bnd, (*parameters)[id_str]["iterations"]);
		image->normalize(min, max, 0.5);
	}
	catch (const std::exception e)
	{
		std::cout << e.what() << std::endl;
		return(IFilter::ReturnStatus::ERR_PARAM);
	}
	return(IFilter::ReturnStatus::SUCCESS);
}
