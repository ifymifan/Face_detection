import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load FaceAPI models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  // Start Video Stream
  useEffect(() => {
    if (modelsLoaded) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    }
  }, [modelsLoaded]);

  // Detect Faces
  useEffect(() => {
    const detectFaces = async () => {
      if (videoRef.current && modelsLoaded) {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.matchDimensions(canvas, videoRef.current);

        const resized = faceapi.resizeResults(detections, videoRef.current);
        faceapi.draw.drawDetections(canvas, resized);
        faceapi.draw.drawFaceLandmarks(canvas, resized);
        faceapi.draw.drawFaceExpressions(canvas, resized);
      }
    };

    if (modelsLoaded) {
      setInterval(detectFaces, 100);
    }
  }, [modelsLoaded]);

  return (
    <div className="flex flex-col items-center mt-5">
      <h1 className="text-xl font-bold">Face Detection</h1>
      <video ref={videoRef} autoPlay muted className="border rounded-lg w-96 h-72" />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-96 h-72" />
    </div>
  );
};

export default FaceDetection;
