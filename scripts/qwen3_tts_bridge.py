#!/usr/bin/env python3
"""
Qwen3-TTS Voice Design Bridge for erklaer-reels / Weltlogik.
Runs locally on Apple Silicon (M-Series Mac) using MLX Metal GPU.
Generates bespoke, human-grade documentary voices from natural language prompts.
"""

import sys
import json
import os
import time
import subprocess
import soundfile as sf
import numpy as np

PERSONA_PROMPTS = {
    "explainer-storyteller": (
        "An articulate, intelligent, and charismatic German male speaker in his early 30s. "
        "Natural, modern storytelling voice, warm and conversational baritone-tenor tone. "
        "Speaks with passionate curiosity, dynamic sentence melody, and engaging, fluid pacing. "
        "Perfect balance: lively and gripping for TikTok and Reels, yet calm, pleasant, and authoritative for 15-minute YouTube documentaries. "
        "Flawless German Hochdeutsch pronunciation, zero robotic cadence, captivating and addictive to listen to."
    ),
    "explainer-suspense": (
        "A captivating, 32-year-old German male narrator with a smooth, warm, and expressive voice. "
        "Masters the art of suspense: speaks with genuine intrigue and excitement, drawing the listener in immediately like a top-tier geopolitical storyteller. "
        "Natural breathing, crisp modern articulation, fluid rhythm that neither rushes nor drags. "
        "A voice you want to listen to for hours without ear fatigue."
    ),
    "explainer-soveraen": (
        "A confident, modern German male explainer voice in his mid-30s. "
        "Velvety, warm lower-mid resonance, crisp diction, intellectual authority without being dry or academic. "
        "Speaks with compelling clarity and steady forward momentum, making complex geopolitical topics instantly fascinating and accessible."
    ),
    "explainer-close-mic": (
        "A close-mic, intimate German male speaker in his early 30s. "
        "Natural vocal warmth, authentic conversational cadence, speaking directly to the viewer with intriguing, confident energy. "
        "Sounds like a world-class investigative creator at a desk sharing a breathtaking story. Deeply human, dynamic, and immersive."
    ),
    "geopolitik-bariton": (
        "A deep, charismatic, and mature German male narrator in his late 30s. "
        "Warm baritone chest resonance, calm and authoritative documentary tone. "
        "Suspenseful, captivating storytelling cadence with natural human pauses and rich vocal texture. "
        "Speaks flawless, fluent German like a top-tier geopolitical documentary narrator (Arte / ZDFinfo style)."
    ),
    "investigativ-intim": (
        "A charismatic, serious German male voice in his early 40s. "
        "Close-mic radio broadcast style, speaking directly and intimately to the listener with a calm, mysterious, and intense delivery. "
        "Low-pitched, warm, gravelly vocal undertones, speaking with sharp intellect and suspenseful storytelling rhythm, like an investigative journalist revealing state secrets."
    ),
    "doku-host": (
        "An engaging, articulate German male speaker in his early 30s. "
        "High clarity, energetic, confident and modern explanatory delivery. "
        "Clear articulation, fast-paced yet controlled, captivating and educational tone, perfect for high-retention YouTube explainer documentaries like MrWissen2go."
    ),
    "cinematic-thriller": (
        "A deep, raspy, and hypnotic German male storyteller with a commanding presence. "
        "Vocal fry, intense gravitas, steady and suspenseful cadence, like a cinematic trailer voice or a dark geopolitical thriller narrator. "
        "Flawless German diction, calm, unhurried, creating maximum tension and intrigue."
    ),
    "doku-korrespondentin": (
        "A sophisticated, calm, and authoritative German female narrator in her late 30s. "
        "Warm, rich contralto voice, serious, highly credible and engaging storytelling tone. "
        "Speaks with intellectual gravitas and composure, perfect for deep political analysis and global documentary features."
    ),
    "christian-brueckner": (
        "A legendary, deeply gravelly and raspy German male voice in his late 40s, reminiscent of Christian Brückner (the iconic German voice of Robert De Niro). "
        "Rich smoky baritone resonance, intense gravitas, calm, hypnotic, and utterly captivating delivery. "
        "Flawless German diction, speaking like an iconic movie narrator telling a historic geopolitical truth. "
        "Magnetic, smoky, and addictive to listen to."
    ),
    "david-nathan": (
        "An intense, dark, and highly captivating German male narrator in his late 30s, in the iconic style of David Nathan (German voice of Christian Bale and Stephen King audiobooks). "
        "Deep, slightly raspy vocal fry, dramatic tension, sharp intellect, dynamic cadence that hooks the listener instantly. "
        "Perfect for viral social media reels, true geopolitics, and dark political revelations."
    ),
    "dietmar-wunder": (
        "A cool, razor-sharp, and masculine German male voice in his early 40s, styled after Dietmar Wunder (the German voice of Daniel Craig / James Bond). "
        "Confident, modern, articulate, punchy and fast-paced delivery. "
        "Crisp articulation, dry wit, and unyielding authority. "
        "Hooks social media viewers within the first split second."
    ),
    "social-alpha-host": (
        "A dynamic, energetic, and highly articulate German male host in his early 30s. "
        "Fast-paced, punchy, high-retention YouTube Shorts and TikTok delivery. "
        "Crystal clear diction, engaging vocal modulation, passionate, urgent, and captivating explainer tone that makes you addicted to watching until the end."
    ),
    "manfred-lehmann": (
        "A powerful, gritty, and weathered German male voice with a rough, husky baritone, styled after Manfred Lehmann (German voice of Bruce Willis). "
        "Raw vocal texture, tough, commanding, cinematic trailer presence. "
        "Deep, full-bodied resonance, visceral and human, zero artificial smoothness."
    )
}

