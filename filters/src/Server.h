#pragma once
#define __STDC_WANT_LIB_EXT1__ 1

#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <mutex>

#include "IThread.h"
#include "filters.h"
#include "asio.hpp"
#include "CImg.h"
#include <json.hpp>

class Server :
    public IThread
{
public:
    struct OngoingTask
    {
        char name[32];
        bool done;
        bool toRestart;
    };

private:
    unsigned short port;
    std::mutex mut;

public:
    Server(unsigned short);
    virtual ~Server();
    void ThreadRoutine();
};

