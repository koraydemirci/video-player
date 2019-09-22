//Note for the code reviewer: In my first version, I downloaded all images to local storage
// and use them from local storage in the code. Last minute when I clean the cache and check my code,
// I realized that getting images from local storages and using them didn't work.
// Because of time limit, I couldn't fix the code and take a short cut by using images directly from CDN.
//downloadFirstImage() method was downloadImages() before this short cut.

const FramePlayer = (function() {
  class FramePlayer {
    constructor(playerContainer) {
      this.playerContainer = playerContainer;
      this.progressBarContainer = document.querySelector(
        "#progress-bar-container"
      );
      this.progressBar = document.querySelector("#progress-bar");
      this.playButton = document.querySelector("#play-button");
      this.pauseButton = document.querySelector("#pause-button");
      this.displayedFrameX = 0; //order of displayed frame in x axis
      this.displayedFrameY = 0; //order of displayed frame in y axis
      this.orderOfImage = 0;
      this.setIntervalId = null;
      this.totalFrameNumber = 7 * 25;
      this.currentFrame = 0;
      this.downloadFirstImage();
      this.on();
    }

    async downloadFirstImage() {
      var t0 = performance.now();

      //insert first image for play
      this.playerContainer.style.backgroundImage = `url(http://storage.googleapis.com/alyo/assignments/images/0.jpg)`;

      //calculate download time
      var t1 = performance.now();
      const deltaTime = t1 - t0;

      //dispatch download event
      const downloadCompleteEvent = new Event("downloadcomplete");
      this.on(
        "downloadcomplete",
        function(deltaTime) {
          console.log("download completed in " + deltaTime);
        },
        deltaTime
      );
      this.playerContainer.dispatchEvent(downloadCompleteEvent);
    }

    seekPosition(element, event) {
      let percentage =
        (event.clientX - element.offsetLeft) / element.offsetWidth;
      this.progressBar.style.width = percentage * 100 + "%";
      let currentFrame = Math.round(percentage * this.totalFrameNumber);
      this.orderOfImage = Math.floor(currentFrame / 25);
      this.playerContainer.style.backgroundImage = `url(http://storage.googleapis.com/alyo/assignments/images/${
        this.orderOfImage
      }.jpg)`;
      this.displayedFrameY = Math.floor((currentFrame % 25) / 5);
      this.displayedFrameX = currentFrame % 5;

      this.displayFrame();
      this.pause();
    }

    displayFrame() {
      //insert frame for play
      this.playerContainer.style.backgroundPosition = `${25 *
        this.displayedFrameX}% ${25 * this.displayedFrameY}%`;

      //move to next frame
      if (this.displayedFrameX < 4 && this.displayedFrameY < 5) {
        this.displayedFrameX++;
      } else if (this.displayedFrameX === 4 && this.displayedFrameY < 4) {
        this.displayedFrameX = 0;
        this.displayedFrameY++;
      } else if (
        this.displayedFrameX === 4 &&
        this.displayedFrameY === 4 &&
        this.orderOfImage < 6
      ) {
        this.displayedFrameX = 0;
        this.displayedFrameY = 0;

        //insert new image for play
        this.playerContainer.style.backgroundImage = `url(http://storage.googleapis.com/alyo/assignments/images/${++this
          .orderOfImage}.jpg)`;
      } else if (
        this.displayedFrameX === 4 &&
        this.displayedFrameY === 4 &&
        this.orderOfImage === 6
      ) {
        this.pause();

        //dispatch end event
        const endEvent = new Event("end");
        this.on("end", function(deltaTime) {
          console.log("video is completed");
        });
        this.playerContainer.dispatchEvent(endEvent);
      }

      //update progress bar
      this.currentFrame =
        this.orderOfImage * 25 +
        (this.displayedFrameY * 5 + this.displayedFrameX) +
        1;
      const percentage = (this.currentFrame * 100) / this.totalFrameNumber;
      this.progressBar.style.width = percentage + "%";
    }

    play() {
      //restart video if play button is clicked again when video is finished
      if (
        this.displayedFrameX === 4 &&
        this.displayedFrameY === 4 &&
        this.orderOfImage === 6
      ) {
        this.displayedFrameX = 0;
        this.displayedFrameY = 0;
        this.orderOfImage = 0;
      }
      //display pause button when hover on video player
      this.playButton.style.display = "none";
      this.pauseButton.style.display = "block";

      //dispatch play event
      const playTime = (this.currentFrame + 1) * 100; //ms
      const playTimeEvent = new Event("play");
      this.on(
        "play",
        function(playTime) {
          console.log("video is playing now");
        },
        playTime
      );
      this.playerContainer.dispatchEvent(playTimeEvent);

      //display frames for video
      this.setIntervalId = setInterval(this.displayFrame.bind(this), 100);
    }

    pause() {
      //display play button when hover on video player
      this.pauseButton.style.display = "none";
      this.playButton.style.display = "block";

      //dispatch pause event
      const pauseTime = (this.currentFrame + 1) * 100; //ms
      const pauseTimeEvent = new Event("pause");
      this.on(
        "play",
        function(pauseTime) {
          console.log("video is paused");
        },
        pauseTime
      );
      this.playerContainer.dispatchEvent(pauseTimeEvent);

      //stop video
      clearInterval(this.setIntervalId);
    }

    on(event, callback, ms) {
      this.playerContainer.addEventListener(event, function() {
        if (event === "downloadcomplete") {
          callback(ms);
        } else if (event === "play") {
          callback(ms);
        } else if (event === "pause") {
          callback(ms);
        } else if (event === "end") {
          callback();
        }
      });
    }
  }
  return FramePlayer;
})();
