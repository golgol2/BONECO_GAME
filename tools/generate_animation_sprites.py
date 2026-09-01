from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from PIL import Image

ROOT = Path.cwd().resolve()

CONFIG_DIR = (
    ROOT
    / "content"
    / "animations"
)

VIDEO_DIR = (
    ROOT
    / "VIDEOS"
)

OUTPUT_ROOT = (
    ROOT
    / "apps"
    / "client"
    / "public"
    / "assets"
    / "animations"
)

MAX_SIDE = 512
PADDING = 8

LOOP_STATES = {
    "idle",
    "walk",
    "run",
}

SEGMENTED_STATES = {
    "jump",
}


def fail(message: str) -> None:
    raise RuntimeError(message)


def load_json(path: Path) -> dict[str, Any]:
    with path.open(
        "r",
        encoding="utf-8",
    ) as file:
        value = json.load(file)

    if not isinstance(
        value,
        dict,
    ):
        fail(
            f"JSON inválido: {path}"
        )

    return value


def require_int(
    value: Any,
    name: str,
) -> int:
    if (
        isinstance(value, bool)
        or not isinstance(
            value,
            int,
        )
    ):
        fail(
            f"{name} precisa ser inteiro"
        )

    return value


def clamp01(
    value: float,
) -> float:
    return max(
        0.0,
        min(
            1.0,
            value,
        ),
    )


def build_ffmpeg_filter(
    start_frame: int,
    end_frame: int,
    chroma: dict[str, Any],
) -> str:
    """
    FFmpeg NÃO aplica chroma.

    Ele apenas:
    - seleciona os frames;
    - normaliza a resolução;
    - entrega RGB/RGBA ao Pillow.

    O chroma é aplicado depois usando
    exatamente a mesma matemática do editor.
    """
    del chroma

    filters = [
        (
            "select="
            f"'between(n,{start_frame},{end_frame})'"
        ),
        (
            "scale="
            f"{MAX_SIDE}:"
            f"{MAX_SIDE}:"
            "force_original_aspect_ratio=decrease"
        ),
        "format=rgba",
    ]

    return ",".join(filters)


def chroma_alpha(
    r: int,
    g: int,
    b: int,
    chroma: dict[str, Any],
) -> int:
    if not bool(
        chroma.get(
            "enabled",
            True,
        )
    ):
        return 255

    key_r = require_int(
        chroma.get("keyR"),
        "chroma.keyR",
    )

    key_g = require_int(
        chroma.get("keyG"),
        "chroma.keyG",
    )

    key_b = require_int(
        chroma.get("keyB"),
        "chroma.keyB",
    )

    tolerance = max(
        0.0,
        float(
            chroma.get(
                "tolerance",
                0,
            )
        ),
    )

    feather = max(
        0.0,
        float(
            chroma.get(
                "feather",
                0,
            )
        ),
    )

    dr = r - key_r
    dg = g - key_g
    db = b - key_b

    distance = math.sqrt(
        dr * dr
        + dg * dg
        + db * db
    )

    if distance <= tolerance:
        return 0

    if (
        feather <= 0
        or distance
        >= tolerance + feather
    ):
        return 255

    ratio = (
        distance - tolerance
    ) / feather

    return max(
        0,
        min(
            255,
            round(
                ratio * 255
            ),
        ),
    )


def apply_editor_chroma(
    frame_path: Path,
    chroma: dict[str, Any],
) -> None:
    """
    Replica chromaAlpha() de
    apps/client/src/editor/chroma-key.ts.

    RGB original é preservado.
    Apenas alpha é recalculado.
    """
    with Image.open(
        frame_path
    ) as source:
        rgba = source.convert(
            "RGBA"
        )

        pixels = list(
            rgba.getdata()
        )

        output = []

        for r, g, b, _ in pixels:
            output.append(
                (
                    r,
                    g,
                    b,
                    chroma_alpha(
                        r,
                        g,
                        b,
                        chroma,
                    ),
                )
            )

        rgba.putdata(
            output
        )

        rgba.save(
            frame_path,
            format="PNG",
            optimize=False,
            compress_level=3,
        )



