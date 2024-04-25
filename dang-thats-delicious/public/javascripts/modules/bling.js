// based on https://gist.github.com/paulirish/12fb951a8b893a454b32

// This is a small library that allows us to use jQuery-like syntax in our front-end JavaScript
// It is a small wrapper around the native DOM API

// We can use it to select elements from the DOM like this:
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// We add addEventListener to the Node prototype:
Node.prototype.on = window.on = function (name, fn) {
  this.addEventListener(name, fn);
};

// NodeList object inherits the Array methods:
NodeList.prototype.__proto__ = Array.prototype; // eslint-disable-line

// Now we can use Array.forEach to add event listeners to all elements of a NodeList:
NodeList.prototype.on = NodeList.prototype.addEventListener = function (name, fn) {
  this.forEach((elem) => {
    elem.on(name, fn);
  });
};

export { $, $$ };
