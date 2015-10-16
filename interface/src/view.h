//
//  view.h
//  pbInterface
//
//  Created by Brian Turnbull on 9/23/15.
//
//

#ifndef view_h
#define view_h

#include "ofMain.h"
#include "videoGrabber.h"
#include "ofxTextSuite.h"
#include "positions.h"
#include <vector>
#include <string>


enum ViewMode { IDLE, PREVIEW, PENDING, CAPTURE, PROCESSING, FINISHED, ERROR, UNKNOWN};

class LoadingAnimation {
  public:
    LoadingAnimation(float x, float y);
    void setVisible(bool visible);
    void update();
    void draw();
  private:
    float x_;
    float y_;
    bool visible_;
    ofPolyline line_;
};

// Add copy/assign constructors.
class Image {
public:
    Image() : image(new ofImage()) {}
    Image(const Image& other)
        : path(other.path),
          image(new ofImage(*(other.image))) {}
    Image& operator=(const Image& rhs) {
        path = rhs.path;
        image.reset(new ofImage(*(rhs.image)));
    }

    string path;
    auto_ptr<ofImage> image;
    void swap(Image* other) {
        if (other != this) {
            ofImage* tmpImg = other->image.release();
            string tmpPath = other->path;
            other->path = path;
            other->image.reset(image.release());
            path = tmpPath;
            image.reset(tmpImg);
        }
    }

    // This disables textures because we can't allocate textures off the main thread.
    void preLoad(string newPath) {
        image->setUseTexture(false);
        if (!newPath.empty()) {
            path = newPath;
            image->loadImage(ofBufferFromFile(path, true));
        }
    }

    // Once back on the main thread, the image must be properly all
    void update() {
        if (path.size() && !image->isUsingTexture()) {
            image->setUseTexture(true);
            image->update();
        }
    }

    bool draw(int x, int y) {
        if (!path.empty()) {
            image->draw(x, y);
            return true;
        } else {
            return false;
        }
    }
};

class PhotoBar {
public:
    PhotoBar() : images_(4) {}
    void update(const vector<Image>& images);
    void draw(int x, int y);
private:
    vector<Image> images_;
};

class View {
public:
    virtual void draw() = 0;
    virtual void update() {};
    virtual void clear() {};
    View(ofxTextBlock* text) {
        text_ = text;
    };
    ~View() {};
protected:
    ofxTextBlock* text_;
};

class IdleView : public View {
public:
    IdleView(ofxTextBlock* text) : View(text) {};
    virtual void draw() {};
    virtual void update();
};

class PreviewView : public View {
public:
    PreviewView(VideoGrabber* preview, ofxTextBlock* text)
      : View(text),
        preview_(preview) {};
    virtual void draw();
    virtual void update();
private:
    VideoGrabber* preview_;
};

class PendingView : public View {
public:
    PendingView(PhotoBar* bar, VideoGrabber* preview,
                LoadingAnimation* load, ofxTextBlock* text)
      : View(text),
        bar_(bar),
        preview_(preview),
        load_(load),
        timeRemaining_("") {
            countdown_.init("verdana.ttf", COUNTDOWN_FONT_SIZE);
        };
    virtual void draw();
    virtual void update(const string& timeRemaining, bool capturing);
private:
    bool capturing_;
    ofxTextBlock countdown_;
    string timeRemaining_;
    PhotoBar* bar_;
    VideoGrabber* preview_;
    LoadingAnimation* load_;
};

class ProcessingView : public View {
public:
    ProcessingView(PhotoBar* bar, LoadingAnimation* load,
                   ofxTextBlock* text)
      : View(text),
        bar_(bar),
        load_(load){}
    virtual void draw();
    virtual void update(const string& msg);
private:
    PhotoBar* bar_;
    LoadingAnimation* load_;
};

class FinishedView : public View {
public:
    FinishedView(ofxTextBlock* text) : View(text) {
        font_.loadFont("verdana.ttf", 36, true, true);
    };
    virtual void draw();
    virtual void update(const Image& image, const string& shareUrl);
private:
    Image image_;
    string shareUrl_;
    ofTrueTypeFont font_;
};

class ErrorView : public View {
public:
    ErrorView(ofxTextBlock* text) : View(text) {};
    virtual void draw();
    virtual void update();
};

#endif /* view_h */
