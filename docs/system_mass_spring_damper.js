// DESC:  Ideal mass-spring-damper system
// FILE:  system_mass_spring_damper.js
// DATE:  03 JUL 2012
// AUTH:  Gary E. Deschaines
// LINK:  http://home.hiwaay.net/~gedesch/GED/gedwsapp/data/scripts/{FILE}

// The force equation for an ideal mass-spring-damper system
// is defined as F = Fg - Fd - Fs.  The force Fg is due to
// gravity acting on the mass in the +x direction.  The force
// Fd is due to the damper and is always acting in the opposite
// direction to the mass velocity.  The force Fs is due to the
// spring and is always acting in the opposite direction to the
// mass displacement.  Given F=ma, Fg=mg, Fd=cv and Fs=kx, where
// m, c, k and g are constants defined below, and a, v and x denote 
// acceleration, velocity and displacement of the mass respectively,
// the force equation can be expressed as the 2nd order linear
// differential equation of motion -- ma = mg - c*v - k*x.  This
// equation can be further simplified by dividing through by m to
// yield -- a = g - (C1*v + C2*x), where:
//   
//    C1 = c/m = 2*zeta*omegan, since zeta = c/(2*sqrt(k*m))
//    C2 = k/m = omegan*omegan, since omegan = sqrt(k/m)
//
// This 2nd order ordinary differential equation can be expressed
// as two first order ordinary differential equations by noting 
// that v = dx/dt and a = dv/dt.  The state derivative vector dS
// containing the elements dt/dt, dx/dt and dv/dt, when integrated
// over time, yields the state vector S containing the elements t,
// x and v, which specify the displacement x and velocity v of the
// mass at time t.

