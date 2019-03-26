var captionLength = 0;
var caption = '';


$(document).ready(function () {
    setTimeout(showConsoleMessage,2000)
});

function showConsoleMessage() {
    setInterval('cursorAnimation()', 600);
    captionEl = $('#caption');
    caption = 'Sales Executive, Product Developer, & Amateur Pilot';
    type()
}

function type() {
    captionEl.html(caption.substr(0, captionLength++));
    if (captionLength < caption.length + 1) {
        setTimeout('type()', 100);
    } else {
        captionLength = 0;
        caption = '';
    }
}

function erase() {
    captionEl.html(caption.substr(0, captionLength--));
    if (captionLength >= 0) {
        setTimeout('erase()', 50);
    } else {
        captionLength = 0;
        caption = '';
    }
}

function cursorAnimation() {
    $('#cursor').animate({
        opacity: 0
    }, 'fast', 'swing').animate({
        opacity: 1
    }, 'fast', 'swing');
}