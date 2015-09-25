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
    Heading() {
        font_.loadFont("verdana.ttf", 60, true, true);
    };
    void draw();
private:
    ofTrueTypeFont font_;
};

struct Photo {
    string path;
    ofImage photo;
    void update(string newPath) {
        if (!newPath.empty()) {
            if (newPath != path) {
                path = newPath;
                photo.loadImage(ofBufferFromFile(path, true));
            }
        } else {
            path.clear();
            photo.clear();
        }
    }
    void draw(int x, int y) {
        ofSetColor(255);
        if (!path.empty()) {
            photo.draw(x, y);
        }
    }
    void clear() {
        update("");
    }
};

class PhotoBar {
public:
    PhotoBar() {}
    void update(vector<string> imgPaths);
    void clear();
    void draw(int x, int y);
private:
    Photo photo1_;
    Photo photo2_;
    Photo photo3_;
};

class PreviewPhoto {
public:
    PreviewPhoto() {}
    void update(string previewPath);
    void clear();
    void draw(int x, int y);
private:
    Photo photo_;
};

class View {
public:
    virtual void draw() = 0;
    virtual void update(std::vector<std::string> args) {
        args_ = args;
    };
    virtual void clear() {};
    View() {
      defaultFont_.loadFont("verdana.ttf", 14, true, true);
    };
    ~View() {};
protected:
    vector<string> args_;
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
    virtual void update(std::vector<std::string> args);
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
    virtual void update(std::vector<std::string>);
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
    virtual void update(std::vector<std::string>);
private:
    PreviewPhoto* previewPhoto_;
    PhotoBar* photoBar_;
};

class FinishedView : public View {
public:
    FinishedView() : View() {};
    virtual void draw();
    virtual void update(std::vector<std::string>);
private:
    Photo finalPhoto_;
};

class ErrorView : public View {
public:
    ErrorView() : View() {};
    virtual void draw();
};

#endif /* view_h */
