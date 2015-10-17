//  videoThread.h
//  pbInterface
//
//  Created by Brian Turnbull on 9/26/15.
//
//

#ifndef videoGrabber_h
#define videoGrabber_h

#include "ofMain.h"

// minimum number of bytes for a valid jpeg
static const int MIN_JPEG_SIZE = 134;
static const int BUFLEN = 1*1024*1024;  // 1 MB

// jpeg starting and ending bytes
static const char JFF = 0xFF;
static const char SOI = 0xD8;
static const char EOI = 0xD9;

enum StreamMode {HEADER, JPEG};

#define NOFLAGS 0


class VideoGrabber : public ofThread {
public:
    VideoGrabber(const string& addr);
    int connect();
    void update();
    void clear();
    void draw(int x, int y);
private:
    void resetBuffers();
    void threadedFunction();

    // Stats
    unsigned long initTime_; // init time
    unsigned long elapsedTime_;
    unsigned long bytesReceived_;
    unsigned long framesRendered_;

    float currentBitRate_;
    float currentFrameRate_;

    // Net internals
    const string& addr_;
    int sock_;
    char buf_[BUFLEN];
    bool connected_;

    // Image buffers
    bool backBufferReady_;
    ofPixels pixelsFront_, pixelsBack_;
    ofTexture texture_;

    // Buffers have been reset (and not yet written into).
    bool clear_;
};

#endif /* videoGrabber_h */
