from pathlib import Path
from PIL import Image

SOURCE = Path("PERSONAGEM")
TARGET = Path(
    "apps/client/public/assets/personagem/runtime"
)

TARGET.mkdir(
    parents=True,
    exist_ok=True,
)

FILES = (
    "FRONT.jpg",
    "BACK.jpg",
    "PROFILE.jpg",
)

for filename in FILES:
    source = SOURCE / filename

    image = Image.open(source).convert("RGBA")

    pixels = image.load()

    if pixels is None:
        raise RuntimeError(
            f"Não foi possível acessar pixels de {source}"
        )

    width, height = image.size

    for y in range(height):
        for x in range(width):
            r, g, b, _ = pixels[x, y]

            dominance = g - max(r, b)

            if g >= 110 and dominance >= 55:
                alpha = 0
            elif g >= 90 and dominance >= 25:
                factor = (55 - dominance) / 30
                factor = max(0.0, min(1.0, factor))
                alpha = round(255 * factor)
            else:
                alpha = 255

            # RGB original é preservado.
            # Apenas o canal alpha é alterado.
            pixels[x, y] = (
                r,
                g,
                b,
                alpha,
            )

    alpha_channel = image.getchannel("A")
    bbox = alpha_channel.getbbox()

    if bbox is None:
        raise RuntimeError(
            f"Chroma removeu toda a imagem: {source}"
        )

    left, top, right, bottom = bbox

    padding = 12

    left = max(
        0,
        left - padding,
    )

    top = max(
        0,
        top - padding,
    )

    right = min(
        width,
        right + padding,
    )

    bottom = min(
        height,
        bottom + padding,
    )

    runtime = image.crop(
        (
            left,
            top,
            right,
            bottom,
        )
    )

    output = TARGET / (
        Path(filename).stem + ".png"
    )

    runtime.save(
        output,
        format="PNG",
        optimize=True,
    )

    print(
        f"{filename}: "
        f"{width}x{height} -> "
        f"{runtime.width}x{runtime.height} "
        f"=> {output}"
    )
