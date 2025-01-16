#include "IFilter.h"

using json = nlohmann::json;

IFilter::IFilter(unsigned int index, json *js, cimg_library::CImg<uint8_t> *img) :
	image(img), id(index), parameters(js)
{
	id_str = std::to_string(id);
}

IFilter::~IFilter()
{
	//delete image;
}
