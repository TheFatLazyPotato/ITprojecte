#pragma once
#include <string>

#include "F_Boxblur.h"
#include "F_Normalize.h"
#include "F_Quantize.h"

#include "CImg.h"
#include <json.hpp>

class FilterManager
{
public:
	static IFilter* CreateFilter(nlohmann::json *js, unsigned int index, cimg_library::CImg<uint8_t> *img);
};