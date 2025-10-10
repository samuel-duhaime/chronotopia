import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';
import { ResourcesMenu } from './features/ui/ResourcesMenu';
import { RightMenu } from './features/ui/RightMenu';
import { ActionPanel } from './features/ui/ActionPanel';
// import { Loading } from './features/common/Loading';
import { GameScene } from './features/game/GameScene';
import './App.css';

// App component
export const App = () => {
    const gameRef = useRef<HTMLDivElement>(null); // Reference to Phaser game container

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
                dom: { createContainer: true },
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

            {/* Top middle menu to display resources */}
            <ResourcesMenu />

            {/* Right menu displays current turn */}
            <RightMenu />

            {/* ActionPanel use current action */}
            <ActionPanel />
        </>
    );
};
