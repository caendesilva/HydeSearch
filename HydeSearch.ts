class HydeSearch {
    searchIndexLocation: string;
    searchIndex: Array<any>;

    searchInput = document.getElementById("search-input") as HTMLInputElement;
    hydeSearchContainer = document.getElementById('hyde-search') as HTMLDivElement;

    protected searchResultsList: HTMLDListElement;
    protected searchResultsContainer: HTMLDivElement;

    constructor(searchIndexLocation: string) {
        this.searchIndexLocation = searchIndexLocation;
    }

    public init(): void {
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

    public async loadIndex(): Promise<void> {
        console.log("HS/Debug: Loading index...");

        const response = await fetch(this.searchIndexLocation, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            throw new Error(`Could not load search index from ${this.searchIndexLocation}`);
        }

        this.searchIndex = await response.json();
        console.log("HS/Debug: Index loaded.");
    }

    public search() {
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

    protected displayResults(searchResults: any[]) {
        console.log("HS/Debug: Found "+ searchResults.length +" search results.");

        this.setSearchStatusMessage("Found " + searchResults.length + " results.");
        
        // Add each result to the list
        searchResults.forEach((result) => {
            const resultItem = this.createResultItem(result);
            this.searchResultsList.appendChild(resultItem);
        });
    }

    protected displayNoResults() {
        console.log("HS/Debug: No results.");

        this.setSearchStatusMessage("No results found.");
    }

    protected createSearchResultsContainer() {
        this.searchResultsContainer = document.createElement("div");
        this.searchResultsContainer.id = "search-results";
        this.searchResultsContainer.classList.add("hyde-search-results");
        this.hydeSearchContainer.appendChild(this.searchResultsContainer);

        this.searchResultsList = document.createElement("dl");
        this.searchResultsList.id = "search-results-list";
        this.searchResultsContainer.appendChild(this.searchResultsList);
    }

    protected setSearchStatusMessage(message: string) {
        if (!this.searchResultsContainer.querySelector("p#search-status")) {
            const searchStatusMessage = document.createElement("p");
            searchStatusMessage.id = "search-status";
            this.searchResultsContainer.prepend(searchStatusMessage);
        }

        const searchStatusMessage = this.searchResultsContainer.querySelector("p#search-status") as HTMLParagraphElement;
        searchStatusMessage.innerText = message;
    }

    protected createResultItem(result: object): HTMLLIElement {
        const resultItem = document.createElement("dt") as HTMLLIElement;
        resultItem.classList.add("hyde-search-result");

        const resultLink = document.createElement("a") as HTMLAnchorElement;
        resultLink.href = result["slug"] + ".html"; // Todo get link/preference from Hyde JSON
        resultLink.innerText = result["title"];
        resultItem.appendChild(resultLink);

        const resultContent = document.createElement("dd") as HTMLParagraphElement;

        // Experimental highlighting

        // Count the number of search term occurrences in the content
        const searchTermCount = (result["content"].match(new RegExp(this.searchInput.value, "gi")) || []).length;

        // Get the position of the first occurrence of the search term
        const searchTermPosition = result["content"].indexOf(this.searchInput.value);
        const contentString = result["content"].substring(searchTermPosition - 20, searchTermPosition + this.searchInput.value.length + 24);

        // Highlight the search term
        const contentStringWithHighlight = contentString.replace(new RegExp(this.searchInput.value, "gi"), `<mark class="search-highlight">${this.searchInput.value}</mark>`);

        resultContent.innerHTML = "Found " + searchTermCount + " occurrences." + contentStringWithHighlight;
        resultItem.appendChild(resultContent);


        return resultItem;
    }
}