DEFAULT_REF_AUDIO = "/Users/arman/FinanzNeo-Claud/.claude/worktrees/adoring-neumann-051170/youtube/_kanal/stimme/referenz-alte-stimme.wav"
DEFAULT_REF_TEXT = (
    "Null Prozent Finanzierung. Kein Zins, kleine Monatsrate. Klingt wie geschenktes Geld. "
    "Manchmal stimmt das sogar. Aber manchmal unterschreibst du dabei einen zweiten Vertrag, den du gar nicht wolltest. "
    "In diesem Video zeige ich dir, woran du den Unterschied erkennst."
)

def kappe_sprechpausen(
    audio: np.ndarray,
    sr: int,
    max_pause_sec: float = 0.25,
    thr_db: float = -36.0,
    fade_ms: float = 8.0,
) -> np.ndarray:
    """Kürzt überlange Sprechpausen (> max_pause_sec) mit weichen Cosinus-Fades."""
    frame_len = int(sr * 0.02)
    n_frames = len(audio) // frame_len
    if n_frames == 0:
        return audio

    reshaped = audio[: n_frames * frame_len].reshape(n_frames, frame_len)
    rms = np.sqrt(np.mean(reshaped ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    is_voiced = db > thr_db

    fade_len = max(2, int(sr * (fade_ms / 1000.0)))
    t = np.linspace(0, np.pi, fade_len)
    fade_out = 0.5 * (1 + np.cos(t))
    fade_in = 1.0 - fade_out

    keep_chunks = []
    max_silent_frames = int(max_pause_sec / 0.02)

    i = 0
    while i < n_frames:
        if is_voiced[i]:
            keep_chunks.append(reshaped[i])
            i += 1
        else:
            start_sil = i
            while i < n_frames and not is_voiced[i]:
                i += 1
            sil_count = i - start_sil

            if sil_count <= max_silent_frames:
                for k in range(start_sil, i):
                    keep_chunks.append(reshaped[k])
            else:
                half = max_silent_frames // 2
                other_half = max_silent_frames - half

                head = [reshaped[start_sil + k] for k in range(half)]
                tail = [reshaped[i - other_half + k] for k in range(other_half)]

                sil_block = np.concatenate(head + tail) if (head or tail) else np.zeros(0, dtype=audio.dtype)
                if len(sil_block) >= 2 * fade_len:
                    sil_block[:fade_len] = sil_block[:fade_len] * fade_in
                    sil_block[-fade_len:] = sil_block[-fade_len:] * fade_out
                keep_chunks.append(sil_block)

    result = np.concatenate(keep_chunks)
    rem = audio[n_frames * frame_len:]
    if len(rem) > 0:
        result = np.concatenate([result, rem])
    return result


DEFAULT_EQ = (
    "highpass=f=70,"
    "equalizer=f=185:t=q:w=1.2:g=2.8,"
    "equalizer=f=7500:t=q:w=1.8:g=-2.5,"
    "acompressor=threshold=-18dB:ratio=3.0:attack=15:release=120:makeup=2dB"
)

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--list-personas":
        print(json.dumps(list(PERSONA_PROMPTS.keys()), indent=2))
        return

    # Read config from stdin or file argument
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = json.load(sys.stdin)

    chunks = data.get("chunks", [])
    persona_key = data.get("persona", "geopolitik-bariton")
    custom_instruct = data.get("instruct")
    output_dir = data.get("output_dir", "/tmp/qwen3_tts_chunks")
    eq_filter = data.get("eq_filter", DEFAULT_EQ)

    is_clone_mode = bool(data.get("ref_audio") or persona_key in ("alte-kanalstimme", "finanzneo-stimme", "google-ki-klon"))
    ref_audio = data.get("ref_audio") or (DEFAULT_REF_AUDIO if is_clone_mode else None)
    ref_text = data.get("ref_text") or (DEFAULT_REF_TEXT if is_clone_mode else None)
    temperature = float(data.get("temperature", 0.8))

    instruct = custom_instruct or PERSONA_PROMPTS.get(persona_key, PERSONA_PROMPTS["geopolitik-bariton"])

    os.makedirs(output_dir, exist_ok=True)

    if is_clone_mode:
        os.environ["HF_HOME"] = "/Users/arman/finanzneo-tts/hf"
        print(f"[Qwen3-TTS Bridge] Loading Base model for 1:1 voice cloning from {ref_audio}...", file=sys.stderr)
        from mlx_audio.tts.utils import load_model
        t0 = time.time()
        model = load_model("mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16")
        print(f"[Qwen3-TTS Bridge] Base model loaded in {time.time() - t0:.2f}s", file=sys.stderr)
    else:
        print(f"[Qwen3-TTS Bridge] Loading VoiceDesign model on Apple Silicon MLX...", file=sys.stderr)
        from mlx_audio.tts.utils import load_model
        t0 = time.time()
        model = load_model("mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-8bit")
        print(f"[Qwen3-TTS Bridge] VoiceDesign model loaded in {time.time() - t0:.2f}s", file=sys.stderr)

    results_summary = []

    for chunk in chunks:
        chunk_id = chunk["id"]
        text = chunk["text"]
        print(f"[Qwen3-TTS Bridge] Synthesizing chunk {chunk_id} ({len(text)} chars)...", file=sys.stderr)
        
        t_chunk = time.time()
        if is_clone_mode:
            gen_results = list(model.generate(
                text=text,
                ref_audio=ref_audio,
                ref_text=ref_text,
                language="german",
                temperature=temperature
            ))
        else:
            gen_results = list(model.generate_voice_design(
                text=text,
                instruct=instruct,
                language="german",
                verbose=False
            ))
        
        audio_arrays = [np.array(r.audio) for r in gen_results]
        full_audio = np.concatenate(audio_arrays)
        
        # Kürze überlange Pausen automatisch auf das Zielmaß
        max_pause = float(data.get("max_pause", 0.25))
        full_audio = kappe_sprechpausen(full_audio, model.sample_rate, max_pause_sec=max_pause)
        
        raw_wav = os.path.join(output_dir, f"chunk_{chunk_id:04d}_raw.wav")
        final_wav = os.path.join(output_dir, f"chunk_{chunk_id:04d}.wav")
        sf.write(raw_wav, full_audio, model.sample_rate)

        # Convert to 48kHz broadcast WAV with mastering EQ & tempo
        atempo = float(data.get("atempo", 1.05))
        filter_chain = f"atempo={atempo}," + eq_filter
        cmd = [
            "ffmpeg", "-y", "-v", "error",
            "-i", raw_wav,
            "-af", filter_chain,
            "-ar", "48000",
            "-ac", "1",
            final_wav
        ]
        subprocess.run(cmd, check=True)
        if os.path.exists(raw_wav):
            os.remove(raw_wav)

        duration = (len(full_audio) / model.sample_rate) / atempo
        print(f"[Qwen3-TTS Bridge] Chunk {chunk_id} generated in {time.time() - t_chunk:.2f}s ({duration:.2f}s audio)", file=sys.stderr)
        
        results_summary.append({
            "id": chunk_id,
            "file": final_wav,
            "text": text,
            "duration": duration,
            "success": True
        })

    summary = {
        "engine": "qwen3-voice-design",
        "persona": persona_key,
        "total_chunks": len(chunks),
        "successful_chunks": len(results_summary),
        "results": results_summary
    }
    print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    main()
