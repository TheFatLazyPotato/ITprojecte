#include "filters.h"

using json = nlohmann::json;

IFilter* FilterManager::CreateFilter(json *js, unsigned int index, cimg_library::CImg<uint8_t>* img)
{
	IFilter* result = nullptr;

	if (!(*js).contains(std::to_string(index)))
	{
		return result;
	}
	std::string type = (*js)[std::to_string(index)].value("id", "null");

	if (type == "boxblur")
	{
		result = new F_Boxblur(index, js, img);
		#ifndef NDEBUG
		std::cout << "Created " << "boxblur" << std::endl;
		#endif // !NDEBUG
	}
	else if (type == "normalize")
	{
		result = new F_Normalize(index, js, img);
		#ifndef NDEBUG
		std::cout << "Created " << "normalize" << std::endl;
		#endif // !NDEBUG
	}
	else if (type == "quantize")
	{
		result = new F_Quantize(index, js, img);
		#ifndef NDEBUG
		std::cout << "Created " << "quantize" << std::endl;
		#endif // !NDEBUG
	}
	return result;
}
