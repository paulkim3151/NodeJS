const video = document.querySelector('video');
const playBtn = document.getElementById('play');
const muteBtn = document.getElementById('mute');
const currentTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');
const volumeRange = document.getElementById('volume');
const timeline = document.getElementById('timeline');
const fullScreenBtn = document.getElementById('fullScreen');
const videoContainer = document.getElementById('videoContainer');
const videoControls = document.getElementById('videoControls');

let controlsTimeout = null;
let controlsMovementTimeout = null;

let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlay = (e) => {
	const icon = playBtn.querySelector('i');
	if (video.paused) {
		video.play();
	} else {
		video.pause();
	}

	icon.classList = video.paused ? 'fas fa-play' : 'fas fa-pause';
};

const handleMute = (e) => {
	const icon = muteBtn.querySelector('i');
	video.muted = !video.muted;
	icon.classList = video.muted ? 'fas fa-volume-xmark' : 'fas fa-volume-up';
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

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substring(14, 19);

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
	const icon = fullScreenBtn.querySelector('i');
	const fullscreenElem = document.fullscreenElement;
	if (fullscreenElem) {
		document.exitFullscreen();
		icon.classList = 'fas fa-expand';
	} else {
		videoContainer.requestFullscreen();
		icon.classList = 'fas fa-compress';
	}
};

const hideControls = () => videoControls.classList.remove('showing');

const handleMouseMove = () => {
	if (controlsTimeout) {
		clearTimeout(controlsTimeout);
		controlsTimeout = null;
	}

	if (controlsMovementTimeout) {
		clearTimeout(controlsMovementTimeout);
		controlsMovementTimeout = null;
	}

	videoControls.classList.add('showing');
	controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
	controlsTimeout = setTimeout(hideControls, 1000);
};

playBtn.addEventListener('click', handlePlay);
video.addEventListener('click', handlePlay);
video.addEventListener('dblclick', handleFullScreen)
muteBtn.addEventListener('click', handleMute);
volumeRange.addEventListener('input', handleVolumeChange);
timeline.addEventListener('input', handleTimelineChange);
fullScreenBtn.addEventListener('click', handleFullScreen);
video.addEventListener('loadedmetadata', handleLoadedMetadata);
video.addEventListener('timeupdate', handleTimeUpdate);
videoContainer.addEventListener('mousemove', handleMouseMove);
videoContainer.addEventListener('mouseleave', handleMouseLeave);

document.onfullscreenchange = () => {
	const fullscreenElem = document.fullscreenElement;
	if (!fullscreenElem) {
		document.querySelector('#fullScreen>i').classList = 'fas fa-expand';
	}
};

if (video.readyState >= 1) {
	handleLoadedMetadata();
}