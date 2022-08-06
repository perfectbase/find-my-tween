import { Rekognition } from 'aws-sdk';
import type { NextPage } from 'next';
import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { trpc } from '../utils/trpc';

const Home: NextPage = () => {
  const webcamRef = useRef<Webcam>(null);
  const [bestMatchImages, setBestMatchImages] = useState<
    (string | undefined)[]
  >([]);
  const [matchResult, setMatchResult] = useState<Rekognition.FaceMatchList>();
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
            setMatchResult(data.matchedFaces);
            setBestMatchImages(data.images ?? []);
          },
        }
      );
    }
  }, [webcamRef]);
  if (!hello.data) {
    return <div>Loading...</div>;
  }
  return (
    <div className="p-4">
      <div className="flex justify-center">
        <div>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-xl"
          />
          <div className="mb-2" />
          <div className="text-center">
            {/* styled tailwind button */}
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleIndexFace}
            >
              Index Face
            </button>
            <div className="mr-2 inline" />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleSearchFace}
            >
              Search Face
            </button>
          </div>
        </div>
      </div>

      {bestMatchImages.length > 0 &&
        bestMatchImages.map((image, index) => (
          <div key={index} className="flex justify-center items-center mt-6">
            <div>
              <img
                className="w-64 h-64 object-cover rounded-md"
                src={'data:image/jpeg;base64,' + image}
                alt="best match"
              />
            </div>
            <div className="mr-4" />
            <div>
              {matchResult && (
                <div>
                  <div>Similarity</div>
                  <div className="text-4xl">
                    {matchResult[index]?.Similarity?.toFixed(6)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Home;
