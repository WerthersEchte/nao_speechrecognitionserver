# Copyright (C) 2010 Aldebaran Robotics

cmake_minimum_required(VERSION 2.6.4 FATAL_ERROR)
project(speechrecognitionserver)
find_package(qibuild)

option(SOUNDPROCESSING_IS_REMOTE
  "module is compiled as a remote module (ON or OFF)"
  ON)

set(_srcs
    main.cpp
    speechprocessingserver.h
    speechprocessingserver.cpp
)

qi_create_lib(speechrecognitionserver SHARED ${_srcs})

qi_use_lib(speechrecognitionserver ALCOMMON ALAUDIO BOOST)
