import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import "./App.css";
import { RightMenu } from "./features/menu/RightMenu";
import { GameScene } from "./features/game/GameScene";
import { ActionPanel } from "./features/menu/ActionPanel";
import { Loading } from "./features/common/Loading";

export const App = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [turn, setTurn] = useState(1);
  const [actionDescription, setActionDescription] = useState("");
  const [actionEvent, setActionEvent] = useState<() => void>(() => {});

  useEffect(() => {
    let phaserGame: Phaser.Game | undefined;
    let gameSceneInstance: Phaser.Scene | undefined;

    // Resize Phaser game when window size changes
    function resizeGame() {
      if (phaserGame && gameRef.current) {
        phaserGame.scale.resize(
          gameRef.current.offsetWidth,
          gameRef.current.offsetHeight
        );
      }
    }
    window.addEventListener("resize", resizeGame);

    // Initialize Phaser game only once
    if (gameRef.current) {
      phaserGame = new Phaser.Game({
        type: Phaser.AUTO,
        width: gameRef.current.offsetWidth,
        height: gameRef.current.offsetHeight,
        parent: gameRef.current,
        scene: GameScene,
      });

      // When Phaser game is ready, get GameScene instance
      phaserGame.events.on("ready", () => {
        gameSceneInstance = phaserGame?.scene.getScene(
          "GameScene"
        ) as GameScene;
        if (gameSceneInstance) {
          // Listen for turn changes in the registry and update React state
          gameSceneInstance.registry.events.on(
            "changedata-turn",
            (_: unknown, value: number) => {
              setTurn(value);
            }
          );

          // Set initial turn value from GameScene method
          setTurn((gameSceneInstance as GameScene).getTurn());

          // Get current action from GameScene and pass to ActionPanel
          const currentAction = (
            gameSceneInstance as GameScene
          ).getCurrentAction?.();
          if (currentAction) {
            setActionDescription(currentAction.description);
            setActionEvent(() => currentAction.event);
          }
          setLoading(false); // Scene is loaded
        }
      });
    }

    // Cleanup Phaser game and event listeners on unmount
    return () => {
      window.removeEventListener("resize", resizeGame);
      phaserGame?.destroy(true);
    };
  }, []);

  return (
    <>
      {/* Phaser game container */}
      <div
        ref={gameRef}
        style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
      />
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Right menu displays current turn */}
          <RightMenu turn={turn} />
          {/* ActionPanel uses first action from GameScene */}
          <ActionPanel
            actionDescription={actionDescription}
            actionEvent={actionEvent}
          />
        </>
      )}
    </>
  );
};
