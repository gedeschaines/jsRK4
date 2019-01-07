// DESC:  Canvas graph object for XY plots on given canvas and context.
// FILE:  canvas_graph.js
// DATE:  03 JUL 2012
// AUTH:  Gary E. Deschaines
// LINK:  https://github.com/gedeschaines/jsRK4/blob/master/docs/{FILE}

function canvas_graph(canvas,ctx,wmin,hmin,wmax,hmax) {

    var that = this;
    
    // Initialize canvas graph properties
  
    this.canvas = canvas;
    this.ctx    = ctx;
    this.intrvl = "";
    this.width  = canvas.width;
    this.height = canvas.height;
    this.wmin   = Math.max(wmin,0);
    this.wmax   = Math.min(wmax,this.width);
    this.wlen   = Math.abs(wmax-wmin);
    this.hmin   = Math.max(hmin,0);
    this.hmax   = Math.min(hmax,this.height);
    this.hlen   = Math.abs(hmax-hmin);
    this.xmin   = wmin;
    this.xmax   = wmax;
    this.xlen   = Math.abs(this.xmax-this.xmin);
    this.ymin   = hmax;
    this.ymax   = hmin;
    this.ylen   = Math.abs(this.ymax-this.ymin);
    this.xsfac  = 1.0;
    this.ysfac  = 1.0;
    
    function setGraphXYsfacs() {
        that.xsfac = (that.wmax-that.wmin)/(that.xmax-that.xmin);
        that.ysfac = (that.hmin-that.hmax)/(that.ymax-that.ymin);
    };
    
    setGraphXYsfacs();
    
    // Public methods
    
    this.setXYsfacs = function () {
        setGraphXYsfacs();
    };
    
    this.start_it = function startInterval(func,msec) {
        if ( this.intrvl == "" ) {
            this.intrvl = setInterval(func,msec);
        };
    };
    
    this.stop_it = function stopInterval(func) {
        if ( this.intrvl != "" ) {
            clearInterval(this.intrvl);
            this.intrvl = "";
        };
    };
};

canvas_graph.prototype.setWHLimits = function (wmin,wmax,hmin,hmax) {
    this.wmin = Math.max(wmin,0);
    this.wmax = Math.min(wmax,this.width);
    this.wlen = Math.abs(wmax-wmin);
    this.hmin = Math.max(hmin,0);
    this.hmax = Math.min(hmax,this.height);
    this.hlen = Math.abs(hmax-hmin);
    this.setXYsfacs();
};
    
canvas_graph.prototype.setXYLimits = function (xmin,xmax,ymin,ymax) {
    this.xmin = xmin;
    this.xmax = xmax;
    this.xlen = Math.abs(xmax-xmin);
    this.ymin = ymin;
    this.ymax = ymax;
    this.ylen = Math.abs(ymax-ymin);
    this.setXYsfacs();
};
    
canvas_graph.prototype.getWofX = function (x) {
    xdel = x - this.xmin;
    w    = Math.round(this.xsfac*xdel) + this.wmin;
    return w;
};
    
canvas_graph.prototype.getHofY = function (y) {
    ydel = y - this.ymin;
    h    = Math.round(this.ysfac*ydel) + this.hmax;
    return h;
};
    
canvas_graph.prototype.setFont = function (color,style,size,family) {
    this.ctx.fillStyle = color;
    this.ctx.font = style + " " + size + "px " + family;
};
    
canvas_graph.prototype.placeText = function (color,text,w,h,ang,align,baseline) {
    this.ctx.save();
    this.ctx.fillStyle    = color;
    this.ctx.textBaseline = baseline;
    this.ctx.textAlign    = align;
    this.ctx.translate(w,h);  
    this.ctx.rotate(ang*Math.PI/180); 
    this.ctx.fillText(text, 0, 0);
    this.ctx.restore();
};