def extract_frames(
    video_path: Path,
    temporary_dir: Path,
    start_frame: int,
    end_frame: int,
    chroma: dict[str, Any],
) -> list[Path]:
    filter_graph = (
        build_ffmpeg_filter(
            start_frame,
            end_frame,
            chroma,
        )
    )

    output_pattern = (
        temporary_dir
        / "frame_%04d.png"
    )

    command = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(video_path),
        "-vf",
        filter_graph,
        "-fps_mode",
        "vfr",
        str(output_pattern),
    ]

    subprocess.run(
        command,
        check=True,
    )

    frames = sorted(
        temporary_dir.glob(
            "frame_*.png"
        )
    )

    for frame_path in frames:
        apply_editor_chroma(
            frame_path,
            chroma,
        )

    expected = (
        end_frame
        - start_frame
        + 1
    )

    if len(frames) != expected:
        fail(
            (
                f"{video_path.name}: "
                f"esperados {expected} frames, "
                f"extraídos {len(frames)}"
            )
        )

    return frames


def compute_union_bbox(
    frames: list[Path],
) -> tuple[
    int,
    int,
    int,
    int,
]:
    union: tuple[
        int,
        int,
        int,
        int,
    ] | None = None

    image_width = 0
    image_height = 0

    for frame_path in frames:
        with Image.open(
            frame_path
        ) as image:
            rgba = image.convert(
                "RGBA"
            )

            image_width, image_height = (
                rgba.size
            )

            alpha = rgba.getchannel(
                "A"
            )

            thresholded = alpha.point(
                lambda value:
                    255
                    if value >= 8
                    else 0
            )

            bbox = (
                thresholded.getbbox()
            )

            if bbox is None:
                continue

            if union is None:
                union = bbox
            else:
                union = (
                    min(
                        union[0],
                        bbox[0],
                    ),
                    min(
                        union[1],
                        bbox[1],
                    ),
                    max(
                        union[2],
                        bbox[2],
                    ),
                    max(
                        union[3],
                        bbox[3],
                    ),
                )

    if union is None:
        fail(
            "chroma removeu todos os frames"
        )

    left = max(
        0,
        union[0] - PADDING,
    )

    top = max(
        0,
        union[1] - PADDING,
    )

    right = min(
        image_width,
        union[2] + PADDING,
    )

    bottom = min(
        image_height,
        union[3] + PADDING,
    )

    if (
        right <= left
        or bottom <= top
    ):
        fail(
            "bbox final inválido"
        )

    return (
        left,
        top,
        right,
        bottom,
    )


def write_runtime_frames(
    source_id: str,
    frames: list[Path],
    bbox: tuple[
        int,
        int,
        int,
        int,
    ],
) -> tuple[
    Path,
    int,
    int,
]:
    output_dir = (
        OUTPUT_ROOT
        / source_id
    )

    if (
        output_dir.parent.resolve()
        != OUTPUT_ROOT.resolve()
    ):
        fail(
            "diretório de saída inválido"
        )

    if output_dir.exists():
        shutil.rmtree(
            output_dir
        )

    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    width = (
        bbox[2] - bbox[0]
    )

    height = (
        bbox[3] - bbox[1]
    )

    for index, frame_path in enumerate(
        frames
    ):
        with Image.open(
            frame_path
        ) as image:
            runtime = (
                image
                .convert("RGBA")
                .crop(bbox)
            )

            output = (
                output_dir
                / f"frame_{index:03d}.png"
            )

            runtime.save(
                output,
                format="PNG",
                optimize=False,
                compress_level=6,
            )

    return (
        output_dir,
        width,
        height,
    )


