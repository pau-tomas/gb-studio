const gbvmGrammar = {
  comment: {
    pattern: /;.*/,
    greedy: true,
  },
  number: {
    pattern:
      /(^|[^\w$])(?:NaN|Infinity|0[bB][01]+(?:_[01]+)*n?|0[oO][0-7]+(?:_[0-7]+)*n?|0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?|\d+(?:_\d+)*n|(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?)(?![\w$])/,
    lookbehind: true,
  },
  instruction: {
    pattern: /VM_[^\s]*/,
  },
  asset: {
    pattern: /___bank_([^\s]*)\s*,\s*_\1/,
  },
  variable: {
    pattern: /VAR_([^\s]*)|\.ARG([0-9])|\.LOCAL_(.*)/,
  },
};

export default gbvmGrammar;
