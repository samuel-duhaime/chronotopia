import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';
import { ResourcesMenu } from './features/menu/ResourcesMenu';
import { RightMenu } from './features/menu/RightMenu';
import { ActionPanel } from './features/menu/ActionPanel';
import { Loading } from './features/common/Loading';
import { GameScene } from './features/game/GameScene';
import './App.css';

// App component
export const App = () => {
    const gameRef = useRef<HTMLDivElement>(null); // Reference to Phaser game container
    const gameSceneRef = useRef<GameScene | null>(null); // Store GameScene instance
    const [loading, setLoading] = useState(true);
    const [game, setGame] = useState<ReturnType<GameScene['getGame']>>({} as ReturnType<GameScene['getGame']>);

    useEffect(() => {
        let phaserGame: Phaser.Game | undefined;

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
                scene: GameScene,
                plugins: {
                    scene: [
                        {
                            key: 'rexBoard',
                            plugin: BoardPlugin,
                            mapping: 'rexBoard'
                        }
                    ]
                }
            });

            // When Phaser game is ready, get GameScene instance
            phaserGame.events.on('ready', () => {
                gameSceneRef.current = phaserGame?.scene.getScene('GameScene') as GameScene; // Assign instance to ref
                if (gameSceneRef.current) {
                    // Set initial state
                    const updateState = () => {
                        if (gameSceneRef.current != null) {
                            setGame(gameSceneRef.current); // Use plain object because GameScene is not serializable
                        }
                    };

                    // Listen for any game state change (turn/resources/actions/players)
                    gameSceneRef.current.registry.events.on('changedata', updateState);
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

    // Use the correct event function for ActionPanel
    const actionEvent = () => {
        if (gameSceneRef.current) {
            gameSceneRef.current.getCurrentAction()?.event();
            setGame(gameSceneRef.current.getGame()); // Update React state current action event
        }
    };

    return (
        <>
            {/* Phaser game container */}
            <div ref={gameRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />
            {loading ? (
                <Loading />
            ) : (
                <>
                    {/* Top middle menu to display resources */}
                    <ResourcesMenu resources={game?.resources ?? []} />

                    {/* Right menu displays current turn */}
                    <RightMenu turn={game?.turn} />

                    {/* ActionPanel uses current action from GameScene */}
                    <ActionPanel actionDescription={game?.actions?.[0]?.description} actionEvent={actionEvent} />
                </>
            )}
        </>
    );
};
