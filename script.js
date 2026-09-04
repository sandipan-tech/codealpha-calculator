const display = document.querySelector('#display');
const expression = document.querySelector('#expression');
const keys = document.querySelector('.keypad');

let current = '0';
let previous = null;
let operator = null;
let waitingForOperand = false;
let expressionText = '';

function render() {
  display.textContent = current;
  expression.textContent = expressionText || 'Ready for input';
}

function inputDigit(digit) {
  if (waitingForOperand || current === 'Error') {
    current = digit;
    waitingForOperand = false;
  } else {
    current = current === '0' ? digit : current + digit;
  }
  expressionText = previous !== null && operator ? `${previous} ${operator}` : '';
  render();
}

function inputDecimal() {
  if (waitingForOperand || current === 'Error') {
    current = '0.';
    waitingForOperand = false;
  } else if (!current.includes('.')) {
    current += '.';
  }
  render();
}

function calculate(left, right, action) {
  const first = Number(left);
  const second = Number(right);
  if (action === '+') return first + second;
  if (action === '-') return first - second;
  if (action === '*') return first * second;
  if (action === '/') return second === 0 ? null : first / second;
  return second / 100;
}

function formatResult(value) {
  if (!Number.isFinite(value)) return 'Error';
  return String(Number(value.toPrecision(12)));
}

function chooseOperator(nextOperator) {
  if (current === 'Error') clearAll();
  const inputValue = Number(current);

  if (operator && waitingForOperand) {
    operator = nextOperator;
    expressionText = `${previous} ${operator}`;
    render();
    return;
  }

  if (previous === null) {
    previous = inputValue;
  } else if (operator) {
    const result = calculate(previous, inputValue, operator);
    current = result === null ? 'Error' : formatResult(result);
    previous = result;
  }

  operator = nextOperator;
  waitingForOperand = true;
  expressionText = `${current} ${operator}`;
  render();
}

function solve() {
  if (!operator || previous === null || current === 'Error') return;
  const left = previous;
  const right = Number(current);
  const result = calculate(left, right, operator);
  expressionText = `${left} ${operator} ${right} =`;
  current = result === null ? 'Error' : formatResult(result);
  previous = null;
  operator = null;
  waitingForOperand = true;
  render();
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  waitingForOperand = false;
  expressionText = '';
  render();
}

function deleteLast() {
  if (waitingForOperand || current === 'Error') return;
  current = current.length > 1 ? current.slice(0, -1) : '0';
  render();
}

keys.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const { value, action } = button.dataset;

  if (action === 'clear') clearAll();
  else if (action === 'delete') deleteLast();
  else if (action === 'calculate') solve();
  else if (value === '.') inputDecimal();
  else if (/^[0-9]$/.test(value)) inputDigit(value);
  else chooseOperator(value);
});

document.addEventListener('keydown', (event) => {
  const key = event.key;
  if (/^[0-9]$/.test(key)) inputDigit(key);
  else if (key === '.') inputDecimal();
  else if (['+', '-', '*', '/', '%'].includes(key)) chooseOperator(key);
  else if (key === 'Enter' || key === '=') solve();
  else if (key === 'Escape') clearAll();
  else if (key === 'Backspace') deleteLast();
});

render();
