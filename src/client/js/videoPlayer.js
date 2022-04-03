const video = document.querySelector('video');
const playBtn = document.getElementById('play');
const muteBtn = document.getElementById('mute');
const currentTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');
const volumeRange = document.getElementById('volume');
const timeline = document.getElementById('timeline');
const fullScreenBtn = document.getElementById('fullScreen');
const videoContainer = document.getElementById('videoContainer');

let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlay = (e) => {
	if (video.paused) {
		video.play();
	} else {
		video.pause();
	}

	playBtn.innerText = video.paused ? 'Play' : 'Pause';
};

const handleMute = (e) => {
	video.muted = !video.muted;
	muteBtn.innerText = video.muted ? 'Unmute' : 'Mute';
	volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
	const {
		target: { value },
	} = event;
	if (video.muted) {
		video.muted = false;
		muteBtn.innerText = 'Mute';
	}
	volumeValue = value;
	video.volume = value;
};

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substring(11, 19);

const handleLoadedMetadata = () => {
	totalTime.innerText = formatTime(Math.floor(video.duration));
	timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
	currentTime.innerText = formatTime(Math.floor(video.currentTime));
	timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
	const {
		target: { value },
	} = event;
	video.currentTime = value;
};

const handleFullScreen = (event) => {
	const fullscreenElem = document.fullscreenElement;
	if (fullscreenElem) {
		document.exitFullscreen();
		fullScreenBtn.innerText = 'Enter Full Screen';
	} else {
		videoContainer.requestFullscreen();
		fullScreenBtn.innerText = 'Exit Full Screen';
	}
};

playBtn.addEventListener('click', handlePlay);
muteBtn.addEventListener('click', handleMute);
volumeRange.addEventListener('input', handleVolumeChange);
timeline.addEventListener('input', handleTimelineChange);
fullScreenBtn.addEventListener('click', handleFullScreen);
video.addEventListener('loadedmetadata', handleLoadedMetadata);
video.addEventListener('timeupdate', handleTimeUpdate);

document.onfullscreenchange = () => {
	const fullscreenElem = document.fullscreenElement;
	if (!fullscreenElem) {
		fullScreenBtn.innerText = 'Enter Full Screen';
	}
};

if (video.readyState >= 1) {
	handleLoadedMetadata();
}