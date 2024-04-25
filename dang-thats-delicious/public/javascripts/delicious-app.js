import '../sass/style.scss';
import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

// $ is a function that is defined in bling.js
// It is a shortcut for document.querySelector()
autocomplete($('#address'), $('#lat'), $('#lng'));

// We pass the search input to the typeAhead() function
typeAhead($('.search'));

// We pass the map div to the makeMap() function
makeMap($('#map'));

// We select all the heart forms
// We use the $$ function that is defined in bling.js and is a shortcut for document.querySelectorAll()
const heartForms = $$('form.heart');
// const heartForms = document.querySelectorAll('form.heart');

// console.log(heartForms);

// We attach an event listener to each heart form using the forEach() method of the NodeList object
// added by the __proto__ = Array.prototype line in bling.js
heartForms.on('submit', ajaxHeart);
// heartForms.forEach(heartForm => {
//   heartForm.addEventListener('submit', ajaxHeart);
// });
