#pragma once
#include "IFilter.h"

class F_Normalize :
    public IFilter
{
public:
    F_Normalize(unsigned int index, nlohmann::json *js, cimg_library::CImg<uint8_t>* img);
    virtual ~F_Normalize();
    IFilter::ReturnStatus RunFilter();
};

