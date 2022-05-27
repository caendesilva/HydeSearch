var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class HydeSearch {
    constructor(searchIndexLocation) {
        this.searchInput = document.getElementById("search-input");
        this.hydeSearchContainer = document.getElementById('hyde-search');
        this.searchIndexLocation = searchIndexLocation;
    }
    init() {
        console.log("HS/Debug: Initializing...");
        this.loadIndex().then(() => {
            console.log(this.searchIndex);
        });
        this.searchInput.addEventListener("input", () => {
            this.search();
        });
        this.createSearchResultsContainer();
        console.log("HS/Debug: Initialized.");
    }
    loadIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("HS/Debug: Loading index...");
            const response = yield fetch(this.searchIndexLocation, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (!response.ok) {
                throw new Error(`Could not load search index from ${this.searchIndexLocation}`);
            }
            this.searchIndex = yield response.json();
            console.log("HS/Debug: Index loaded.");
        });
    }
    search() {
        console.log("HS/Debug: Searching... Got input: " + this.searchInput.value);
        const searchTerm = this.searchInput.value;
        // Clear the list
        this.searchResultsList.innerHTML = "";
        // Find indexEntries where the search term is in the title or content
        const searchResults = this.searchIndex.filter((indexEntry) => {
            return indexEntry["title"].toLowerCase().includes(searchTerm.toLowerCase())
                || indexEntry["content"].toLowerCase().includes(searchTerm.toLowerCase());
        });
        return searchResults.length > 0
            ? this.displayResults(searchResults)
            : this.displayNoResults();
    }
    displayResults(searchResults) {
        console.log("HS/Debug: Found " + searchResults.length + " search results.");
        this.setSearchStatusMessage("Found " + searchResults.length + " result" + (searchResults.length > 1 ? "s" : "") + ".");
        // Add each result to the list
        searchResults.forEach((result) => {
            const resultItem = this.createResultItem(result);
            this.searchResultsList.appendChild(resultItem);
        });
    }
    displayNoResults() {
        console.log("HS/Debug: No results.");
        this.setSearchStatusMessage("No results found.");
    }
    createSearchResultsContainer() {
        this.searchResultsContainer = document.createElement("div");
        this.searchResultsContainer.id = "search-results";
        this.searchResultsContainer.classList.add("hyde-search-results");
        this.hydeSearchContainer.appendChild(this.searchResultsContainer);
        this.searchResultsList = document.createElement("dl");
        this.searchResultsList.id = "search-results-list";
        this.searchResultsContainer.appendChild(this.searchResultsList);
    }
    setSearchStatusMessage(message) {
        if (!this.searchResultsContainer.querySelector("p#search-status")) {
            const searchStatusMessage = document.createElement("p");
            searchStatusMessage.id = "search-status";
            this.searchResultsContainer.prepend(searchStatusMessage);
        }
        const searchStatusMessage = this.searchResultsContainer.querySelector("p#search-status");
        searchStatusMessage.innerText = message;
    }
    createResultItem(result) {
        const resultItem = document.createElement("dt");
        resultItem.classList.add("hyde-search-result");
        const resultLink = document.createElement("a");
        resultLink.href = result["slug"] + ".html"; // Todo get link/preference from Hyde JSON
        resultLink.innerText = result["title"];
        resultItem.appendChild(resultLink);
        // Add search term count to result item
        const searchTermCount = (result["content"].match(new RegExp(this.searchInput.value, "gi")) || []).length;
        const searchTermCountSpan = document.createElement("span");
        searchTermCountSpan.classList.add("search-term-count");
        searchTermCountSpan.innerText = ", " + searchTermCount + " occurrence" + (searchTermCount > 1 ? "s" : "") + " found.";
        resultItem.appendChild(searchTermCountSpan);
        const resultContent = document.createElement("dd");
        // Experimental highlighting
        // Count the number of search term occurrences in the content
        // Get the position of the first occurrence of the search term
        const searchTermPosition = result["content"].indexOf(this.searchInput.value);
        const contentString = "..." + result["content"].substring(searchTermPosition - 24, searchTermPosition + 32) + "...";
        // Sanitize the content string to remove HTML tags
        const sanitizedContentString = contentString.replace(/<[^>]*>/g, "");
        // Highlight the search term
        resultContent.innerHTML = sanitizedContentString.replace(new RegExp(this.searchInput.value, "gi"), `<mark class="search-highlight">${this.searchInput.value}</mark>`);
        resultItem.appendChild(resultContent);
        return resultItem;
    }
}
