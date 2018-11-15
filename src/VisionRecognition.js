/*
 * We copied a big part of this code, but made some changes to integrate it with our app.
 *
 * What: Vision recognition by classifying images with a neural net
 * Where: https://teachablemachine.withgoogle.com/
 * Why: Using machine learning for image classification is not a 
 *      trivial task. Would take longer than the time allotted
 *      for the project to impliment if created from scratch.
 */

import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

// Number of classes to classify
const NUM_CLASSES = 3;
// Webcam Image size. Must be 227. 
const IMAGE_SIZE = 227;
// K value for KNN
const TOPK = 10;

const DIRECTION = ["UP", "DOWN", "IDLE"];


export default class VisionRecognition {
  constructor() {
    // Initiate variables
    this.infoTexts = [];
    this.training = -1; // -1 when no class is being trained
    this.videoPlaying = false;

    // Initiate deeplearn.js math and knn classifier objects
    this.bindPage();

    // Direction of hand (where to move paddle): 1 if up, 0 if down (-1 if no direction set)
    this.direction = -1;

    // Create video element that will contain the webcam image
    this.video = document.createElement('video');
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('playsinline', '');

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'calibration-wrapper');
    document.body.appendChild(wrapper);

    const textCalib = document.createElement('p');
    textCalib.innerHTML = "Calibration";
    wrapper.appendChild(textCalib);

    // Add video element to DOM
    wrapper.appendChild(this.video);

    const subWrapper = document.createElement('div');
    subWrapper.setAttribute('class', 'calibration-btns-wrapper');
    wrapper.appendChild(subWrapper);

    // Create training buttons and info texts    
    for (let i = 0; i < NUM_CLASSES; i++) {
      const div = document.createElement('div');
      div.setAttribute('class', 'calibration-btn');
      subWrapper.appendChild(div);
      div.style.marginBottom = '10px';

      // Create training button
      const button = document.createElement('button')
      //button.innerText = "Train " + DIRECTION[i];
      button.innerText = DIRECTION[i];
      div.appendChild(button);

      // Listen for mouse events when clicking the button
      button.addEventListener('mousedown', () => this.training = i);
      button.addEventListener('mouseup', () => this.training = -1);

      // Create info text
      const infoText = document.createElement('span')
      infoText.innerText = " No examples added";
      div.appendChild(infoText);
      this.infoTexts.push(infoText);
    }


    // Setup webcam
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        this.video.srcObject = stream;
        this.video.width = IMAGE_SIZE;
        this.video.height = IMAGE_SIZE;

        this.video.addEventListener('playing', () => this.videoPlaying = true);
        this.video.addEventListener('paused', () => this.videoPlaying = false);
      })
  }

  async bindPage() {
    this.knn = knnClassifier.create();
    this.mobilenet = await mobilenetModule.load();

    this.start();
  }

  start() {
    if (this.timer) {
      this.stop();
    }
    this.video.play();
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    this.video.pause();
    cancelAnimationFrame(this.timer);
  }

  async animate() {
    if (this.videoPlaying) {
      // Get image data from video element
      const image = tf.fromPixels(this.video);

      let logits;
      // 'conv_preds' is the logits activation of MobileNet.
      const infer = () => this.mobilenet.infer(image, 'conv_preds');

      // Train class if one of the buttons is held down
      if (this.training != -1) {
        logits = infer();

        // Add current image to classifier
        this.knn.addExample(logits, this.training);
		    //console.log("help");
      }

      const numClasses = this.knn.getNumClasses();
      if (numClasses > 0) {

        // If classes have been added run predict
        logits = infer();
        const res = await this.knn.predictClass(logits, TOPK);

        let max = 0;

        for (let i = 0; i < NUM_CLASSES; i++) {

          // The number of examples for each class
          const exampleCount = this.knn.getClassExampleCount();

          // Make the predicted class bold
          if (res.classIndex == i) {
            this.infoTexts[i].style.fontWeight = 'bold';
          } else {
            this.infoTexts[i].style.fontWeight = 'normal';
          }
		
    			let percentString = res.confidences[i];
    			let percent = parseFloat(percentString);
    			percent = Math.floor(percent * 100);

    			if(percent > max){
              //console.log("Up: " + direction);
              this.direction = i;
              max = percent;
    		  }
      
          // Update info text
          if (exampleCount[i] > 0) {
            this.infoTexts[i].innerText = ` ${exampleCount[i]} examples - ${percent}%` 
          }
        }
        //reset
        max = 0;
      }

      // Dispose image when done
      image.dispose();
      if (logits != null) {
        logits.dispose();
      }
    }
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }
}