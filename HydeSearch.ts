class HydeSearch {
    debugOutput: boolean = false;

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
        this.debug("Initializing...");
        this.loadIndex().then(() => {
            if (this.debugOutput) {
                console.log(this.searchIndex);
            }
        });

        this.searchInput.addEventListener("input", () => {
            this.search();
        });

        this.createSearchResultsContainer();

        this.debug("Initialized.");
    }

    public withDebugOutput(): this {
        this.debugOutput = true;
        return this;
    }

    public debug(string: string) {
        if (this.debugOutput) {
            console.log('HS/Debug: '+ string);
        }
    }

    public async loadIndex(): Promise<void> {
        this.debug("Loading index...");

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
        this.debug("Index loaded.");
    }

    public search() {
        const startTime = window.performance.now();
        this.debug("Searching... Got input: " + this.searchInput.value);
        const searchTerm = this.searchInput.value;

        // Clear the list
        this.searchResultsList.innerHTML = "";

        // Check if the search term is empty
        if (searchTerm.length === 0) {
            return this.displayEnterSearchQuery();
        }

        // Find indexEntries where the search term is in the title or content
        const searchResults = this.searchIndex.filter((indexEntry) => {
            return indexEntry["title"].toLowerCase().includes(searchTerm.toLowerCase())
                || indexEntry["content"].toLowerCase().includes(searchTerm.toLowerCase());
        });

        return searchResults.length > 0
            ? this.displayResults(searchResults, startTime)
            : this.displayNoResults();
    }

    protected displayResults(searchResults: any[], startTime) {
        this.debug("Found "+ searchResults.length +" search results.");

        // Get the number of matches in all search results
        const searchTermCount = searchResults.reduce((acc, result) => {
            return acc + (result["content"].match(new RegExp(this.searchInput.value, "gi")) || []).length;
        }, 0);

        this.setSearchStatusMessage("Found " + searchTermCount + " result"+ (searchResults.length > 1 ? "s" : "")  + " in " + searchResults.length + " pages.");

        // Sort results by number of matches
        searchResults.sort((a, b) => {
            return (b["content"].match(new RegExp(this.searchInput.value, "gi")) || []).length
                - (a["content"].match(new RegExp(this.searchInput.value, "gi")) || []).length;
        });


        // Add each result to the list
        searchResults.forEach((result) => {
            const resultItem: ResultItem = new ResultItem(
                result["title"],
                result["content"],
                result["destination"],
                result["slug"],
                this.searchInput.value
            );

            this.searchResultsList.appendChild(resultItem.createResultItemTitle());
            this.searchResultsList.appendChild(resultItem.createResultItemContext());
        });

        const timeString = `${Math.round((((window.performance.now() - startTime) + Number.EPSILON)) * 100) / 100}ms`;
        this.debug(`Execution time:  ${timeString}`);

        const searchStatusMessage = this.searchResultsContainer.querySelector("p#search-status") as HTMLParagraphElement;
        searchStatusMessage.innerHTML = searchStatusMessage.innerText + ` <small>~${timeString}</small>`;
    }

    protected displayEnterSearchQuery() {
        this.setSearchStatusMessage("");
        // this.setSearchStatusMessage("Please enter a search query.");
    }

    protected displayNoResults() {
        this.debug("No results.");

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
}

class ResultItem {
    public title: string;
    public content: string;
    public destination: string;
    public slug: string;

    public searchTermCount: number;
    protected currentSearchTerm: string|null;

    constructor(title: string,
                content: string,
                destination: string,
                slug: string,
                currentSearchTerm: string | null = null) {
        this.title = title;
        this.content = content;
        this.destination = destination;
        this.slug = slug;
        this.currentSearchTerm = currentSearchTerm;
        this.searchTermCount = this.getSearchTermCount();
    }

    public getSearchTermCount(): number {
        return this.currentSearchTerm
            ? this.searchTermCount = (this.content.match(new RegExp(this.currentSearchTerm, "gi")) || []).length
            : 0;
    }

    public createResultItemTitle(): HTMLLIElement {
        const resultItem = document.createElement("dt") as HTMLLIElement;
        resultItem.classList.add("hyde-search-result");
        resultItem.id = "search-result-" + this.slug;

        const resultLink = document.createElement("a") as HTMLAnchorElement;
        resultLink.href = this.destination;
        resultLink.innerText = this.title;
        resultItem.appendChild(resultLink);

        // Add search term count to result item
        resultItem.setAttribute('data-matches', this.searchTermCount.toString());
        const searchTermCountSpan = document.createElement("span");
        searchTermCountSpan.classList.add("search-term-count");
        searchTermCountSpan.innerText = ", " + this.searchTermCount + " occurrence" + (this.searchTermCount > 1 ? "s" : "") + " found.";
        resultItem.appendChild(searchTermCountSpan);

        return resultItem;       
    }

    public createResultItemContext(): HTMLParagraphElement {

        const resultContext = document.createElement("dd") as HTMLParagraphElement;
        resultContext.classList.add("hyde-search-context");
        resultContext.setAttribute('data-for', "search-result-" + this.slug);

        // Experimental highlighting

        // Count the number of search term occurrences in the content

        // Get the position of the first occurrence of the search term
        const searchTermPosition = this.content.indexOf(this.currentSearchTerm);

        // Get the position of where the sentence containing the search term starts
        const sentenceStartPosition = this.content.lastIndexOf(".", searchTermPosition);
        const sentenceEndPosition = this.content.indexOf(".", searchTermPosition);

        // Get the sentence containing the search term
        const sentence = this.content.substring(sentenceStartPosition + 1, sentenceEndPosition + 1);

        // Sanitize the content string to remove HTML tags (Not indented to be secure as it assumes the JSON is trusted, but instead tries to remove embeds and images.)
        const sanitizedContentString = sentence.replace(/<[^>]*>/g, "").trim();

        // Highlight the search term
        resultContext.innerHTML = sanitizedContentString.replace(new RegExp(this.currentSearchTerm, "gi"), `<mark class="search-highlight">${this.currentSearchTerm}</mark>`);

        return resultContext;
    }
}