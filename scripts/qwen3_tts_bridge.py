#!/usr/bin/env python3
"""
Qwen3-TTS Base Voice Cloning Bridge for erklaer-reels / Weltlogik.
Runs locally on Apple Silicon (M-Series Mac) using MLX Metal GPU.
Uses the calibrated Master Creator Voice Reference (stickman-user-clone) at 0.95x tempo
with 0.30s post-stretch max pauses (0.285s pre-stretch) and max 32 words per chunk.
"""

import json
import os
import subprocess
import sys
import time
from pathlib import Path
import numpy as np
import soundfile as sf

REPO_ROOT = Path(__file__).resolve().parent.parent
LOCAL_REF_AUDIO = REPO_ROOT / "channel" / "audio" / "reference" / "user_voice_reference.wav"
CENTRAL_REF_AUDIO = Path("/Users/arman/finanzneo-tts/reference/user_voice_reference.wav")

DEFAULT_REF_AUDIO = str(LOCAL_REF_AUDIO if LOCAL_REF_AUDIO.exists() else CENTRAL_REF_AUDIO)
DEFAULT_REF_TEXT = (
    "Willkommen bei Alles Stickman. Wir erzählen die krassesten und faszinierendsten "
    "Geschichten der Menschheit. Unzensiert, direkt und auf den Punkt. Was passiert, "
    "wenn alles schief geht und du nur eine einzige Chance hast zu überleben? Genau das "
    "finden wir heute heraus. Lehn dich zurück und bleib bis zum Ende dran."
)

BASE_MODEL_ID = "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16"
DEFAULT_SEED = 7707
DEFAULT_TEMPERATURE = 0.7
DEFAULT_ATEMPO = 0.95
DEFAULT_PRE_STRETCH_MAX_PAUSE = 0.285

DEFAULT_EQ = (
    "highpass=f=75,"
    "deesser=i=0.45:m=0.55:f=0.5:s=o,"
    "equalizer=f=6600:t=q:w=2.0:g=-3.5,"
    "equalizer=f=180:t=q:w=1.2:g=2.2,"
    "equalizer=f=3200:t=q:w=1.2:g=2.0,"
    "equalizer=f=11500:t=q:w=1.0:g=-2.5,"
    "asoftclip=type=tanh:threshold=0.88:output=0.98,"
    "aecho=in_gain=0.88:out_gain=0.95:delays=18|28:decays=0.04|0.02,"
    "compand=attacks=0.02:decays=0.15:points=-60/-60|-24/-18|-12/-10|0/-3:gain=1,"
    "alimiter=limit=0.92:level=false"
)


def kappe_sprechpausen(
    audio: np.ndarray,
    sr: int,
    max_pause_sec: float = DEFAULT_PRE_STRETCH_MAX_PAUSE,
    thr_db: float = -38.0,
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

                sil_block = (
                    np.concatenate(head + tail)
                    if (head or tail)
                    else np.zeros(0, dtype=audio.dtype)
                )
                if len(sil_block) >= 2 * fade_len:
                    sil_block[:fade_len] = sil_block[:fade_len] * fade_in
                    sil_block[-fade_len:] = sil_block[-fade_len:] * fade_out
                keep_chunks.append(sil_block)

    result = np.concatenate(keep_chunks)
    rem = audio[n_frames * frame_len :]
    if len(rem) > 0:
        result = np.concatenate([result, rem])
    return result


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--list-personas":
        print(json.dumps(["stickman-user-clone"], indent=2))
        return

    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = json.load(sys.stdin)

    chunks = data.get("chunks", [])
    voice_id = data.get("voice") or data.get("persona") or "stickman-user-clone"
    output_dir = data.get("output_dir", "/tmp/qwen3_tts_chunks")
    eq_filter = data.get("eq_filter", DEFAULT_EQ)
    ref_audio = data.get("ref_audio") or DEFAULT_REF_AUDIO
    ref_text = data.get("ref_text") or DEFAULT_REF_TEXT
    temperature = float(data.get("temperature", DEFAULT_TEMPERATURE))
    seed = int(data.get("seed", DEFAULT_SEED))
    atempo = float(data.get("atempo", DEFAULT_ATEMPO))
    max_pause = float(data.get("max_pause", DEFAULT_PRE_STRETCH_MAX_PAUSE))

    os.makedirs(output_dir, exist_ok=True)
    os.environ["HF_HOME"] = "/Users/arman/finanzneo-tts/hf"

    import mlx.core as mx
    from mlx_audio.tts.utils import load_model

    print(
        f"[Qwen3-TTS Bridge] Loading Base model ({BASE_MODEL_ID}) for voice clone {voice_id} from {ref_audio}...",
        file=sys.stderr,
    )
    t0 = time.time()
    model = load_model(BASE_MODEL_ID)
    mx.random.seed(seed)
    print(f"[Qwen3-TTS Bridge] Base model loaded in {time.time() - t0:.2f}s", file=sys.stderr)

    results_summary = []

    for chunk in chunks:
        chunk_id = chunk["id"]
        text = chunk["text"]
        print(
            f"[Qwen3-TTS Bridge] Synthesizing chunk {chunk_id} ({len(text)} chars)...",
            file=sys.stderr,
        )

        t_chunk = time.time()
        gen_results = list(
            model.generate(
                text=text,
                ref_audio=ref_audio,
                ref_text=ref_text,
                language="german",
                temperature=temperature,
            )
        )

        audio_arrays = [np.array(r.audio) for r in gen_results]
        full_audio = np.concatenate(audio_arrays)
        full_audio = kappe_sprechpausen(full_audio, model.sample_rate, max_pause_sec=max_pause)
        mx.clear_cache()

        raw_wav = os.path.join(output_dir, f"chunk_{chunk_id:04d}_raw.wav")
        final_wav = os.path.join(output_dir, f"chunk_{chunk_id:04d}.wav")
        sf.write(raw_wav, full_audio, model.sample_rate)

        filter_chain = f"atempo={atempo}," + eq_filter if eq_filter else f"atempo={atempo}"
        cmd = [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-i",
            raw_wav,
            "-af",
            filter_chain,
            "-ar",
            "48000",
            "-ac",
            "1",
            "-c:a",
            "pcm_s16le",
            final_wav,
        ]
        subprocess.run(cmd, check=True)
        if os.path.exists(raw_wav):
            os.remove(raw_wav)

        duration = (len(full_audio) / model.sample_rate) / atempo
        print(
            f"[Qwen3-TTS Bridge] Chunk {chunk_id} generated in {time.time() - t_chunk:.2f}s ({duration:.2f}s audio)",
            file=sys.stderr,
        )

        results_summary.append(
            {
                "id": chunk_id,
                "file": final_wav,
                "text": text,
                "duration": duration,
                "success": True,
            }
        )

    summary = {
        "engine": "qwen-mlx",
        "voice": voice_id,
        "tempo": atempo,
        "max_pause": max_pause,
        "temperature": temperature,
        "total_chunks": len(chunks),
        "successful_chunks": len(results_summary),
        "results": results_summary,
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
