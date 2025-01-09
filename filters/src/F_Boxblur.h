#pragma once
#include "IFilter.h"
class F_Boxblur :
    public IFilter
{
public:
    F_Boxblur(unsigned int index, nlohmann::json *js, cimg_library::CImg<uint8_t>* img);
    virtual ~F_Boxblur();
    IFilter::ReturnStatus RunFilter();
};

