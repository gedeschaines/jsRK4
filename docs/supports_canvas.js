// DESC:  Function to test browser support of HTML5 canvas element
// FILE:  supports_canvas.js
// DATE:  13 JUL 2012
// AUTH:  Gary E. Deschaines
// LINK:  https://github.com/gedeschaines/jsRK4/blob/master/docs/{FILE}
//
// Derived from code presented at the following link:
//   http://blog.andresvidal.com/post/3105836484/testing-for-html5-canvas-support-with-javascripts

function supports_canvas() {
    return !!document.createElement('canvas').getContext;
};
