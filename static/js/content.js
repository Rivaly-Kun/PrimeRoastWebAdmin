const contentTitle = document.getElementById('content-title');
const dashboardLink = document.getElementById('dashboard-link');
const analyticsLink = document.getElementById('search-link');
const membersLink = document.getElementById('orders-link');
const scannerlink = document.getElementById('favorites-link');
const profilelink = document.getElementById('history-link');


const Bread = document.getElementById('BreadcrumName');

function showContent(contentId, title) {
    contentTitle.textContent = title;
       
    document.getElementById('dashboard-content').style.display = 'none';
    document.getElementById('search-content').style.display = 'none';
    document.getElementById('orders-content').style.display = 'none';
    document.getElementById('favorites-content').style.display = 'none';
    document.getElementById('history-content').style.display = 'none';

    document.getElementById(contentId).style.display = 'block';
}

dashboardLink.addEventListener('click', () => {
    showContent('dashboard-content', 'Home');
    Bread.textContent = 'Home'; 
});

analyticsLink.addEventListener('click', () => {
    showContent('search-content', 'Announcements');
    Bread.textContent = 'Search'; 
});

membersLink.addEventListener('click', () => {
    showContent('orders-content', 'Orders');
    Bread.textContent = 'Orders	';

});
scannerlink.addEventListener('click', () => {
    showContent('favorites-content', 'Favorites');
    Bread.textContent = 'Favorites	';

});
profilelink.addEventListener('click', () => {
    showContent('history-content', 'History');
    Bread.textContent = 'History';
   
});