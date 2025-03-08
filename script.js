console.log("Let's start JavaScript");

let currentSong = new Audio();
let songs = [];
let currFolder = "";
let isMuted = false;
const volumeIcon = document.querySelector(".volume img");
const volumeRange = document.querySelector(".range input");
const seekBar = document.querySelector(".seekbar");
const seekCircle = document.querySelector(".circle");
const songTime = document.querySelector(".songtime");
const play = document.getElementById("play");
const prev = document.getElementById("previous");
const next = document.getElementById("next");

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function extractFolderName(url) {
  return url
    .split("/")
    .filter((part) => part && part !== "songs")
    .pop();
}
// Made You Sudhanshu

async function getSongs(folder) {
  try {
    currFolder = folder;
    let response = await fetch(`/songs/${folder}/`);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let anchors = div.getElementsByTagName("a");

    songs = [];
    for (let anchor of anchors) {
      let songName = anchor.href.split("/").pop();
      if (songName.endsWith(".mp3")) {
        songs.push(decodeURIComponent(songName));
      }
    }
    // Made By Sudhanshu
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (let song of songs) {
      songUL.innerHTML += `
        <li>
          <img class="invert" src="img/music.svg" alt="">
          <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Song Artist</div>
          </div>
          <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/play.svg" alt="">
          </div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".songList li")).forEach((li) => {
      li.addEventListener("click", () => {
        playMusic(li.querySelector(".info div").textContent.trim());
      });
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}
// Made By Sudhanshu
const playMusic = (track, pause = false) => {
  currentSong.src = `/songs/${currFolder}/` + track;
  
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }

  document.querySelector(".songinfo").textContent = decodeURI(track);
  songTime.textContent = "00:00 / 00:00";

  // Store the last played song in localStorage
  localStorage.setItem("lastSong", JSON.stringify({
    track,
    folder: currFolder,
    time: currentSong.currentTime,
  }));

  currentSong.addEventListener("timeupdate", updateSeekBar);
  currentSong.addEventListener("ended", playNextSong);
};
 document.querySelector(".hamburger").addEventListener("click",()=>{
  document.querySelector(".left").style.left="0"
})
 document.querySelector(".close").addEventListener("click",()=>{
  document.querySelector(".left").style.left="-100%"
})

// Made By Sudhanshu
function playNextSong() {
  let index = songs.indexOf(decodeURI(currentSong.src.split("/").pop()));
  if (index < songs.length - 1) {
    playMusic(songs[index + 1]);
  } else {
    playMusic(songs[0]);
  }
}

function playPreviousSong() {
  let index = songs.indexOf(decodeURI(currentSong.src.split("/").pop()));
  if (index > 0) {
    playMusic(songs[index - 1]);
  } else {
    playMusic(songs[songs.length - 1]);
  }
}
// Made By Sudhanshu
function updateSeekBar() {
  let progress = (currentSong.currentTime / currentSong.duration) * 100;
  seekCircle.style.left = `${progress}%`;
  songTime.textContent = `${formatTime(currentSong.currentTime)} / ${formatTime(
    currentSong.duration
  )}`;
}

seekBar.addEventListener("click", (e) => {
  let percent = (e.offsetX / seekBar.offsetWidth) * currentSong.duration;
  currentSong.currentTime = percent;
});

play.addEventListener("click", () => {
  if (currentSong.paused) {
    currentSong.play();
    play.src = "pause.svg";
  } else {
    currentSong.pause();
    play.src = "play.svg";
  }
});

prev.addEventListener("click", playPreviousSong);
next.addEventListener("click", playNextSong);

volumeRange.addEventListener("input", () => {
  currentSong.volume = volumeRange.value / 100;
  if (currentSong.volume === 0) {
    isMuted = true;
    volumeIcon.src = "img/mute.svg";
  } else {
    isMuted = false;
    volumeIcon.src = "img/volume.svg";
  }
});
// Made By Sudhanshu
volumeIcon.addEventListener("click", () => {
  if (isMuted) {
    currentSong.volume = volumeRange.value / 100;
    volumeIcon.src = "img/volume.svg";
  } else {
    currentSong.volume = 0;
    volumeIcon.src = "img/mute.svg";
  }
  isMuted = !isMuted;
});
// Made By Sudhanshu
async function displayAlbums() {
  try {
    let response = await fetch("/songs/");
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (let anchor of anchors) {
      let folder = extractFolderName(anchor.href);
      if (!folder || folder.includes(".")) continue;

      try {
        let infoResponse = await fetch(`/songs/${folder}/info.json`);
        if (!infoResponse.ok) throw new Error(`info.json missing in ${folder}`);

        let info = await infoResponse.json();
        // Made By Sudhanshu
        cardContainer.innerHTML += `
          <div data-folder="${folder}" class="card">
            <div class="play">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
                <circle cx="18" cy="18" r="18" fill="#06f054"/>
                <polygon points="12,10 26,18 12,26" fill="black"/>
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="${info.title}" />
            <h2>${info.title}</h2>
            <p>${info.description}</p>
          </div>`;
      } catch (error) {
        console.warn(`Missing or invalid info.json for folder: ${folder}`);
      }
    }
    // Made By Sudhanshu
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", async () => {
        let folder = card.dataset.folder;
        await getSongs(folder);
        playMusic(songs[0]);
      });
    });
  } catch (error) {
    console.error("Error fetching albums:", error);
  }
}
  // Made By Sudhanshu
async function main() {
  let lastSongData = JSON.parse(localStorage.getItem("lastSong"));

  if (lastSongData) {
    await getSongs(lastSongData.folder);
    playMusic(lastSongData.track, true);

    // Restore playback position
    currentSong.addEventListener("loadedmetadata", () => {
      currentSong.currentTime = lastSongData.time || 0;
    });
    // Made By Sudhanshu

  } else {
    await getSongs("PartyMood");
    playMusic(songs[0], true);
  }

  await displayAlbums();
}

main();
