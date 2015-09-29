# Photobooth
A full-featured photo booth implementation intended to be run on a Raspberry Pi
with either a Canon DSLR or Logitech webcam as the camera.  Everything here is
released with MIT License.

- ./embedded -- Main binary for Pi
- ./interface -- An openframeworks-based UI which is controlled by ./embedded
  JS.
- ./frontend -- A simple MEAN.js frontend for recording and serving photos.
- The photos themselves are stored and served with google cloud storage.

These are currently in varying stages of completion and it doesn't quite work
end-to-end.
