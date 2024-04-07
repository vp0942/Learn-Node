import '../sass/style.scss';
import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';

// $ is a function that is defined in bling.js
// It is a shortcut for document.querySelector()
autocomplete($('#address'), $('#lat'), $('#lng'));