let watchlist = [];
const apiKey = "a5b1d883";
let currentMovies = [];

// Initialize watchlist from localStorage if available
document.addEventListener('DOMContentLoaded', () => {
    const savedWatchlist = localStorage.getItem('movieWatchlist');
    if (savedWatchlist) {
        watchlist = JSON.parse(savedWatchlist);
        updateWatchlistUI();
    }
});

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}

function searchMovies() {
    const searchBox = document.getElementById("searchInput");
    const keyword = searchBox.value.trim();

    if (!keyword) return;

    const loading = document.getElementById("loadingMsg");
    const error = document.getElementById("errorMsg");
    const results = document.getElementById("resultsDiv");

    loading.style.display = "block";
    error.style.display = "none";
    results.innerHTML = "";
    currentMovies = [];

    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${keyword}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            loading.style.display = "none";

            if (data.Response === "True") {
                currentMovies = data.Search;
                applyFeatures();
            } else {
                error.innerText = data.Error || "No movies found";
                error.style.display = "block";
            }
        })
        .catch(err => {
            loading.style.display = "none";
            console.error("Error finding movies:", err);
            error.innerText = "Something went wrong. Please try again.";
            error.style.display = "block";
        });
}

function applyFeatures() {
    const sortVal = document.getElementById("sortOption").value;
    const filterVal = document.getElementById("filterOption").value;
    
    let processedMovies = [...currentMovies];

    // Filtering
    if (filterVal === "hasPoster") {
        processedMovies = processedMovies.filter(movie => movie.Poster !== "N/A");
    }
    
    // Sorting
    processedMovies.sort((a, b) => {
        if (sortVal === "yearDesc") {
            return parseInt(b.Year) - parseInt(a.Year);
        } else if (sortVal === "alphaAsc") {
            return a.Title.localeCompare(b.Title);
        }
        return 0;
    });
    
    renderMovies(processedMovies);
}

function renderMovies(moviesArray) {
    const results = document.getElementById("resultsDiv");
    results.innerHTML = "";

    moviesArray.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";

        const posterUrl = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Poster";

        card.innerHTML = `
            <div class="poster-container">
                <img src="${posterUrl}" alt="${movie.Title}">
            </div>
            <div class="movie-info">
                <h3>${movie.Title} (${movie.Year})</h3>
                <button class="add-btn" onclick="addToWatchlist('${movie.Title.replace(/'/g, "\\'")}')">
                    Add to Watchlist
                </button>
            </div>
        `;

        results.appendChild(card);
    });
}

function addToWatchlist(movieTitle) {
    if (!watchlist.includes(movieTitle)) {
        watchlist.push(movieTitle);
        localStorage.setItem('movieWatchlist', JSON.stringify(watchlist));
        updateWatchlistUI();
        // Feedback animation could go here
    } else {
        alert("This movie is already in your watchlist!");
    }
}

function updateWatchlistUI() {
    const watchDiv = document.getElementById("watchlistDiv");
    watchDiv.innerHTML = "";

    if (watchlist.length === 0) {
        watchDiv.innerHTML = "<p style='color: var(--text-secondary);'>No movies in watchlist yet.</p>";
    } else {
        const list = document.createElement("ul");
        watchlist.forEach(movieName => {
            const item = document.createElement("li");
            item.className = "watchlist-item";
            item.innerHTML = movieName;
            list.appendChild(item);
        });
        watchDiv.appendChild(list);
    }
}

// Allow Enter key to search
document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchMovies();
});
