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
#include <vector>
#include <string>


enum ViewMode { IDLE, PREVIEW, PENDING, PROCESSING, FINISHED, ERROR, UNKNOWN};

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
        ofSetColor(255);
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

class PreviewPhoto {
public:
    PreviewPhoto() {}
    void update(const Image& image);
    void draw(int x, int y);
private:
    Image image_;
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
    PreviewView(PreviewPhoto* preview)
      : View(),
        previewPhoto_(preview) {};
    virtual void draw();
private:
    PreviewPhoto* previewPhoto_;
};

class PendingView : public View {
public:
    PendingView(PhotoBar* bar, PreviewPhoto* preview)
      : View(),
        photoBar_(bar),
        previewPhoto_(preview),
        timeRemaining_("") {};
    virtual void draw();
    virtual void update(const string& timeRemaining);
private:
    string timeRemaining_;
    PhotoBar* photoBar_;
    PreviewPhoto* previewPhoto_;
};

class ProcessingView : public View {
public:
    ProcessingView(PhotoBar* bar, PreviewPhoto* preview)
      : View(),
        photoBar_(bar),
        previewPhoto_(preview) {}
    virtual void draw();
private:
    PreviewPhoto* previewPhoto_;
    PhotoBar* photoBar_;
};

class FinishedView : public View {
public:
    FinishedView() : View() {};
    virtual void draw();
    virtual void update(const Image& image);
private:
    Image image_;
};

class ErrorView : public View {
public:
    ErrorView() : View() {};
    virtual void draw();
};

#endif /* view_h */
