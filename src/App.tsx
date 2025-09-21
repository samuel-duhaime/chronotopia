import { useEffect, useRef } from "react";
import Phaser from "phaser";
import "./App.css";
import { RightMenu } from "./features/menu/RightMenu";

export const App = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: Phaser.Game | undefined;

    function resizeGame() {
      if (game && gameRef.current) {
        game.scale.resize(
          gameRef.current.offsetWidth,
          gameRef.current.offsetHeight
        );
      }
    }

    if (gameRef.current) {
      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: gameRef.current.offsetWidth,
        height: gameRef.current.offsetHeight,
        parent: gameRef.current,
        scene: {
          create() {
            // Game logic here
          },
        },
      });
      window.addEventListener("resize", resizeGame);
    }

    return () => {
      window.removeEventListener("resize", resizeGame);
      game?.destroy(true);
    };
  }, []);

  return (
    <>
      <div
        ref={gameRef}
        style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
      />
      <RightMenu turn={1} />
    </>
  );
};
