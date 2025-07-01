console.log("✅ JavaScript loaded!");

let lastUpdateTime = 0;

function fetchEvents() {
    console.log('Fetching events...');

    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const container = document.getElementById('events-container');

    loadingDiv.style.display = 'block';
    errorDiv && (errorDiv.style.display = 'none'); // if exists

    fetch('/api/events')
        .then(response => {
            console.log('Response received:', response.status);
            return response.json();
        })
        .then(events => {
            console.log('Events received:', events);
            loadingDiv.style.display = 'none';

            if (events && events.length > 0) {
                updateEventsDisplay(events);
                lastUpdateTime = Date.now();
            } else {
                container.innerHTML = '<div class="no-events">No events yet</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            loadingDiv.style.display = 'none';
            if (errorDiv) {
                errorDiv.style.display = 'block';
                errorDiv.textContent = 'Error loading events!';
            } else {
                container.innerHTML = '<div class="error">Error loading events</div>';
            }
        });
}

function updateEventsDisplay(events) {
    const container = document.getElementById('events-container');
    container.innerHTML = '';

    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-item';
        eventDiv.innerHTML = formatEventMessage(event);
        container.appendChild(eventDiv);
    });
}

function formatEventMessage(event) {
    const { event_type, author, from_branch, to_branch, timestamp } = event;

    switch (event_type) {
        case 'push':
            return `<strong>${author}</strong> pushed to <code>${to_branch}</code> on ${timestamp}`;
        case 'pull_request':
            return `<strong>${author}</strong> submitted a pull request from <code>${from_branch}</code> to <code>${to_branch}</code> on ${timestamp}`;
        case 'merge':
            return `<strong>${author}</strong> merged branch <code>${from_branch}</code> to <code>${to_branch}</code> on ${timestamp}`;
        default:
            return `<strong>${author}</strong> - ${event_type} on ${timestamp}`;
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, fetching initial events...');
    fetchEvents();
});

// Poll every 15 seconds
setInterval(fetchEvents, 15000);
