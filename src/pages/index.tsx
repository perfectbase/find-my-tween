import type { NextPage } from 'next';
import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { trpc } from '../utils/trpc';

const Home: NextPage = () => {
  const webcamRef = useRef<Webcam>(null);
  const [bestMatchImage, setBestMatchImage] = useState<string>('');
  const hello = trpc.useQuery(['hello', { text: 'client' }]);
  const indexFace = trpc.useMutation('indexFace');
  const searchFaceByImage = trpc.useMutation('searchFaceByImage');
  const handleIndexFace = useCallback(() => {
    const imageSrc = webcamRef?.current?.getScreenshot();
    if (imageSrc) {
      indexFace.mutate({ image: imageSrc });
    }
  }, [webcamRef]);
  const handleSearchFace = useCallback(async () => {
    const imageSrc = webcamRef?.current?.getScreenshot();
    if (imageSrc) {
      await searchFaceByImage.mutate(
        { image: imageSrc },
        {
          onSuccess(data) {
            console.log(data);
            // convers s3 image to base64
            if (data?.image) {
              const base64 =
                'data:image/jpeg;base64,' +
                Buffer.from(data.image as Buffer).toString('base64');
              console.log(JSON.stringify(base64));
              setBestMatchImage(base64);
            }
          },
        }
      );
    }
  }, [webcamRef]);
  if (!hello.data) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
      <button onClick={handleIndexFace}>Index Face</button>
      <button onClick={handleSearchFace}>Search Face</button>
      <div>{hello.data.greeting}</div>
      <img src={bestMatchImage} />
    </div>
  );
};

export default Home;
