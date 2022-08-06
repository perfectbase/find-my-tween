import type { NextPage } from "next";
import { LegacyRef, useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { trpc } from '../utils/trpc';

const Home: NextPage = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string>("");
  const hello = trpc.useQuery(['hello', { text: 'client' }]);
  const indexFace = trpc.useMutation('indexFace');
  const capture = useCallback(
    () => {
      const imageSrc = webcamRef?.current?.getScreenshot();
      if (imageSrc) {
        setImgSrc(imageSrc);
        indexFace.mutate({ image: imageSrc });
      }
    },
    [webcamRef]
  );
  if (!hello.data) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
      <button onClick={capture}>Capture photo</button>
      <div>{hello.data.greeting}</div>
      {/* <img src={imgSrc} /> */}
    </div>
  );
};

export default Home;
