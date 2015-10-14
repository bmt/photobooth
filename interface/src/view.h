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
#include <vector>
#include <string>


enum ViewMode { IDLE, PREVIEW, PENDING, PROCESSING, FINISHED, ERROR, UNKNOWN};

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

class Heading {
public:
    void clear();
    Heading() {
        font_.loadFont("verdana.ttf", 60, true, true);
    };
    void draw();
private:
    ofTrueTypeFont font_;
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

    void draw(int x, int y) {
        if (!path.empty()) {
            image->draw(x, y);
        }
    }
};

class PhotoBar {
public:
    PhotoBar() : images_(3) {}
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
    View() {
      defaultFont_.loadFont("verdana.ttf", 14, true, true);
    };
    ~View() {};
protected:
    ofTrueTypeFont defaultFont_;
};

class IdleView : public View {
public:
    IdleView() : View() {};
    virtual void draw();
};

class PreviewView : public View {
public:
    PreviewView(VideoGrabber* preview)
      : View(),
        preview_(preview) {};
    virtual void draw();
private:
    VideoGrabber* preview_;
};

class PendingView : public View {
public:
    PendingView(PhotoBar* bar, VideoGrabber* preview, LoadingAnimation* load)
      : View(),
        bar_(bar),
        preview_(preview),
        load_(load),
        timeRemaining_("") {
            font_.loadFont("verdana.ttf", 80, true, true);
        };
    virtual void draw();
    virtual void update(const string& timeRemaining);
private:
    ofTrueTypeFont font_;
    string timeRemaining_;
    PhotoBar* bar_;
    VideoGrabber* preview_;
    LoadingAnimation* load_;
};

class ProcessingView : public View {
public:
    ProcessingView(PhotoBar* bar, LoadingAnimation* load)
      : View(),
        bar_(bar),
        load_(load){}
    virtual void draw();
    virtual void update(const string& msg);
private:
    PhotoBar* bar_;
    LoadingAnimation* load_;
    string msg_;
};

class FinishedView : public View {
public:
    FinishedView() : View() {
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
    ErrorView() : View() {};
    virtual void draw();
};

#endif /* view_h */
