import { useEffect, useRef } from "react";
import Phaser from "phaser";
import "./App.css";

export const App = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: Phaser.Game | undefined;

    if (gameRef.current) {
      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 1280,
        height: 720,
        parent: gameRef.current,
        scene: {
          create() {
            this.add.text(540, 340, "Turn : 1", {
              font: "48px Arial",
              color: "#ffffff",
            });
          },
        },
      });
    }

    return () => {
      game?.destroy(true);
    };
  }, []);

  return <div ref={gameRef} />;
};
