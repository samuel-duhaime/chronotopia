import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import './App.css';
import { ResourcesMenu } from './features/menu/ResourcesMenu';
import { RightMenu } from './features/menu/RightMenu';
import { GameScene } from './features/game/GameScene';
import { ActionPanel } from './features/menu/ActionPanel';
import { Loading } from './features/common/Loading';

export const App = () => {
    const gameRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [game, setGame] = useState<ReturnType<GameScene['getGame']>>({} as ReturnType<GameScene['getGame']>);

    useEffect(() => {
        let phaserGame: Phaser.Game | undefined;
        let gameSceneInstance: GameScene | undefined;

        // Resize Phaser game when window size changes
        function resizeGame() {
            if (phaserGame && gameRef.current) {
                phaserGame.scale.resize(gameRef.current.offsetWidth, gameRef.current.offsetHeight);
            }
        }
        window.addEventListener('resize', resizeGame);

        // Initialize Phaser game only once
        if (gameRef.current) {
            phaserGame = new Phaser.Game({
                type: Phaser.AUTO,
                width: gameRef.current.offsetWidth,
                height: gameRef.current.offsetHeight,
                parent: gameRef.current,
                scene: GameScene
            });

            // When Phaser game is ready, get GameScene instance
            phaserGame.events.on('ready', () => {
                gameSceneInstance = phaserGame?.scene.getScene('GameScene') as GameScene;
                if (gameSceneInstance) {
                    // Listen for any game state change (turn/resources/actions/players)
                    const updateState = () => {
                        const currentGame = gameSceneInstance!.getGame();
                        setGame(currentGame);
                    };

                    // Listen for any game state change (turn/resources/actions/players)
                    gameSceneInstance.registry.events.on('changedata', updateState);

                    updateState(); // Set initial state from GameScene
                    setLoading(false); // Scene is loaded
                }
            });
        }

        // Cleanup Phaser game and event listeners on unmount
        return () => {
            window.removeEventListener('resize', resizeGame);
            phaserGame?.destroy(true);
        };
    }, []);

    return (
        <>
            {/* Phaser game container */}
            <div ref={gameRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />
            {loading ? (
                <Loading />
            ) : (
                <>
                    {/* Top middle menu to display resources */}
                    <ResourcesMenu resources={game.resources} />

                    {/* Right menu displays current turn */}
                    <RightMenu turn={game.turn} />

                    {/* ActionPanel uses first action from GameScene */}
                    <ActionPanel
                        actionDescription={game.actions?.[0]?.description}
                        actionEvent={game.actions?.[0]?.event}
                    />
                </>
            )}
        </>
    );
};
