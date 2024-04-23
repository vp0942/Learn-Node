import '../sass/style.scss';
import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';

// $ is a function that is defined in bling.js
// It is a shortcut for document.querySelector()
autocomplete($('#address'), $('#lat'), $('#lng'));

// We pass the search input to the typeAhead() function
typeAhead($('.search'));

// We pass the map div to the makeMap() function
makeMap($('#map'));