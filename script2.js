// ====== HELPERS ======
function formatNumber(num){
  if(num >= 1000000) return (num/1000000).toFixed(1) + 'M';
  if(num >= 1000) return (num/1000).toFixed(1) + 'K';
  return num;
}

// ====== YOUR VIDEOS + YOUR THUMBNAILS ======
// Use numbers for views/likes/dislikes so we can do math
const VIDEOS = [
  {
    id: 1,
    title: "3 Forms of Proteins Explained",
    src: "Screen_Recording_20260626_193735.mp4",
    poster: "Screenshot_20260630-191456.jpg",
    views: 1200,
    likes: 320,
    dislikes: 12
  },
  {
    id: 2,
    title: "How Cheese Rind Forms with Yeast",
    src: "videos/cheese.mp4",
    poster: "thumbnails/cheese.jpg",
    views: 8400,
    likes: 2100,
    dislikes: 95
  },
  {
    id: 3,
    title: "Hors d'oeuvres: Food Science of Bites",
    src: "videos/horsdoeuvres.mp4",
    poster: "thumbnails/horsdoeuvres.jpg",
    views: 3100,
    likes: 890,
    dislikes: 40
  }
];

// ====== GLOBAL STATE ======
let currentVideo = VIDEOS[0]; // Track which video is playing
let userVote = null; // 'like', 'dislike', or null

// ====== DOM ELEMENTS ======
const sidebar = document.getElementById('sidebar');
const player = document.getElementById('mainVideo');
const title = document.getElementById('videoTitle');
const views = document.getElementById('views');
const side = document.getElementById('upNext');

const likeBtn = document.getElementById('likeBtn');
const dislikeBtn = document.getElementById('dislikeBtn');
const likeCount = document.getElementById('likeCount');
const dislikeCount = document.getElementById('dislikeCount');

const body = document.body;
const backBtn = document.getElementById('backBtn');
const fsBtn = document.getElementById('fsBtn');
const playerWrap = document.getElementById('playerWrap'); // The div we make fullscreen

// ====== Menu button ======
document.getElementById('menuBtn').onclick = () => {
  if(window.innerWidth < 1100){ sidebar.classList.toggle('open'); }
  else { sidebar.classList.toggle('collapsed'); }
};

// ====== Description expand ======
document.getElementById('desc').onclick = (e) => e.currentTarget.classList.toggle('collapsed');

// ====== LIKE + DISLIKE - NOW % SENSITIVE TO VIEWS ======
function updateLikeUI(){
  const totalLikes = currentVideo.likes + (userVote === 'like'? 1 : 0);
  const totalDislikes = currentVideo.dislikes + (userVote === 'dislike'? 1 : 0);

  // Option 1: Show raw numbers like 321 / 12
  likeCount.textContent = formatNumber(totalLikes);
  dislikeCount.textContent = formatNumber(totalDislikes);

  // Option 2: Show % instead - uncomment these 3 lines and comment Option 1
  // const totalVotes = totalLikes + totalDislikes;
  // const likePercent = totalVotes > 0? Math.round(totalLikes / totalVotes * 100) : 0;
  // likeCount.textContent = likePercent + '%';

  likeBtn.classList.toggle('active', userVote === 'like');
  dislikeBtn.classList.toggle('active', userVote === 'dislike');
}

likeBtn.onclick = () => {
  if(userVote === 'like'){ userVote = null; } // Click again = remove vote
  else { userVote = 'like'; }
  updateLikeUI();
};

dislikeBtn.onclick = () => {
  if(userVote === 'dislike'){ userVote = null; }
  else { userVote = 'dislike'; }
  updateLikeUI();
};

// ====== Subscribe ======
let subbed = false;
document.getElementById('subBtn').onclick = (e) => {
  subbed =!subbed;
  e.target.textContent = subbed? 'Subscribed' : 'Subscribe';
  e.target.classList.toggle('subscribed');
};

// ====== PLAY VIDEO + THEATER MODE ======
function playVideo(v){
  currentVideo = v; // Set the current video
  userVote = null; // Reset vote when video changes
  player.src = v.src;
  player.poster = v.poster;
  title.textContent = v.title;
  views.textContent = formatNumber(v.views) + ' views • Just now';
  updateLikeUI(); // Load the correct likes for this video
  window.scrollTo({top:0, behavior:'smooth'});
}

function enterTheater(v){
  playVideo(v);
  body.classList.add('theater');
  player.play().catch(()=>{}); // Autoplay
}
function exitTheater(){
  body.classList.remove('theater');
  if(document.fullscreenElement) document.exitFullscreen(); // Exit real fullscreen too
  player.pause();
}

backBtn.onclick = exitTheater;
document.addEventListener('keydown', e => { if(e.key === 'Escape' && body.classList.contains('theater')) exitTheater(); });

// NEW: Fullscreen API
fsBtn.onclick = async () => {
  if(!document.fullscreenElement){
    await playerWrap.requestFullscreen().catch(err => alert(`Error: ${err.message}`));
  } else {
    await document.exitFullscreen();
  }
};
// Change icon when you press F11 on keyboard too
document.addEventListener('fullscreenchange', () => {
  fsBtn.innerHTML = document.fullscreenElement
   ? `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>` // Exit icon
    : `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`; // Enter icon
});

// ====== Load "Up next" + SEARCH ======
function renderList(list){
  side.innerHTML = '';
  list.forEach(v => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img src="${v.poster}" alt=""><div><h4>${v.title}</h4><p>FaithHub • ${formatNumber(v.views)} views</p></div>`;
    card.onclick = () => enterTheater(v);
    side.appendChild(card);
  });
}
renderList(VIDEOS);

// ====== AUTOCOMPLETE SEARCH ======
const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
let activeIndex = -1;

searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase().trim();
  suggestions.innerHTML = ''; activeIndex = -1;
  if(q === ''){ suggestions.classList.remove('show'); renderList(VIDEOS); return; }
  const matches = VIDEOS.filter(v => v.title.toLowerCase().includes(q)).slice(0, 5);
  if(matches.length === 0){ suggestions.classList.remove('show'); renderList([]); return; }
  matches.forEach((v, i) => {
    const div = document.createElement('div');
    div.className = 'sug-item';
    div.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg> ${v.title}`;
    div.onclick = () => {
      searchInput.value = v.title; suggestions.classList.remove('show');
      enterTheater(v);
    };
    suggestions.appendChild(div);
  });
  suggestions.classList.add('show');
});
document.addEventListener('click', (e) => { if(!e.target.closest('.search-wrap')) suggestions.classList.remove('show'); });
document.getElementById('searchBtn').onclick = () => {
  const q = searchInput.value.toLowerCase().trim();
  const filtered = VIDEOS.filter(v => v.title.toLowerCase().includes(q));
  renderList(filtered); suggestions.classList.remove('show');
};
searchInput.addEventListener('keypress', e => {
  if(e.key === 'Enter'){ e.preventDefault(); document.getElementById('searchBtn').click(); }
  const items = suggestions.querySelectorAll('.sug-item');
  if(e.key === 'ArrowDown'){ e.preventDefault(); activeIndex = Math.min(activeIndex+1, items.length-1); items.forEach((el,i)=>el.classList.toggle('active', i===activeIndex)); }
  if(e.key === 'ArrowUp'){ e.preventDefault(); activeIndex = Math.max(activeIndex-1, -1); items.forEach((el,i)=>el.classList.toggle('active', i===activeIndex)); }
});

// ====== INIT ======
updateLikeUI(); // Set initial 320 / 12 on load
