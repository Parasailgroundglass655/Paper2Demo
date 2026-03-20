import "./index.css";
import { Composition } from "remotion";
import { PaperDemo, paperDemoSchema, calculateMetadata } from "./PaperDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PaperDemo"
        component={PaperDemo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        schema={paperDemoSchema}
        defaultProps={{ dataUrl: "paper/paper-data.json", paperData: null }}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
