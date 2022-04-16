import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const btn_genThumb = document.querySelector('.upload__gen-thumbnail');
const form = document.querySelector('form');
const input_file = document.querySelector('#video');

const files = {
	input: 'video.mp4',
	thumb: 'thumbnail.jpg'
}

const generateThumbnail = async () => {
	if (input_file.files.length === 0) {
		form.reportValidity();
		return;
	}
	btn_genThumb.classList.add("disabled")
	btn_genThumb.innerText = "Generating...";
	
	console.log(input_file.files);

	console.log('upload__gen-thumbnail');
	const ffmpeg = createFFmpeg({ corePath: '/convert/ffmpeg-core.js', log: true });
	await ffmpeg.load();
	const videoFile = URL.createObjectURL(input_file.files[0]);
	ffmpeg.FS('writeFile', files.input, await fetchFile(videoFile));
	await ffmpeg.run('-i', files.input, '-ss', '00:00:01', '-frames:v', '1', files.thumb);
	const thumbFile = ffmpeg.FS("readFile", files.thumb);
	const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });
	const thumbUrl = URL.createObjectURL(thumbBlob);
	downloadFile(thumbUrl, files.thumb);
	
	ffmpeg.FS("unlink", files.input);
	ffmpeg.FS("unlink", files.thumb);
	
	btn_genThumb.innerText = "Generate Thumbnail →";
	btn_genThumb.classList.remove("disabled")
};

btn_genThumb.addEventListener('click', generateThumbnail);

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};