canvas_graph.prototype.labelXaxis = function (color,nt,tlen,xmin,xmax,yval) {
    if ( nt > 1 ) {
        var xdel, xval, wval, hval, w, h;
        xdel = (xmax - xmin)/(nt-1);
        hval = this.getHofY(yval);
        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle   = color;
        this.ctx.font = "10px sans-serif";
        for (var i = 0; i < nt; i++) {
            xval = xmin + xdel*i;
            wval = this.getWofX(xval);
            this.ctx.beginPath();
            this.ctx.moveTo(wval,hval);
            this.ctx.lineTo(wval,hval+tlen);
            this,ctx.stroke();
            this.ctx.textAlign = 'center';
            xtxt = xval.toString();
            w    = wval;
            if ( tlen > 0 ) {
                // label below yval
                this.ctx.textBaseline = 'top';
                h = hval + tlen;
                this.ctx.fillText(xtxt,w,h);
            } else if ( tlen < 0 ) {
                // label above yval
                this.ctx.textBaseline = 'bottom';
                h = hval + tlen;
                this.ctx.fillText(xtxt,w,h);
            } else {
                // label placed on yval
                this.ctx.textBaseline = 'middle';
                h = hval;
                this.ctx.fillText(xtxt,w,h);
            };
        };
        this.ctx.restore();
    };
};

canvas_graph.prototype.labelYaxis = function (color,nt,tlen,ymin,ymax,xval) {
    if ( nt > 1 ) {
        var ydel, yval, wval, hval, w, h;
        ydel = (ymax - ymin)/(nt-1);
        wval = this.getWofX(xval);
        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle   = color;
        this.ctx.font = "10px sans-serif";
        for (var i = 0; i < nt; i++) {
            yval = ymin + ydel*i;
            hval = this.getHofY(yval);
            this.ctx.beginPath();
            this.ctx.moveTo(wval,     hval);
            this.ctx.lineTo(wval+tlen,hval);
            this.ctx.stroke();
            ytxt = yval.toString();
            h    = hval;
            this.ctx.textBaseline = 'middle';
            if ( tlen > 0 ) {
                // label right of xval
                this.ctx.textAlign = 'start';
                w = wval + tlen;
                this.ctx.fillText(ytxt,w,h);
            } else if ( tlen < 0 ) {
                // label left of xval
                this.ctx.textAlign = 'end';
                w = wval + tlen;
                this.ctx.fillText(ytxt,w,h);
            } else {
                // label placed on xval
                this.ctx.textAlign = 'center';
                w = wval;
                this.ctx.fillText(ytxt,w,h);
            };
        };
        this.ctx.restore();
    };
};

canvas_graph.prototype.drawXgrid = function (width,color,xmin,xmax,xdel) {
    var x, w, hmin, hmax;
    hmin = this.getHofY(this.ymin);
    hmax = this.getHofY(this.ymax);
    this.ctx.save();
    this.ctx.lineWidth   = width;
    this.ctx.strokeStyle = color;
    x = xmin;
    while (x <= xmax) {
        w = this.getWofX(x);
        this.ctx.beginPath();
        this.ctx.moveTo(w,hmin);
        this.ctx.lineTo(w,hmax);
        this.ctx.stroke();
        x = x + xdel;
    };
    this.ctx.restore();
};
    
canvas_graph.prototype.drawYgrid = function (width,color,ymin,ymax,ydel) {
    var y, h, wmin, wmax;
    wmin = this.getWofX(this.xmin);
    wmax = this.getWofX(this.xmax);
    this.ctx.save();
    this.ctx.lineWidth   = width;
    this.ctx.strokeStyle = color;
    y = ymin;
    while (y <= ymax) {
        h = this.getHofY(y);
        this.ctx.beginPath();
        this.ctx.moveTo(wmin,h);
        this.ctx.lineTo(wmax,h);
        this.ctx.stroke();
        y = y + ydel;
    };
    this.ctx.restore();
};

canvas_graph.prototype.drawXaxis = function (width,color,xmin,xmax,yval) {
    wmin = this.getWofX(xmin);
    wmax = this.getWofX(xmax);
    h    = this.getHofY(yval);
    this.ctx.save();
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(wmin,h);
    this.ctx.lineTo(wmax,h);
    this.ctx.stroke();
    this.ctx.restore();
};
    
