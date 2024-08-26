import { GameProvider } from '../context/GameContext';
import { PlayerProvider } from '../context/PlayerContext';
import "../styles/global.css"

function MyApp({ Component, pageProps }) {
    return (
        <GameProvider>
            <PlayerProvider>
                <Component {...pageProps} />
            </PlayerProvider>
        </GameProvider>
    );
}

export default MyApp;
