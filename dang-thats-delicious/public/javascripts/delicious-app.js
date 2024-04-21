import '../sass/style.scss';
import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';

// $ is a function that is defined in bling.js
// It is a shortcut for document.querySelector()
autocomplete($('#address'), $('#lat'), $('#lng'));

typeAhead($('.search'));