#pragma once
#define __STDC_WANT_LIB_EXT1__ 1

#include <vector>
#include <fstream>
#include <string>
#include <iostream>

#include "CImg.h"
#include <json.hpp>

#ifndef NDEBUG
	#include <iostream>
#endif // !NDEBUG


class IFilter
{
public:
	enum ReturnStatus
	{
		SUCCESS,
		FILE_ERR,
		ERR_PARAM,
		ERR_NO_FILTER
	};

protected:
	unsigned int id;
	std::string id_str;

	nlohmann::json *parameters;
	cimg_library::CImg<uint8_t> *image;
	//char imageName[128];
	//char imageFormat[10];
	
public:
	IFilter(unsigned int index, nlohmann::json *js, cimg_library::CImg<uint8_t> *img);
	virtual ~IFilter();

	ReturnStatus AddInstruction();
	//cimg_library::CImg<uint8_t>* GetImage();

	virtual ReturnStatus RunFilter() = 0;
};