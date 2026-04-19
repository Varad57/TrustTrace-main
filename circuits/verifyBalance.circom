pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";

template VerifyBalance() {
    signal input balance;
    signal input threshold;
    signal output isValid;

    // Use 64 bits for standard balance comparison logic
    component geq = GreaterEqThan(64);
    
    geq.in[0] <== balance;
    geq.in[1] <== threshold;
    
    // We ensure the output signal is strictly equal to the outcome
    isValid <== geq.out;
    
    // Explicitly enforce that isValid MUST safely be 1 for the proof to be valid at all!
    isValid === 1;
}

// balance is private, threshold is public
// The output isValid is inherently public
component main {public [threshold]} = VerifyBalance();
