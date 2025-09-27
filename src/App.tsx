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
    const gameRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [game, setGame] = useState<ReturnType<GameScene['getGame']>>({} as ReturnType<GameScene['getGame']>);
    const [currentActionEvent, setCurrentActionEvent] = useState<(() => void) | undefined>(undefined);

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
                gameSceneInstance = phaserGame?.scene.getScene('GameScene') as GameScene;
                if (gameSceneInstance) {
                    // Listen for any game state change (turn/resources/actions/players)
                    const updateState = () => {
                        if (gameSceneInstance != null) {
                            // Passing the whole GameScene instance to React works because its properties are directly accessible
                            // However, this is not recommended for React state, as class instances can cause subtle bugs
                            // Using getGame() is safer and returns a plain JS object, which is more idiomatic for React
                            // setGame(gameSceneInstance.getGame()); // Recommended
                            // TODO: Works but not best practice
                            setGame(gameSceneInstance);
                            setCurrentActionEvent(gameSceneInstance.getCurrentAction()?.event);
                        }
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
                    {/* console.log('game.resources:', game.resources)*/}
                    <ResourcesMenu resources={game.resources} />

                    {/* Right menu displays current turn */}
                    <RightMenu turn={game.turn} />

                    {/* ActionPanel uses first action from GameScene */}
                    <ActionPanel
                        actionDescription={game.actions?.[0]?.description}
                        actionEvent={currentActionEvent ?? (() => {})}
                    />
                </>
            )}
        </>
    );
};
