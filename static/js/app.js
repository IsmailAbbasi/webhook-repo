let lastUpdateTime = 0;

function fetchEvents() {
    console.log('Fetching events...');
    fetch('/api/events')
        .then(response => {
            console.log('Response received:', response.status);
            return response.json();
        })
        .then(events => {
            console.log('Events received:', events);
            const container = document.getElementById('events-container');
            
            if (events && events.length > 0) {
                updateEventsDisplay(events);
                lastUpdateTime = Date.now();
            } else {
                container.innerHTML = '<div class="no-events">No events yet</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            document.getElementById('events-container').innerHTML = 
                '<div class="error">Error loading events</div>';
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

// Poll every 15 seconds
setInterval(fetchEvents, 15000);

// Initial load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, fetching initial events...');
    fetchEvents();
});