import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import "./App.css";
import { RightMenu } from "./features/menu/RightMenu";
import { GameScene } from "./features/game/GameScene";

export const App = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const [turn, setTurn] = useState(1);

  useEffect(() => {
    let phaserGame: Phaser.Game | undefined;
    let gameSceneInstance: Phaser.Scene | undefined;

    // Handle window resize
    function resizeGame() {
      if (phaserGame && gameRef.current) {
        phaserGame.scale.resize(
          gameRef.current.offsetWidth,
          gameRef.current.offsetHeight
        );
      }
    }
    window.addEventListener("resize", resizeGame);

    // Only initialize the game once
    if (gameRef.current) {
      // Create the Phaser game instance
      phaserGame = new Phaser.Game({
        type: Phaser.AUTO,
        width: gameRef.current.offsetWidth,
        height: gameRef.current.offsetHeight,
        parent: gameRef.current,
        scene: GameScene,
      });

      // Update turn state when it changes in the game scene
      phaserGame.events.on("ready", () => {
        gameSceneInstance = phaserGame?.scene.getScene("GameScene");
        if (gameSceneInstance) {
          gameSceneInstance.registry.events.on(
            "changedata-turn",
            (_: any, value: number) => {
              setTurn(value);
            }
          );
          // Set initial turn value
          setTurn(gameSceneInstance.registry.get("turn"));
        }
      });
    }

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", resizeGame);
      phaserGame?.destroy(true);
    };
  }, []);

  return (
    <>
      <div
        ref={gameRef}
        style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
      />
      <RightMenu turn={turn} />
    </>
  );
};
