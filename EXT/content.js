(async () => {
  // 1. Find the primary video element on the page.
  const video = document.querySelector('video');

  if (!video) {
    alert('No video found on this page!');
    return;
  }
  
  // Ensure the original video is playing to have a stream to capture.
  if (video.paused) {
    await video.play().catch(e => {
      console.error("Original video couldn't play:", e);
      alert("Please play the video first before activating Picture-in-Picture.");
      return;
    });
  }

  // 2. Request a new Picture-in-Picture window.
  const pipWindow = await window.documentPictureInPicture.requestWindow({
    width: video.clientWidth,
    height: video.clientHeight,
  });

  // 3. Create a new video element for our PiP window.
  const pipVideo = document.createElement('video');
  pipVideo.autoplay = true; // Important: The stream needs to be played.
  pipVideo.style.width = '100%';
  pipVideo.style.height = '100%';

  // 4. THE CRITICAL FIX: Capture the stream from the original video.
  // This gets the actual rendered frames and audio.
  pipVideo.srcObject = video.captureStream();
  
  // Mute the original player to prevent hearing audio from two sources.
  video.muted = true;

  // 5. Add our new video element to the PiP window.
  pipWindow.document.body.style.margin = '0';
  pipWindow.document.body.append(pipVideo);

  // 6. Create better controls and add them.
  const controlsContainer = document.createElement('div');
  Object.assign(controlsContainer.style, {
    position: 'absolute',
    bottom: '5%',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '10px',
    opacity: '0', // Start hidden
    transition: 'opacity 0.3s ease-in-out'
  });

  // Show controls on mouseover
  pipWindow.document.body.addEventListener('mouseenter', () => controlsContainer.style.opacity = '1');
  pipWindow.document.body.addEventListener('mouseleave', () => controlsContainer.style.opacity = '0');

  const createButton = (text, onClick) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;
    Object.assign(button.style, {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      border: 'none',
      padding: '12px 18px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px'
    });
    return button;
  };

  // IMPORTANT: The controls now manipulate the ORIGINAL video element.
  const backwardButton = createButton('<< 10s', () => video.currentTime -= 10);
  const playPauseButton = createButton(video.paused ? '▶' : '❚❚', () => {
    if (video.paused) {
      video.play();
      playPauseButton.textContent = '❚❚';
    } else {
      video.pause();
      playPauseButton.textContent = '▶';
    }
  });
  const forwardButton = createButton('10s >>', () => video.currentTime += 10);

  controlsContainer.append(backwardButton, playPauseButton, forwardButton);
  pipWindow.document.body.append(controlsContainer);

  // 7. Clean up when the PiP window is closed.
  pipWindow.addEventListener('pagehide', () => {
    // Stop the stream tracks to release resources.
    pipVideo.srcObject.getTracks().forEach(track => track.stop());
    // Unmute the original video.
    video.muted = false;
  });

})();