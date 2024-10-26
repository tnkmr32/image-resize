import React, { useMemo, useRef, useState } from "react";
import { saveAs } from "file-saver";
import "./App.css";
import Konva from "konva";
import { Layer, Stage, Image, Rect } from "react-konva";
import axios from "axios";
import useImage from "use-image";

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

type ColoredRectProps = {
  width: number;
  height: number;
  color?: string;
};
const ColoredRect = (props: ColoredRectProps) => {
  return <Rect width={props.width} height={props.height} fill={props.color} />;
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

  const canvasSize = 500;
  const MARGIN_DEFAULT = 50;
  const [margin, setMargin] = useState(MARGIN_DEFAULT);

  const onChangeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const num = Number(e.target.value);
    if (isNaN(num)) return;
    setMargin(num);
  };

  const stageRef = useRef<Konva.Stage>(null);

  const handleOnDownload = async () => {
    const temp = stageRef.current;
    if (temp == null) return null;
    // データURL形式で値を取得できる
    const result = temp.toDataURL({ pixelRatio: 3 });
    await downloadImage(result, profileImage?.name);
  };

  const [image] = useImage(profileImage?.blob ?? "");

  const imageProps = useMemo(() => {
    if (image === undefined) {
      return { width: 0, height: 0, x: 0, y: 0 };
    }

    // アスペクト比。1以上が横向き
    const aspect = image.width / image.height;

    let width = 0;
    let height = 0;
    if (aspect >= 1) {
      width = canvasSize - margin * 2;
      height = width / aspect;
    } else {
      height = canvasSize - margin * 2;
      width = height * aspect;
    }

    const x = (canvasSize - width) / 2;
    const y = (canvasSize - height) / 2;

    return { width, height, x, y };
  }, [image, margin]);

  return (
    <div className="container">
      <div className="canvas">
        <Stage ref={stageRef} width={canvasSize} height={canvasSize}>
          <Layer>
            <ColoredRect
              width={canvasSize}
              height={canvasSize}
              color="#ffffffff"
            />
            <Image
              image={image}
              width={imageProps.width}
              height={imageProps.height}
              x={imageProps.x}
              y={imageProps.y}
            />
          </Layer>
        </Stage>
      </div>
      <div className="controlPanel">
        <input
          type="file"
          accept="image/*"
          onChange={onFileInputChange}
          className="pl-4"
        />
        <div className="adjustMargin">
          余白の幅
          <input
            type="range"
            accept="image/*"
            value={margin}
            onChange={onChangeSlider}
            className="pl-4"
            onDoubleClick={() => setMargin(MARGIN_DEFAULT)}
          />
        </div>

        <button
          className="saveButton"
          type="button"
          onClick={async () => {
            handleOnDownload();
          }}
        >
          画像を保存
        </button>
      </div>
    </div>
  );
}

export default App;
