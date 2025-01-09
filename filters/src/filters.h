#pragma once
#include <string>

#include "F_Boxblur.h"

#include "CImg.h"
#include <json.hpp>

class FilterManager
{
public:
	static IFilter* CreateFilter(nlohmann::json *js, unsigned int index, cimg_library::CImg<uint8_t> *img);
};