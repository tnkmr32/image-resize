import React, { useRef, useState } from "react";
// import logo from "./logo.svg";
import { saveAs } from "file-saver";
import "./App.css";
import Konva from "konva";
import { Layer, Rect, Stage, Text, Image } from "react-konva";
import axios from "axios";
import useImage from "use-image";

const ColoredRect = () => {
  const [color, setColor] = useState("green");

  const handleClick = () => {
    setColor(Konva.Util.getRandomColor());
  };

  return (
    <Rect
      x={20}
      y={20}
      width={50}
      height={50}
      fill={color}
      shadowBlur={5}
      onClick={handleClick}
    />
  );
};

const downloadImage = async (src: string, fileName?: string) => {
  try {
    const response = await axios.get(src, {
      responseType: "blob",
    });
    saveAs(response.data, fileName ?? src.substring(src.lastIndexOf("/") + 1));
  } catch (error) {
    console.error("Image download failed", error);
  }
};

function App() {
  // useState()で画像のパスを保持
  // ※デフォルトで表示する画像を初期値で指定(この例ではpublicフォルダのdefault-profile.pngを指定)
  const [profileImage, setProfileImage] = useState<{
    blob: string;
    name: string;
  }>();

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    // React.ChangeEvent<HTMLInputElement>よりファイルを取得
    const fileObject = e.target.files[0];

    // オブジェクトURLを生成し、useState()を更新
    setProfileImage({
      blob: window.URL.createObjectURL(fileObject),
      name: fileObject.name,
    });
  };

  const stageRef = useRef<Konva.Stage>(null);

  const handleOnSubmit = () => {
    const temp = stageRef.current;

    if (temp == null) return null;

    // データURL形式で値を取得できる
    const result = temp.toDataURL();

    // resultを使って、ここから先は任意の保存処理など...
    downloadImage(result);
  };

  console.log(profileImage?.blob);
  const [image] = useImage(profileImage?.blob ?? "");

  return (
    <div className="flex justify-center items-center mt-8">
      <img
        src={profileImage?.blob}
        className="profileImage"
        alt="profileImage"
      />
      <input
        type="file"
        accept="image/*"
        onChange={onFileInputChange}
        className="pl-4"
      />
      <img
        src={profileImage?.blob}
        className="processedImage"
        alt="processedImage"
      />
      <Stage ref={stageRef} width={500} height={500}>
        <Layer>
          <Text text="Try click on rect" />
          <ColoredRect />
          <Image image={image} width={400} height={400}/>
        </Layer>
      </Stage>
      <button
        className="saveButton"
        type="button"
        onClick={async () => {
          // if (profileImage !== undefined) {
          //   await downloadImage(profileImage.blob, profileImage.name);
          // }
          handleOnSubmit();
        }}
      >
        SaveImage
      </button>
    </div>
  );
}

export default App;
