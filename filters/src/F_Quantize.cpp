#include "F_Quantize.h"

using json = nlohmann::json;

F_Quantize::F_Quantize(unsigned int index, json *js, cimg_library::CImg<uint8_t>* img) :
	IFilter(index, js, img)
{}

F_Quantize::~F_Quantize()
{
}

IFilter::ReturnStatus F_Quantize::RunFilter()
{
	unsigned int bnd = 0;

	//auto p = (*parameters)["1"].template get<param>();

	unsigned int n = std::stoi((*parameters)[id_str].value("n", "256"));
	// bool keep_range = (*parameters)[id_str].value("keeprange", true);

	try
	{
		//image->blur_box((*parameters)[id_str]["a"], (*parameters)[id_str]["b"], 1, bnd, (*parameters)[id_str]["iterations"]);
		image->quantize(n, false);
		(*image) *= (float)255 / (n-1);
	}
	catch (const std::exception e)
	{
		std::cout << e.what() << std::endl;
		return(IFilter::ReturnStatus::ERR_PARAM);
	}
	return(IFilter::ReturnStatus::SUCCESS);
}
