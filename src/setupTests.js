import '@testing-library/jest-dom';

const { webcrypto } = require('crypto');
const { TextEncoder, TextDecoder } = require('util');

Object.defineProperty(window, 'crypto', { value: webcrypto });
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

window.scrollTo = () => {};
