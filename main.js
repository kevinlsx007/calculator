const acBtn = document.querySelector('button[name="allclear"]');
const delBtn = document.querySelector('button[name="delete"]');
const opBtns = Array.from(document.querySelectorAll('.operator'));
const digBtns = Array.from(document.querySelectorAll('.digit'));
const zeroBtn = document.querySelector('.zero');
const decimalBtn = document.querySelector('.decimal');
const equalBtn = document.querySelector('.equal');
const userInput = document.querySelector('output[name="input"]');
const calcResult = document.querySelector('output[name="result"]');

const operators = ['+', '-', '*', '/'];
let operand = ''; // for storing current operand
let equation = ''; // for storing current equation
let isEqualPressed = false;

// AC button click function
acBtn.addEventListener('click', () => {
  operand = '';
  equation = '';
  isEqualPressed = false;
  userInput.textContent = '0';
  calcResult.textContent = '';
});

// DEL button click function
delBtn.addEventListener('click', () => {
  // Disable DEL button if '=' is pressed and an equation is done evaluation
  if (isEqualPressed) return;
  // Chop operand if currently stored as non-empty
  if (operand) {
    operand = operand.slice(0,-1);
  }
  // Chop equation if currently stored as non-empty and update user input area
  if (equation) {
    equation = equation.slice(0,-1);
    userInput.textContent = equation;
  }
});

opBtns.forEach(btn => btn.addEventListener('click', (e) => {
  if (isEqualPressed) return;
  // Invalid input if empty equation or last position of equation is already +, -, *, /
  if (!(equation) || operators.includes(equation.slice(-1))) return;
  const operator = e.target.value;
  operand = '';
  equation = equation.concat(operator);
  userInput.textContent = equation;
}));

digBtns.forEach(btn => btn.addEventListener('click', (e) => {
  if (isEqualPressed) return;
  const digit = e.target.value;
  if (operand === '0') {
    operand = digit;
    equation = equation.slice(0,-1).concat(digit);
  } else {
    operand = operand.concat(digit);
    equation = equation.concat(digit);
  }
  userInput.textContent = equation;
}));

zeroBtn.addEventListener('click', () => {
  if (isEqualPressed) return;
  if (operand === '0') return; // no more than 1 leading 0
  operand = operand.concat('0');
  equation = equation.concat('0');
  userInput.textContent = equation;
});

decimalBtn.addEventListener('click', () => {
  if (isEqualPressed) return;
  if (operand.includes('.')) return; // no more than 1 decimal point
  if (operand === '') {
    operand = '0.';
    equation = equation.concat(operand);
  } else {
    operand = operand.concat('.');
    equation = equation.concat('.');
  }
  userInput.textContent = equation;
});

equalBtn.addEventListener('click', () => {
  if (!equation) return
  isEqualPressed = true;
  let result = calculate(equation);
  const precise = x => Number.parseFloat(x).toPrecision(6);
  if (String(result).length > 10 || result < 0.000001) {
    result = precise(result);
  } else {
    result = Math.round((result + Number.EPSILON) * 1000000) / 1000000
  }
  calcResult.textContent = result;
});

// Main function to calculate an equation string
function calculate(equation) {
  /*
  @input: an equation with non-negative number, +, -, *, / operators
  @output: calculation result rounded to 8 decimal points
  */
  //console.log(`Equation to be evaluated: ${equation}`);
  let stack = [];
  let operand = 0; // tracking current operand
  let isDecimal = false; // tracking if it's in decimal positions
  let decimal = 10; // for decimal division
  let sign = '+';

  for (i = 0; i < equation.length; i++) {
    // current position is digit or .
    if (!operators.includes(equation[i])) {
      if (equation[i] === '.') {
        isDecimal = true;
        continue
      }
      if (!isDecimal) {
        operand = operand * 10 + equation.charCodeAt(i) - '0'.charCodeAt();
      } else {
        operand += (equation.charCodeAt(i) - '0'.charCodeAt()) / decimal;
        decimal *= 10;
      }
    }
    if (operators.includes(equation[i]) || i === equation.length - 1) {
      if (sign === '+') {
        stack.push(operand);
      } else if (sign === '-') {
        stack.push(-operand);
      } else if (sign === '*') {
        stack.push(stack.pop() * operand);
      } else {
        stack.push(stack.pop() / operand);
      }
      // change sign to current sign
      sign = equation[i];
      // reset operand, isDecimal, and decimal
      operand = 0;
      isDecimal = false;
      decimal = 10;
    }
    //console.log(`Current stack is ${stack}`);
  }
  // compute stack sum
  const stackSum = stack => stack.reduce((a, b) => a + b, 0);
  return stackSum(stack);
}

// Add keyboard support
document.addEventListener('keydown', (event) => {
  const keyMap = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '/': 'divide',
    'c': 'allclear',
    'Backspace': 'delete',
    '.': 'decimal',
    '=': 'equal'
  };
  if (event.key in keyMap) {
    document.getElementsByName(keyMap[event.key])[0].click();
  }
  if (event.keyCode >= 48 && event.keyCode <= 57) {
    document.getElementsByName(`digit${event.key}`)[0].click();
  }
});