def process_project(
    config_path: Path,
) -> dict[str, Any] | None:
    config = load_json(
        config_path
    )

    source_id = str(
        config.get(
            "sourceId",
            "",
        )
    )

    source_file = str(
        config.get(
            "sourceFile",
            "",
        )
    )

    state = str(
        config.get(
            "state",
            "",
        )
    )

    direction = str(
        config.get(
            "direction",
            "",
        )
    )

    mirror_x = bool(
        config.get(
            "mirrorX",
            False,
        )
    )

    playback_rate = float(
        config.get(
            "playbackRate",
            1.0,
        )
    )

    first_frame_hold_ms = float(
        config.get(
            "firstFrameHoldMs",
            0.0,
        )
    )

    if (
        not math.isfinite(
            first_frame_hold_ms
        )
        or first_frame_hold_ms < 0
        or first_frame_hold_ms > 60000
    ):
        fail(
            (
                f"{source_id}: "
                "firstFrameHoldMs deve estar "
                "entre 0 e 60000"
            )
        )

    if (
        not math.isfinite(
            playback_rate
        )
        or playback_rate < 0.25
        or playback_rate > 3.0
    ):
        fail(
            (
                f"{source_id}: "
                "playbackRate deve estar "
                "entre 0.25 e 3.0"
            )
        )

    if (
        not source_id
        or not source_file
    ):
        fail(
            (
                f"{config_path}: "
                "sourceId/sourceFile ausentes"
            )
        )

    if (
        not source_id.replace(
            "_",
            "",
        ).replace(
            "-",
            "",
        ).isalnum()
    ):
        fail(
            f"sourceId inseguro: {source_id}"
        )

    if (
        state not in LOOP_STATES
        and state not in SEGMENTED_STATES
    ):
        print(
            (
                f"SKIP {source_id}: "
                f"estado '{state}' ainda não "
                "possui exportador runtime"
            )
        )

        return None

    markers = config.get(
        "markers"
    )

    if not isinstance(
        markers,
        dict,
    ):
        fail(
            f"{source_id}: markers ausente"
        )

    start_frame = require_int(
        markers.get(
            "loopStart"
        ),
        f"{source_id}.loopStart",
    )

    end_frame = require_int(
        markers.get(
            "loopEnd"
        ),
        f"{source_id}.loopEnd",
    )

    if (
        start_frame < 0
        or end_frame < start_frame
    ):
        fail(
            (
                f"{source_id}: "
                "intervalo inválido"
            )
        )

    segmented_source = None

    if state in SEGMENTED_STATES:
        hold_start = require_int(
            markers.get(
                "holdStart"
            ),
            f"{source_id}.holdStart",
        )

        hold_end = require_int(
            markers.get(
                "holdEnd"
            ),
            f"{source_id}.holdEnd",
        )

        if (
            hold_start < start_frame
            or hold_end < hold_start
            or hold_end > end_frame
        ):
            fail(
                (
                    f"{source_id}: "
                    "segmentos hold inválidos"
                )
            )

        segmented_source = {
            "intro": {
                "start":
                    start_frame,
                "end":
                    max(
                        start_frame,
                        hold_start - 1,
                    ),
            },
            "hold": {
                "start":
                    hold_start,
                "end":
                    hold_end,
            },
            "outro": {
                "start":
                    min(
                        end_frame,
                        hold_end + 1,
                    ),
                "end":
                    end_frame,
            },
        }

    chroma = config.get(
        "chroma"
    )

    if not isinstance(
        chroma,
        dict,
    ):
        fail(
            f"{source_id}: chroma ausente"
        )

    video_path = (
        VIDEO_DIR
        / source_file
    )

    if not video_path.exists():
        fail(
            (
                f"{source_id}: vídeo não encontrado: "
                f"{video_path}"
            )
        )

    print()
    print(
        (
            f"GERANDO {source_id}: "
            f"{start_frame}..{end_frame}"
        )
    )

    with tempfile.TemporaryDirectory(
        prefix=f"boneco_{source_id}_"
    ) as temporary:
        temporary_dir = Path(
            temporary
        )

        frames = extract_frames(
            video_path,
            temporary_dir,
            start_frame,
            end_frame,
            chroma,
        )

        bbox = compute_union_bbox(
            frames
        )

        (
            output_dir,
            width,
            height,
        ) = write_runtime_frames(
            source_id,
            frames,
            bbox,
        )

    fps = 24.0

    duration_ms = (
        1000.0 /
        (
            fps *
            playback_rate
        )
    )

    runtime_frames = []

    for index in range(
        end_frame
        - start_frame
        + 1
    ):
        runtime_frames.append(
            {
                "file":
                    f"frame_{index:03d}.png",
                "sourceFrame":
                    start_frame
                    + index,
                "durationMs":
                    duration_ms,
            }
        )

    manifest = {
        "schemaVersion": 1,
        "id": source_id,
        "state": state,
        "direction": direction,
        "mirrorX": mirror_x,
        "loop":
            state in LOOP_STATES,
        "fps": fps,
        "playbackRate":
            playback_rate,
        "firstFrameHoldMs":
            first_frame_hold_ms,
        "source": {
            "file":
                source_file,
            "startFrame":
                start_frame,
            "endFrame":
                end_frame,
        },
        "frameSize": {
            "width": width,
            "height": height,
        },
        "anchor": {
            "x": 0.5,
            "y": 1.0,
        },
        "frames":
            runtime_frames,
    }

    if segmented_source:
        manifest["segments"] = {
            name: {
                "start":
                    segment["start"]
                    - start_frame,
                "end":
                    segment["end"]
                    - start_frame,
            }
            for name, segment
            in segmented_source.items()
        }

    manifest_path = (
        output_dir
        / "manifest.json"
    )

    manifest_path.write_text(
        json.dumps(
            manifest,
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )

    print(
        (
            f"  {len(runtime_frames)} frames"
            f" | {width}x{height}"
            f" | {manifest_path}"
        )
    )

    return {
        "id":
            source_id,
        "state":
            state,
        "direction":
            direction,
        "mirrorX":
            mirror_x,
        "manifest":
            (
                f"/assets/animations/"
                f"{source_id}/manifest.json"
            ),
    }


def build_catalog(
    configs: list[Path],
) -> list[dict[str, Any]]:
    catalog: list[
        dict[str, Any]
    ] = []

    for config_path in configs:
        config = load_json(
            config_path
        )

        source_id = str(
            config.get(
                "sourceId",
                "",
            )
        )

        manifest_path = (
            OUTPUT_ROOT
            / source_id
            / "manifest.json"
        )

        if not manifest_path.exists():
            continue

        manifest = load_json(
            manifest_path
        )

        catalog.append({
            "id":
                str(
                    manifest.get(
                        "id",
                        source_id,
                    )
                ),
            "state":
                str(
                    manifest.get(
                        "state",
                        "",
                    )
                ),
            "direction":
                str(
                    manifest.get(
                        "direction",
                        "",
                    )
                ),
            "mirrorX":
                bool(
                    manifest.get(
                        "mirrorX",
                        False,
                    )
                ),
            "manifest":
                (
                    f"/assets/animations/"
                    f"{source_id}/manifest.json"
                ),
        })

    return catalog


def write_catalog(
    configs: list[Path],
) -> None:
    catalog = build_catalog(
        configs
    )

    catalog_path = (
        OUTPUT_ROOT
        / "catalog.json"
    )

    catalog_path.write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "clips": catalog,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )

    print()
    print(
        (
            "CATÁLOGO: "
            f"{len(catalog)} clips"
            f" -> {catalog_path}"
        )
    )

    if not catalog:
        fail(
            "nenhum clip runtime disponível"
        )


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Gera sprites runtime do "
            "Boneco do Abismo"
        )
    )

    parser.add_argument(
        "--source-id",
        dest="source_id",
        default=None,
        help=(
            "Processa somente uma "
            "animação específica"
        ),
    )

    args = parser.parse_args()

    if not CONFIG_DIR.exists():
        fail(
            (
                "content/animations "
                "não existe"
            )
        )

    OUTPUT_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    configs = sorted(
        CONFIG_DIR.glob(
            "*.animation.json"
        )
    )

    if not configs:
        fail(
            "nenhuma configuração salva"
        )

    if args.source_id:
        if (
            not args.source_id
            .replace("_", "")
            .replace("-", "")
            .isalnum()
        ):
            fail(
                "source-id inválido"
            )

        selected = (
            CONFIG_DIR
            / (
                f"{args.source_id}"
                ".animation.json"
            )
        )

        if not selected.exists():
            fail(
                (
                    "configuração não encontrada: "
                    f"{selected}"
                )
            )

        generated = process_project(
            selected
        )

        if not generated:
            fail(
                (
                    f"{args.source_id}: "
                    "não possui exportador runtime"
                )
            )
    else:
        for config_path in configs:
            process_project(
                config_path
            )

    write_catalog(
        configs
    )


if __name__ == "__main__":
    main()
