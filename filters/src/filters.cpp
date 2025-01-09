#include "filters.h"

using json = nlohmann::json;

IFilter* FilterManager::CreateFilter(json *js, unsigned int index, cimg_library::CImg<uint8_t>* img)
{
	IFilter* result = nullptr;
	if ((*js)[std::to_string(index)]["id"] == "boxblur")
	{
		result = new F_Boxblur(index, js, img);
		#ifndef NDEBUG
		std::cout << "Created " << "boxblur" << std::endl;
		#endif // !NDEBUG
	}
	return result;
}