function system_mass_spring_damper(im,ik,ic,ilen,gflag) {

    // Private properties set when object instantiated
    
    var that = this;  // this object
    var im   = im;
    var ik   = ik;
    var ic   = ic;
    var ilen = ilen;
    
    // Specified system properties
    
    this.m   = im;    // mass
    this.k   = ik;    // spring constant
    this.c   = ic;    // damping coefficient
    this.len = ilen;  // unsprung spring length
    
    // Set gravitational acceleration

    var  g = gflag ? 9.81 : 0.0;
    this.g = g;   

    // Calculated system properties
   
    var wn = Math.sqrt(ik/im);
    var z  = ic/(2.0*im*wn);
    
    this.omegan = wn;         // undamped natural frequency
    this.zeta   = z;          // damping ratio
    this.xSS    = g*(im/ik);  // steady-state solution to x,
                              // (i.e., x when v=0 and a=0)
    this.C1 = ic/im;  // constant term for dotS function
    this.C2 = ik/im;  // constant term for dotS function
    
    function calcProperties(im,ik,ic,ig) {
        wn = Math.sqrt(ik/im);
        z  = ic/(2.0*im*wn);
        
        that.omegan = wn;          // undamped natural frequency
        that.zeta   = z;           // damping ratio
        that.xSS    = ig*(im/ik);  // steady-state solution to x,
                                   // (i.e., x when v=0 and a=0)
        that.C1 = ic/im;  // constant term for dotS function
        that.C2 = ik/im;  // constant term for dotS function
    };
    this.calcProps = function (im,ik,ic,ig) {
        return calcProperties(im,ik,ic,ig);
    };
    
    // Property description text
    
    this.desc_m      = "mass";
    this.desc_k      = "spring constant";
    this.desc_c      = "damping coefficient";
    this.desc_len    = "unstressed spring length";
    this.desc_g      = "graviational acceleration";
    this.desc_omegan = "undamped natural frequency";
    this.desc_zeta   = "damping ratio";
    this.desc_xSS    = "steady-state solution";

    // Set methods
    
    function setMass(im) {
        that.m = im;
        calcProperties(im,that.k,that.c,that.g);
    };
    function setSpringConstant(ik) {
        that.k = ik;
        calcProperties(that.m,ik,that.c,that.g);
    };
    function setDampingCoefficient(ic) {
        that.c = ic;
        calcProperties(that.m,that.k,ic,that.g);
    };
    function setUnsprungLength(ilen) {
        that.len = ilen;
    };
    function setGravity(gflag) {
        g = gflag ? 9.81 : 0.0;
        that.g = g;
        calcProperties(that.m,that.k,that.c,g);
    };
    
    this.set_m = function(im) {
        return setMass(im);
    };
    this.set_k = function(ik) {
        return setSpringConstant(ik);
    };
    this.set_c = function(ic) {
        return setDampingCoefficient(ic);
    };
    this.set_len = function(ilen) {
        that.len = ilen;
    };
    this.set_g = function(ig) {
        return setGravity(ig);
    };
    
    // System state properties and methods
    
    this.n  = 3;                  // number of elements in state vector
    this.S  = new Array(this.n);  // state vector
    this.x0 = this.xSS;
    this.v0 = 0.0;

    function initStateVector(x0,v0) {
        that.x0 = x0;
        that.v0 = v0;
        that.S = [0.0, that.x0, that.v0];  // initial conditions [t0,x0,v0]
    };
    initStateVector(this.xSS,0.0);  // initialize to steady-state solution
    
    this.init_S = function(x0,v0) {
        return initStateVector(x0,v0);
    };   
   
    // System of 1st order differential equations corresponding to the
    // 2nd order differential equation of motion a = g - (C1*v + C2*x),
    // which can be expressed as dv/dt = g - (C1*dx/dt + C2*x) to yield  
    // the following derivations for dS from the system state vector S:
    //
    //   S[0]=t => dS[0} = d(S[0])/dt = dt/dt = 1
    //   S[1]=x => dS[1] = d(S[1])/dt = dx/dt = v
    //   S[2]=v => dS[2] = d(S[2])/dt = dv/dt = a = g - (C1*v + C2*x)    
    
    function private_dotS(n,S) {
        x  = S[1];
        v  = S[2];
        dS = new Array(n);
        dS[0] = 1.0;
        dS[1] = v;
        dS[2] = that.g - (that.C1*v + that.C2*x);
        return dS;
    };
    this.dotS = function (n,S) {
        return private_dotS(n,S);
    };
    
    // Private properties and methods used by the privileged 
    // plotExactSolution method
    
    var solveFunc     = new sys_msd_SolveFunctions(that);
    var case_text     = "";
    var form_text     = "";
    var exactSolution = null;
    
    function setExactSolution(solveFunc) {
        exactSolution = null;
        if ( solveFunc != null ) {
            solveFunc.setCaseFunc(that);
            case_text = solveFunc.case_text;
            form_text = solveFunc.form_text;
            if ( solveFunc.case_func != null ) {
                exactSolution = function (t) {
                    return solveFunc.case_func(t);
                };
            };
        };
    };

    setExactSolution(solveFunc);
    
    // If a closed form solution exists for the mass-spring-damper
    // system characterized by it's properties, then the following
    // routine will plot the exact solution on the given graph.
    
    this.plotExactSolution = function(graph, tMin, tMax, tDel) {
        if ( graph == null ) {
            return;
            if ( graph.ctx == null ) {
                return;
            };
        };
        var  ctx, width, height, t, tdel, x, w, h;
        ctx    = graph.ctx;
        width  = graph.width;
        height = graph.height;
        wZero  = Math.round(width/2);
        hZero  = Math.round(height/2);
        t      = tMin;
        tdel   = tDel;
        // plot steady-state solution
        x = Math.round(that.xSS*10000.0)/10000.0;
        graph.drawXYline(1,'#FF00FF',tMin,x,tMax,x);      
        // label steady-state solution plot
        w    = graph.wmin + 2;
        h    = graph.hmax - 2;
        text = "Steady-State Solution (x at v=0,a=0) = " + x;
        ctx.save();
        graph.setFont('#FF00FF','normal',10,'sans-serif');
        graph.placeText('#FF00FF',text,w,h,0.0,'start','bottom');
        ctx.restore();
        // set exact solution function
        setExactSolution(solveFunc);
        graph.ctx.clearRect(10,0,width-10,14);
        ctx.save();
        graph.setFont('#0000FF','bold',10,'sans-serif');
        graph.placeText('#0000FF',case_text,wZero,2,0.0,'center','top');
        graph.setFont('#00FFFF','normal',10,'sans-serif');
        graph.placeText('#00FFFF',form_text,wZero,12,0.0,'center','top');
        ctx.restore();
        if ( exactSolution != null ) {
            // plot transient solution
            ctx.save();
            ctx.rect(graph.wmin,graph.hmin,graph.wlen,graph.hlen);
            ctx.clip();
            ctx.lineWidth   = 1;
            ctx.strokeStyle = '#00FFFF';
            ctx.beginPath();
            ctx.moveTo(graph.getWofX(t),graph.getHofY(that.x0));
            while ( t <= tMax ) {
                x = exactSolution(t);
                ctx.lineTo(graph.getWofX(t),graph.getHofY(x));
                t = t + tdel;
            };
            ctx.stroke();
            ctx.restore();
        };
    };
};

// This object will define the case properties and the exact
// solution function for the given mass-spring-damper system.
    
