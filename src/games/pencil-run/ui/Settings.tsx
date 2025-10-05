import { useState } from "react";
import { useMusic } from "../hooks/MusicContext";
import { useInput } from "../hooks/inputContext";

export function SettingsUI() {
    const { playSfx, setVolume, setSfxVolume, volume, sfxVolume } = useMusic();
    const [_, setInput] = useInput();

    const [open, setOpen] = useState(false);
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [sfxEnabled, setSfxEnabled] = useState(true);

    // Toggle music
    const toggleMusic = () => {
        playSfx("click");
        setVolume(musicEnabled ? 0 : 0.6);
        setMusicEnabled(!musicEnabled);
    };

    // Toggle SFX
    const toggleSfx = () => {
        playSfx("click");
        setSfxVolume(sfxEnabled ? 0 : 0.6);
        setSfxEnabled(!sfxEnabled);
    };

    return (
        <>
            {/* ⚙️ Floating Settings Button */}
            <button
                className="settings-toggle-btn"
                onClick={() => {
                    setOpen(true);
                    setInput((s) => ({ ...s, paused: true }));
                }}
            >
                ⚙️
            </button>

            {/* 🧊 Fullscreen Modal Overlay */}
            {open && (
                <div className="settings-overlay">
                    <div className="settings-modal">
                        <h2 className="settings-title">Game Settings</h2>

                        {/* 🎵 Music Settings */}
                        <section className="runner-settings-section">
                            <h3 className="settings-section-title">Music</h3>

                            <button
                                className={`settings-toggle-switch ${
                                    musicEnabled ? "on" : "off"
                                }`}
                                onClick={toggleMusic}
                            >
                                {musicEnabled ? "On" : "Off"}
                            </button>
                        </section>
                        <div className="settings-slider-group">
                            <label className="settings-slider-label">
                                Music Volume
                            </label>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={volume}
                                onChange={(e) =>
                                    setVolume(parseFloat(e.target.value))
                                }
                                className="settings-slider"
                            />
                        </div>

                        {/* 🔊 SFX Settings */}
                        <section className="runner-settings-section">
                            <h3 className="settings-section-title">
                                Sound Effects
                            </h3>

                            <button
                                className={`settings-toggle-switch ${
                                    sfxEnabled ? "on" : "off"
                                }`}
                                onClick={toggleSfx}
                            >
                                {sfxEnabled ? "On" : "Off"}
                            </button>
                        </section>
                        <div className="settings-slider-group">
                            <label className="settings-slider-label">
                                SFX Volume
                            </label>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={sfxVolume}
                                onChange={(e) =>
                                    setSfxVolume(parseFloat(e.target.value))
                                }
                                className="settings-slider"
                            />
                        </div>

                        <div className="settings-status">
                            Music: {musicEnabled ? "🎵 On" : "🔇 Off"} | SFX:{" "}
                            {sfxEnabled ? "🔊 On" : "🚫 Off"}
                        </div>

                        <button
                            className="settings-close-btn"
                            onClick={() => {
                                setOpen(false);
                                setInput((s) => ({ ...s, paused: false }));
                            }}
                        >
                            ✖ Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
