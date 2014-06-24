#ifndef SPEECHPROCESSINGSERVER_H
#define SPEECHPROCESSINGSERVER_H
#include <string>
#include <rttools/rttime.h>

#include <boost/asio.hpp>
#include <boost/shared_ptr.hpp>
#include <alvalue/alvalue.h>
#include <alproxies/almemoryproxy.h>
#include <alaudio/alsoundextractor.h>

using namespace AL;

class SpeechProcessingServer : public ALSoundExtractor
{

public:

    SpeechProcessingServer(boost::shared_ptr<ALBroker> pBroker, std::string pName);
    virtual ~SpeechProcessingServer();

    //method inherited from almodule that will be called after constructor
    void init();

    void process(   const int & nbOfChannels,
                    const int & nbrOfSamplesByChannel,
                    const AL_SOUND_FORMAT * buffer,
                    const ALValue & timeStamp);

    void setRemoteServer( const std::string &aIp, const std::string &aPort );

    void startRecognition();
    void stopRecognition();

    bool isRunning();

private:
    ALMemoryProxy mProxyToALMemory;
    std::string mALMemoryKey;

    boost::asio::io_service aios;
    boost::asio::ip::tcp::socket mToServerSocket;

    bool mServerRuns;
};
#endif

