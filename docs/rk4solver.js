// DESC:  Runge-Kutta 4th order solver
// FILE:  rk4solver.js
// DATE:  03 JUL 2012
// AUTH:  Gary E. Deschaines
// LINK:  http://home.hiwaay.net/~gedesch/GED/gedwsapp/data/scripts/{FILE}

function rk4solver(h,n) {

    // Applies the Runge-Kutta 4th order (RK4) integration method
    // to solve a system of first order differential equations of
    // the form dS[i] = dotS(i,S[i]), such that each element of
    // the state vector S are calculated as the weighted sum of 
    // four approximations of dS[i] and S[i] = S0[i] + dS[i]*h for
    // each i from 0 to n-1.  The S[0] element of the state vector
    // holds incremented time and the associated state derivative
    // dS[0] value must be specified as 1.
    
    // Public properties
    
    this.S = new Array(n);  // State vector buffer
    
    // Private properties
    
    var that = this;
    var n    = n;   
    var h    = h;
    var hh   = 0.5*h;
    var h6   = h/6.0;
    
    // Private method
    
    function substep(h,n,S0,dS) {
        // Returns vector S which holds the solution to
        // the equation S[i] = S0[i] + dS[i]*h for i from
        // 0 to n-1, where:
        //   h  = integration step size
        //   n  = number of elements in state vector
        //   S0 = state vector at t0 (i.e., [t0,x0,v0])
        //   dS = first derivatives of state vector (i.e.,
        //        [1,dx/dt,dv/dt]).
        var S = new Array(n);
        for (var i = 0; i < n; i++) {
            S[i] = S0[i] + dS[i]*h;
        };
        return S;
    };
    
    // Privileged method
    
    function rk4solver_step(S0,dotS) {
    // Returns vector S which holds the RK4 solution to the 
    // equation S = S0 + dotS*h, where:
    //   S0   = state vector at t0 (i.e., [t0,x0,v0])
    //   dotS = function of the form dotS(n,S0) containing 
    //          system of 1st order differential equations
    //          to integrate over the time step h.
        K1 = dotS(n,S0);
        K2 = dotS(n,substep(hh,n,S0,K1));
        K3 = dotS(n,substep(hh,n,S0,K2));
        K4 = dotS(n,substep(h,n,S0,K3));
        for (var i = 0; i < n; i++) {
            that.S[i] = S0[i] + (K1[i] + 2.0*(K2[i] + K3[i]) + K4[i])*h6;
        };
        return that.S;
    };
    
    function rk4solver_init(h,n) {
        // Initializes the state vector and integration time 
        // incremental time constants.
        that.S = new Array(n);
        n      = n
        h      = h;
        hh     = 0.5*h;
        h6     = h/6.0;
        return;
    };
    
    // Public methods

    this.init = function(h,n) {
        return rk4solver_init(h,n);
    }
    this.step = function(S0,dotS) {
        return rk4solver_step(S0,dotS);
    };
};
