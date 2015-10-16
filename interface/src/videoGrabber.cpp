//
//  videoGrabber.cpp
//  pbInterface
//
//  Created by Brian Turnbull on 9/26/15.
//
//

#include "videoGrabber.h"
#include "positions.h"
#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h>
#include <iostream>
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/un.h>
#include "FreeImage.h"

VideoGrabber::VideoGrabber(const string& addr)
: ofThread(), addr_(addr) {
    pixelsFront_.allocate(960, 640, 3);
    pixelsBack_.allocate(960, 640, 3);
    texture_.allocate(960,640,GL_RGB);

    initTime_ = 0;
    elapsedTime_ = 0;
    bytesReceived_ = 0;
    framesRendered_ = 0;
    currentBitRate_ = 0.0;
    currentFrameRate_ = 0.0;
}

int VideoGrabber::connect() {
    struct sockaddr_un remote;
    if ((sock_ = socket(AF_UNIX, SOCK_STREAM, 0)) == -1) {
        perror("socket");
        return 1;
    }

    cout << "Connecting: " << addr_ << endl;

    remote.sun_family = AF_UNIX;
    strcpy(remote.sun_path, addr_.c_str());
    //int len = strlen(remote.sun_path) + sizeof(remote.sun_family);
    int len = SUN_LEN(&remote);
    if (::connect(sock_, (struct sockaddr *)&remote, len) == -1) {
        perror("connect");
        cout << "Connection failed" << endl;
    } else {
        connected_ = true;
        cout << "Connected." << endl;
    }
}

void VideoGrabber::update() {
    if(!isMainThread()) {
        // Textures must be loaded in main thread.
        cerr << "update() may not be called from outside the main "
             << "thread.  Returning.";
        return;
    }
    if (connected_) {
        bool wasNewFrame = false;
        unsigned long now = ofGetSystemTime();
        //
        // BEGIN CRITICAL SECTION
        //
        mutex.lock();

        elapsedTime_ = (initTime_ == 0) ? 0 : (now - initTime_);
        if (backBufferReady_) {
            ++framesRendered_;
            swap(pixelsFront_, pixelsBack_);
            backBufferReady_ = false;
            wasNewFrame = true;
        }

        mutex.unlock();
        //
        // END CRITICAL SECTION
        //

        if (wasNewFrame) {
            texture_.loadData(pixelsFront_);
            if(elapsedTime_ > 0) {
                currentFrameRate_ = (float(framesRendered_) /
                                     (elapsedTime_ / (1000.0f)));
                currentBitRate_ = (float(bytesReceived_) * 8.0f /
                                   (elapsedTime_ / (1000.0f)));
            } else {
                currentFrameRate_ = 0.0;
                currentBitRate_   = 0.0;
            }
        }
    }
}

void VideoGrabber::draw(int x, int y) {
    ofPushStyle();
    ofSetColor(255);
    texture_.draw(x, y, PREVIEW_PHOTO_WIDTH, PREVIEW_PHOTO_HEIGHT);
    ofPopStyle();
    // TODO: overlay fps on video (optionally).
    // cout << "fps: " << currentFrameRate_ << endl;

}

void VideoGrabber::threadedFunction() {
    if (!connected_) {
        cerr << "You must call connect() before running VideoThread";
    }

    ssize_t t;
    size_t cur = 0; // The next index to write.
    size_t imgStart = 0;

    initTime_ = ofGetSystemTime(); // start time

    StreamMode mode = HEADER;
    while(isThreadRunning()) {
        if ((t=recv(sock_, buf_ + cur, BUFLEN-cur, NOFLAGS)) > 0) {
            lock();
            bytesReceived_ += t;
            unlock();
            size_t end = cur + t;
            while(cur != end) {
                if (mode == HEADER) {
                    // Keep reading until we get the next image.
                    if (buf_[cur] == SOI && cur != 0 && buf_[cur - 1] == JFF) {
                        // Start of an image.
                        // Reset buffer to load image bytes.
                        mode = JPEG;
                        imgStart = cur-1;
                        cur++;
                    } else {
                        cur++;
                    }
                } else if (mode == JPEG) {
                    // Keep reading until end of image.
                    if (buf_[cur] == EOI && buf_[cur - 1] == JFF) {
                        // End of image.
                        if( cur >= MIN_JPEG_SIZE) {
                            // Convert to bmp
                            ofBuffer tmp(&(buf_[imgStart]),
                                         cur + 1);
                            ofImage img;
                            img.setUseTexture(false);
                            if (img.loadImage(tmp)) {
                                pixelsBack_.swap(img.getPixelsRef());
                                //
                                // BEGIN CRITICAL SECTION
                                //
                                mutex.lock();
                                backBufferReady_ = true;
                                mutex.unlock();
                                //
                                // END CRITICAL SECTION
                                //
                            } else {
                                cerr << "Unable to load image from buffer.";
                            }
                        } else {
                            cout << "Skipping invalid image.";
                        }

                        // Copy remaining data to beginning of the buffer.
                        for(int i=0; cur != end;){
                            buf_[i++] = buf_[cur++];
                        }

                        // reset
                        cur = end = imgStart = 0;
                        mode = HEADER;
                    } else {
                        cur++;
                    }
                }
            }

            // Check for overflow
            if (cur >= BUFLEN) {
                cerr << "Buffer overflow.";
                cur = 0;
                mode = HEADER;
            }
        } else {
            if (t < 0) perror("recv");
            else cerr << "Server closed connection" << endl;
            return;
        }
    }
}