canvas_graph.prototype.drawYaxis = function (width,color,ymin,ymax,xval) {
    hmin = this.getHofY(ymin);
    hmax = this.getHofY(ymax);
    w    = this.getWofX(xval);
    this.ctx.save();
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;;
    this.ctx.beginPath();
    this.ctx.moveTo(w,hmin);
    this.ctx.lineTo(w,hmax);
    this.ctx.stroke();
    this.ctx.restore();
};
    
canvas_graph.prototype.drawWHdot = function (width,color,fill,w,h,r) {
    this.ctx.save();
    this.ctx.fillStyle = fill;
    this.ctx.beginPath();
    this.ctx.arc(w, h, r, 0.0, 2*Math.PI, true);
    this.ctx.fill();
    if ( width > 0 ) {
        this.ctx.lineWidth   = width;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    };
    this.ctx.restore();
};
    
canvas_graph.prototype.drawXYdot = function (width,color,fill,x,y,r) {
    w = this.getWofX(x);
    h = this.getHofY(y);
    this.ctx.save();
    this.ctx.rect(this.wmin,this.hmin,this.wlen,this.hlen);
    this.ctx.clip();
    this.ctx.fillStyle = fill;
    this.ctx.beginPath();
    this.ctx.arc(w, h, r, 0.0, 2*Math.PI, true);
    this.ctx.fill();
    if ( width > 0 ) {
        this.ctx.lineWidth   = width;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    };
    this.ctx.restore();
};

canvas_graph.prototype.drawWHline = function (width,color,w1,h1,w2,h2) {
    this.ctx.save();
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(w1,h1);
    this.ctx.lineTo(w2,h2);
    this.ctx.stroke();
    this.ctx.restore();
};

canvas_graph.prototype.drawXYline = function (width,color,x1,y1,x2,y2) {
    w1 = this.getWofX(x1);
    h1 = this.getHofY(y1);
    w2 = this.getWofX(x2);
    h2 = this.getHofY(y2);
    this.ctx.save();
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(w1,h1);
    this.ctx.lineTo(w2,h2);
    this.ctx.stroke();
    this.ctx.restore();
};

canvas_graph.prototype.drawWHbox = function (width,color,fill,w,h,wlen,hlen) {
    wmin = w - wlen/2.0;
    wmax = w + wlen/2.0;
    wref = Math.max(0,Math.min(wmin,wmax));
    wlen = Math.min(Math.abs(wmax-wmin),this.width);
    hmin = h - hlen/2.0;
    hmax = h + hlen/2.0;
    href = Math.max(0,Math.min(hmin,hmax));
    hlen = Math.min(Math.abs(hmax-hmin),this.height);
    this.ctx.save();
    this.ctx.fillStyle = fill;
    this.ctx.fillRect(wref,href,wlen,hlen);
    if ( width > 0 ) {
        this.ctx.lineWidth   = width;
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(wref,href,wlen,hlen);
    };
    this.ctx.restore();
};

canvas_graph.prototype.drawXYbox = function (width,color,fill,x,y,xlen,ylen) {
    xmin = Math.max(this.xmin,x-xlen/2.0);
    xmax = Math.min(this.xmax,x+xlen/2.0);
    wmin = this.getWofX(xmin);
    wmax = this.getWofX(xmax);
    wref = Math.max(0,Math.min(wmin,wmax));
    wlen = Math.min(Math.abs(wmax-wmin),this.width);
    ymin = Math.max(this.ymin,y-ylen/2.0);
    ymax = Math.min(this.ymax,y+ylen/2.0);
    hmin = this.getHofY(ymin);
    hmax = this.getHofY(ymax);
    href = Math.max(0,Math.min(hmin,hmax));
    hlen = Math.min(Math.abs(hmax-hmin),this.height);
    this.ctx.save();
    this.ctx.rect(this.wmin,this.hmin,this.wlen,this.hlen);
    this.ctx.clip();
    this.ctx.fillStyle = fill;
    this.ctx.fillRect(wref,href,wlen,hlen);
    if ( width > 0 ) {
        this.ctx.lineWidth   = width;
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(wref,href,wlen,hlen);
    };
    this.ctx.restore();
};
