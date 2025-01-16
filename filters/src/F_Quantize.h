#pragma once
#include "IFilter.h"

class F_Quantize :
    public IFilter
{
public:
    F_Quantize(unsigned int index, nlohmann::json *js, cimg_library::CImg<uint8_t>* img);
    virtual ~F_Quantize();
    IFilter::ReturnStatus RunFilter();
};

