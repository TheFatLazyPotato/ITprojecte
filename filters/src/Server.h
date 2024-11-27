#pragma once
#include <iostream>
#include <string>

#include "IThread.h"
#include "asio.hpp"
#include "CImg.h"

class Server :
    public IThread
{
    unsigned short port;
public:
    Server(unsigned short);
    virtual ~Server();
    void ThreadRoutine();
};

