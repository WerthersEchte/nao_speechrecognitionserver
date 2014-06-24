#include "speechprocessingserver.h"
#include <alcommon/alproxy.h>
#include <alproxies/altexttospeechproxy.h>
#include <alvalue/alvalue.h>
#include <iostream>

SpeechProcessingServer::SpeechProcessingServer(boost::shared_ptr<ALBroker> pBroker,
                                     std::string pName)
  : ALSoundExtractor(pBroker, pName), mToServerSocket(aios), mServerRuns(false)
{


    setModuleDescription("This module sends the microphonedata to an external recognitionprocessor, recieves the regognized words and writes them into the Memorykey <SpeechRecognition/LastWord>.");
    
    functionName("setRemoteServer", getName(), "Sets the address of the remote server.");
    addParam("aIp", "The ip of the remote server.");
    addParam("aPort", "The port of the remote server.");
    BIND_METHOD(SpeechProcessingServer::setRemoteServer);

    functionName("startRecognition", getName(), "Starts the speeachreconition.");
    BIND_METHOD(SpeechProcessingServer::startRecognition);

    functionName("stopRecognition", getName(), "Stops the speechreconition.");
    BIND_METHOD(SpeechProcessingServer::stopRecognition);

    functionName("isRunning", getName(), "Return serverstatus");
    setReturn("boolean", "returns true if running");
    BIND_METHOD(SpeechProcessingServer::isRunning);


}
#include <iostream>
#include <alvalue/alvalue.h>
void SpeechProcessingServer::init()
{
      mALMemoryKey = "speechprocessingserver/LastWord";

      audioDevice->callVoid("setClientPreferences",
                            getName(),                
                            48000,                    
                            4,         
                            1                         
                            );
      audioDevice->callVoid("setParameter", std::string("outputSampleRate"), 48000);

      mProxyToALMemory.declareEvent(mALMemoryKey);
}



SpeechProcessingServer::~SpeechProcessingServer()
{
    stopDetection();
}

bool SpeechProcessingServer::isRunning(){
    return mServerRuns;
}

void handler( const boost::system::error_code& error,  std::size_t bytes_transferred  ){}

/// Description: The name of this method should not be modified as this
/// method is automatically called by the AudioDevice Module.
void SpeechProcessingServer::process(const int & nbOfChannels, const int & nbOfSamplesByChannel, const AL_SOUND_FORMAT * buffer, const ALValue & timeStamp)
{

    if( mToServerSocket.is_open() && false ){
        boost::asio::async_write( mToServerSocket, boost::asio::buffer(buffer, nbOfSamplesByChannel*nbOfChannels), handler);
    }

}



void SpeechProcessingServer::setRemoteServer(const std::string &aIp, const std::string &aPort ){

    try
    {
        
        boost::asio::ip::tcp::resolver resolver(aios);
        boost::asio::ip::tcp::resolver::iterator endpoint = resolver.resolve(
        boost::asio::ip::tcp::resolver::query( aIp, aPort ));

        boost::asio::connect( mToServerSocket, endpoint);

    }
    catch(std::exception& e)
    {
        std::cerr << "Exception: " << e.what() << std::endl;
    }
    
}

void SpeechProcessingServer::startRecognition(){

    mServerRuns = true;
    startDetection();
    while( mServerRuns ){

        char buf[1024];
        boost::system::error_code error;
        size_t len = mToServerSocket.read_some(boost::asio::buffer(buf), error);

        if( error == boost::asio::error::eof ){
            break;
        }
        ALValue val;
        val.arrayPush(std::string( buf, len ));
        mProxyToALMemory.insertData( mALMemoryKey, std::string( buf, len ) );
        mProxyToALMemory.raiseEvent( mALMemoryKey, val );


    }

    mServerRuns = false;
    stopDetection();

}

void SpeechProcessingServer::stopRecognition(){

    mServerRuns = false;

}
