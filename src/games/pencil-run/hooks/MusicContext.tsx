import {
    createContext,
    useContext,
    useRef,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from "react";

type Track = {
    name: string;
    url: string;
    loop?: boolean;
};

type Sfx = {
    name: string;
    url: string;
};

type MusicContextType = {
    playTrack: (name: string, loop?: boolean) => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    playSfx: (name: string) => void;
    setVolume: (value: number) => void;
    setSfxVolume: (value: number) => void;
    isPlaying: boolean;
    volume: number;
    sfxVolume: number;
    currentTrack: string | null;
    tracks: Track[];
    sfx: Sfx[];
};

// 🎵 Background Music Files
const TRACKS: Track[] = [
    { name: "theme", url: "/assets/pencil-run-sound/theme.mp3", loop: true },
    {
        name: "gameOver",
        url: "/assets/pencil-run-sound/gameOver.mp3",
        loop: false,
    },
];

// 🔊 Sound Effects
const SFX: Sfx[] = [
    { name: "powerup", url: "/assets/pencil-run-sound/powerUp.mp3" },
    { name: "click", url: "/assets/pencil-run-sound/click.mp3" },
    { name: "coin", url: "/assets/pencil-run-sound/coin.mp3" },
];

const MusicContext = createContext<MusicContextType | null>(null);

export const useMusic = () => {
    const ctx = useContext(MusicContext);
    if (!ctx) throw new Error("useMusic must be used within MusicProvider");
    return ctx;
};

export const MusicProvider = ({ children }: { children: ReactNode }) => {
    const trackMap = useRef<Record<string, HTMLAudioElement>>({});
    const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVol] = useState(0.5);
    const [sfxVolume, setSfxVol] = useState(0.7);
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);

    // 🎚 Load saved settings on start
    useEffect(() => {
        const savedMusicVolume = localStorage.getItem("musicVolume");
        const savedSfxVolume = localStorage.getItem("sfxVolume");

        if (savedMusicVolume !== null) setVol(parseFloat(savedMusicVolume));
        if (savedSfxVolume !== null) setSfxVol(parseFloat(savedSfxVolume));
    }, []);

    // 💾 Save settings whenever they change
    useEffect(() => {
        localStorage.setItem("musicVolume", String(volume));
    }, [volume]);

    useEffect(() => {
        localStorage.setItem("sfxVolume", String(sfxVolume));
    }, [sfxVolume]);

    // 🎵 Preload all tracks
    useEffect(() => {
        TRACKS.forEach((t) => {
            if (!trackMap.current[t.name]) {
                const a = new Audio(t.url);
                a.loop = t.loop ?? true;
                a.volume = volume;
                trackMap.current[t.name] = a;
            }
        });
    }, [volume]);

    // ▶️ Play track
    const playTrack = useCallback(
        (name: string, loop?: boolean) => {
            const track = trackMap.current[name];
            if (!track) return console.warn(`Track "${name}" not found`);

            // Stop previous track
            if (audioRef) {
                audioRef.pause();
                audioRef.currentTime = 0;
            }

            // Set up new track
            track.loop = loop ?? track.loop ?? true;
            track.volume = volume;
            track.currentTime = 0; // 👈 ensure playback starts from beginning
            setAudioRef(track);

            // Try playing
            const playPromise = track.play();
            if (playPromise) playPromise.catch(() => {});

            setCurrentTrack(name);
            setIsPlaying(true);
        },
        [audioRef, volume]
    );

    // ⏹ Stop
    const stop = useCallback(() => {
        audioRef?.pause();
        if (audioRef) audioRef.currentTime = 0;
        setIsPlaying(false);
    }, [audioRef]);

    // ⏸ Pause
    const pause = useCallback(() => {
        audioRef?.pause();
        setIsPlaying(false);
    }, [audioRef]);

    // ▶ Resume
    const resume = useCallback(() => {
        if (!audioRef) return;
        const playPromise = audioRef.play();
        if (playPromise) playPromise.catch(() => {});
        setIsPlaying(true);
    }, [audioRef]);

    // 💥 Play SFX
    const playSfx = useCallback(
        (name: string) => {
            const sound = SFX.find((s) => s.name === name);
            if (!sound) return console.warn(`SFX "${name}" not found`);

            const sfxAudio = new Audio(sound.url);
            sfxAudio.volume = sfxVolume;
            sfxAudio.play().catch(() => {});
        },
        [sfxVolume]
    );

    // 🎛 Update Volume
    const setVolume = useCallback(
        (value: number) => {
            setVol(value);
            if (audioRef) audioRef.volume = value;
        },
        [audioRef]
    );

    const setSfxVolume = useCallback((value: number) => {
        setSfxVol(value);
    }, []);

    return (
        <MusicContext.Provider
            value={{
                playTrack,
                stop,
                pause,
                resume,
                playSfx,
                setVolume,
                setSfxVolume,
                isPlaying,
                volume,
                sfxVolume,
                currentTrack,
                tracks: TRACKS,
                sfx: SFX,
            }}
        >
            {children}
        </MusicContext.Provider>
    );
};