function sys_msd_SolveFunctions(sys_msd) {

    // Private properties set when object instantiated
    
    var that = this;            // this object
    var x0   = sys_msd.x0;      // initial mass displacement
    var v0   = sys_msd.v0;      // initial mass velocity
    var c    = sys_msd.c;       // damping coefficient
    var wn   = sys_msd.omegan;  // undamped natural frequency
    var z    = sys_msd.zeta;    // damping ratio
    var xSS  = sys_msd.xSS;     // steady-state solution to x,
                                 // (i.e., x when v=0 and a=0)
    
    // Public properties
    
    this.case_text = "";
    this.form_text = "";
    this.case_func = null;

    // The following damping case solution functions and associated
    // constant terms were derived from equations presented on pages
    // 97 through 100 in section 3-7 entitled "The Mass-Spring-Damper
    // System" of the text book "Principles of Dynamics", authored by
    // Donald T. Greenwood and published by Prentice-Hall, Inc. of 
    // Englewood Clifts, New Jersey in 1965.  Note that the sign of x
    // in this system is opposite to that presented in the referenced
    // text book; also need to use (xSS - x0) for x0 in the text book 
    // equations to derive those presented herein.
    
    // Private constants used in the damping case solution functions
    
    var cz;    // sqrt(1-z*z), if underdamped case 
               // sqrt(z*z-1), if overdamped case
    var czwn;  // wn*cz, the damped natural frequency if 0 < z < 1
    var c1;    // xSS - x0, if z < 1
    var c2;    // [v0 + z*wn*(xSS-x0)]/[wn*sqrt(1-z*z)], if z < 1
    
    // Private methods for each of the damping case solution functions

    function unDampedCase(t) {
        // equation (3-169) on page 98
        wnt = wn*t;
        x   = xSS - c1*Math.cos(wnt) + c2*Math.sin(wnt);
        return x;
    };
        
    function underDampedCase(t) {
        // equation (3-170) on page 99
        wnt   = wn*t;
        czwnt = czwn*t;
        ce    = Math.exp(-z*wnt);
        x     = xSS - ce*(c1*Math.cos(czwnt) - c2*Math.sin(czwnt));
        return x;
    };
        
    function criticallyDampedCase(t) {
        // equation (3-172) on page 99
        wnt = wn*t;
        ce  = Math.exp(-wnt);
        x   = xSS - ce*(c1 - c2*t);
        return x;
    };
    
    function overDampedCase(t) {
        // equation (3-177) on page 100
        wnt   = wn*t;
        czwnt = czwn*t;
        ce    = Math.exp(-z*wnt)/(2.0*cz);
        ce1   = Math.exp(czwnt);
        ce2   = Math.exp(-czwnt);
        x     = xSS - ce*(c1*ce1 + c2*ce2);
        return x;
    };
    
    // The privileged method used to select the appropriate solution 
    // function corresponding to the damping case determined by the
    // characteristics of the given mass-spring-damper system and to
    // set the constants associated with the selected solution function.
    
    this.setCaseFunc = function (sys_msd) {
        
        x0  = sys_msd.x0;
        v0  = sys_msd.v0;
        c   = sys_msd.c;
        wn  = sys_msd.omegan;
        z   = sys_msd.zeta;
        xSS = sys_msd.xSS;
        
        if ( c == 0.0 ) {
            that.case_text = "Undamped Case ( zeta = 0 )";
            that.case_func = function (t) {
                return unDampedCase(t);
            };
            that.form_text = "(CLOSED FORM SOLUTION)";
            // exact solution exists
            c1 = xSS - x0;
            c2 = v0/wn;
        } else if ( z < 1.0 ) {
            that.case_text = "Underdamped case ( 0 < zeta < 1 )";
            that.case_func = function (t) {
                return underDampedCase(t);
            };
            if ( x0 == xSS ) {
                that.form_text = "(FREE MOTION SOLUTION)";
                // exact solution only exists for free motion
                cz   = Math.sqrt(1.0 - z*z);
                czwn = cz*wn;
                c1   = xSS - x0;
                c2   = (v0 + z*wn*(xSS-x0))/czwn;
            } else {
                that.form_text = "(*NO CLOSED FORM SOLUTION*)";
                that.case_func = null;
            };
        } else if ( z > 1.0 ) {
            that.case_text = "Overdamped case ( zeta > 1 )";
            that.case_func = function (t) {
                return overDampedCase(t);
            };          
            if ( x0 == xSS ) {
                that.form_text = "(FREE MOTION SOLUTION)";
                // exact solution only exists for free motion
                cz   = Math.sqrt(z*z - 1.0);
                czwn = cz*wn;
                c1   = (cz - z)*(xSS - x0) - v0/wn;
                c2   = (cz + z)*(xSS - x0) + v0/wn;
            } else {
                that.form_text = "(*NO CLOSED FORM SOLUTION*)";
                that.case_func = null;
            };
        } else {
            that.case_text = "Critically damped case ( zeta = 1 )";
            that.case_func = function (t) {
                return criticallyDampedCase(t);
            };            
            if ( x0 == xSS ) {
                that.form_text = "(FREE MOTION SOLUTION)";
                // exact solution only exists for free motion
                c1 = xSS - x0;
                c2 = v0 + wn*(xSS-x0);
            } else {
                that.form_text = "(*NO CLOSED FORM SOLUTION*)";
                that.case_func = null;
            };
        };
    };
};

// Sample object prototype for public method
//
// system_mass_spring_damper.prototype.dotS = function (n,S) {
//    x  = S[1];
//    v  = S[2];
//    dS = new Array(n);
//    dS[0] = 1.0;
//    dS[1] = v;
//    dS[2] = this.g - (this.C1*v + this.C2*x);
//    return dS;
// };
