import axious from 'axios'; // Make requests to the server
import dompurify from 'dompurify'; // Sanitize HTML

// This function (helper) will return the HTML for the search results
function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `
  }).join('');
}

// This function will handle the typeAhead functionality
function typeAhead(search) {
  // If there is no search element, return
  if (!search) return;
  // The search element is a text input
  const searchInput = search.querySelector('input[name="search"]');
  // The search results will be displayed in the searchResults div
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function () {
    // console.log(this.value);
    // If there is no value in the search input, hide the search results
    if (!this.value) {
      searchResults.style.display = 'none';
      return; // stop
    }
    // Show the search results
    searchResults.style.display = 'block';


    // Make a request to the search endpoint
    axious
      .get(`/api/search?q=${this.value}`) // searchInput.value
      .then(res => {
        // console.log(res.data);
        if (res.data.length) { // If there are search results
          searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data)); // Santize the user input
          return;
        }
        // Tell the user that nothing was found
        searchResults.innerHTML = dompurify.sanitize(`<div className="search__result">No result for <strong>${this.value}</strong> found!</div>`)
      })
      .catch(err => {
        console.error(err);
      })
  })

  // Handle keyboard inputs
  searchInput.on('keyup', (e) => {
    // If they are not pressing up, down or enter, skip
    if (![38, 40, 13].includes(e.keyCode)) {
      return; // skip it
    }
    // Select the active class
    const activeClass = 'search__result--active';
    // Select the current active element
    const current = search.querySelector(`.${activeClass}`);
    // Select all the search results
    const items = search.querySelectorAll('.search__result');
    // Select the first search result
    let next;
    // If they press the down key
    if (e.keyCode === 40 && current) { // If the down key is pressed and there is a current active element
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) { // If the down key is pressed and there is no current active element
      next = items[0]; // Select the first search result
    } else if (e.keyCode === 38 && current) { // If the up key is pressed and there is a current active element
      next = current.previousElementSibling || items[items.length - 1]; // Select the previous search result
    } else if (e.keyCode === 38) { // If the up key is pressed and there is no current active element
      next = items[items.length - 1]; // Select the last search result
    } else if (e.keyCode === 13 && current.href) { // If the enter key is pressed and there is a current active element
      window.location = current.href; // Go to the href of the current active element
      return;
    }
    // Remove the active class from the current search result
    if (current) {
      current.classList.remove(activeClass);
    }
    // Add the active class to the next search result
    // Now we can use the active class to select the 'current' active element
    next.classList.add(activeClass);
  })
}

export default typeAhead;