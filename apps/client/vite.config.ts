import {
  defineConfig,
  type Plugin,
} from "vite";

import {
  copyFile,
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";

import {
  dirname,
  resolve,
} from "node:path";

import {
  execFile,
} from "node:child_process";

import {
  promisify,
} from "node:util";

import {
  fileURLToPath,
} from "node:url";

const execFileAsync =
  promisify(
    execFile,
  );

const configDir =
  dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );

const projectRoot =
  resolve(
    configDir,
    "../..",
  );

const animationDir =
  resolve(
    projectRoot,
    "content/animations",
  );

const sourceVideoDir =
  resolve(
    projectRoot,
    "VIDEOS",
  );

const editorVideoDir =
  resolve(
    projectRoot,
    "apps/client/public/assets/editor/videos",
  );

const historyVideoDir =
  resolve(
    projectRoot,
    "content/video-history",
  );

const generatorPath =
  resolve(
    projectRoot,
    "tools/generate_animation_sprites.py",
  );

const MAX_PROJECT_BYTES =
  1024 * 1024;

const MAX_VIDEO_BYTES =
  150 * 1024 * 1024;

interface VideoDefinition {
  fileName: string;
  width: number;
  height: number;
  fps: number;
  frameCount: number;
}

const VIDEO_DEFINITIONS:
  Record<
    string,
    VideoDefinition
  > = {
    idle_down: {
      fileName:
        "PARADO_DE_FRENTE.mp4",
      width: 944,
      height: 944,
      fps: 24,
      frameCount: 145,
    },

    crouch: {
      fileName:
        "ABAIXANDO_EFICANDOABAIXADO_.mp4",
      width: 1088,
      height: 1088,
      fps: 24,
      frameCount: 145,
    },

    walk_up: {
      fileName:
        "ANDADO_DECOSTA.mp4",
      width: 1088,
      height: 1088,
      fps: 24,
      frameCount: 145,
    },

    walk_down: {
      fileName:
        "ANDADO_DE_FRENTE.mp4",
      width: 1088,
      height: 1088,
      fps: 24,
      frameCount: 145,
    },

    walk_right: {
      fileName:
        "ANDANDO_PARA_DIREITA.mp4",
      width: 1088,
      height: 1088,
      fps: 24,
      frameCount: 145,
    },

    run_up: {
      fileName:
        "CORRENDO_DE_COSTA.mp4",
      width: 1088,
      height: 1088,
      fps: 24,
      frameCount: 145,
    },

    run_down: {
      fileName:
        "CORRENDO_DE_FRENTE.mp4",
      width: 944,
      height: 944,
      fps: 24,
      frameCount: 145,
    },

    run_right: {
      fileName:
        "CORRENDO_PARA_DIREITA.mp4",
      width: 944,
      height: 944,
      fps: 24,
      frameCount: 145,
    },

    jump: {
      fileName:
        "PULANDO.mp4",
      width: 1088,
      height: 1088,
      fps: 24,
      frameCount: 145,
    },
  };

function jsonResponse(
  response:
    import("node:http").ServerResponse,
  status: number,
  value: unknown,
): void {
  response.statusCode =
    status;

  response.setHeader(
    "Content-Type",
    "application/json; charset=utf-8",
  );

  response.end(
    JSON.stringify(
      value,
    ),
  );
}

function safeSourceId(
  sourceId: string,
): boolean {
  return (
    /^[a-z0-9_-]+$/i.test(
      sourceId,
    ) &&
    Boolean(
      VIDEO_DEFINITIONS[
        sourceId
      ],
    )
  );
}

async function readBody(
  request:
    import("node:http").IncomingMessage,
  maxBytes: number,
): Promise<Buffer> {
  const chunks:
    Buffer[] = [];

  let total =
    0;

  for await (
    const chunk
    of request
  ) {
    const buffer =
      Buffer.isBuffer(
        chunk,
      )
        ? chunk
        : Buffer.from(
            chunk,
          );

    total +=
      buffer.length;

    if (
      total >
      maxBytes
    ) {
      throw new Error(
        "PAYLOAD_TOO_LARGE",
      );
    }

    chunks.push(
      buffer,
    );
  }

  return Buffer.concat(
    chunks,
  );
}

function parseFps(
  value: string,
): number {
  const [
    numerator,
    denominator,
  ] = value.split(
    "/",
  );

  const top =
    Number(
      numerator,
    );

  const bottom =
    Number(
      denominator ??
      "1",
    );

  if (
    !Number.isFinite(top) ||
    !Number.isFinite(bottom) ||
    bottom === 0
  ) {
    return 0;
  }

  return top / bottom;
}

async function inspectVideo(
  filePath: string,
): Promise<{
  width: number;
  height: number;
  fps: number;
  frameCount: number;
}> {
  const {
    stdout,
  } = await execFileAsync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      (
        "stream="
        + "width,height,"
        + "avg_frame_rate,"
        + "nb_frames"
      ),
      "-of",
      "json",
      filePath,
    ],
    {
      cwd:
        projectRoot,
    },
  );

  const parsed =
    JSON.parse(
      stdout,
    ) as {
      streams?: Array<{
        width?: number;
        height?: number;
        avg_frame_rate?: string;
        nb_frames?: string;
      }>;
    };

  const stream =
    parsed.streams?.[0];

  if (!stream) {
    throw new Error(
      "vídeo sem stream visual"
    );
  }

  return {
    width:
      Number(
        stream.width ??
        0,
      ),

    height:
      Number(
        stream.height ??
        0,
      ),

    fps:
      parseFps(
        stream.avg_frame_rate ??
        "0/1",
      ),

    frameCount:
      Number(
        stream.nb_frames ??
        0,
      ),
  };
}

function animationProjectApi():
  Plugin {
  return {
    name:
      "boneco-animation-editor-api",

    configureServer(server) {
      server.middlewares.use(
        async (
          request,
          response,
          next,
        ) => {
          const url =
            new URL(
              request.url ?? "/",
              "http://127.0.0.1",
            );

          const projectPrefix =
            "/__editor/animations/";

          const processPrefix =
            "/__editor/process/";

          const videoPrefix =
            "/__editor/videos/";

          try {
            if (
              url.pathname.startsWith(
                projectPrefix,
              )
            ) {
              const sourceId =
                decodeURIComponent(
                  url.pathname.slice(
                    projectPrefix.length,
                  ),
                );

              if (
                !safeSourceId(
                  sourceId,
                )
              ) {
                jsonResponse(
                  response,
                  400,
                  {
                    error:
                      "sourceId inválido",
                  },
                );

                return;
              }

              const filePath =
                resolve(
                  animationDir,
                  (
                    `${sourceId}`
                    + ".animation.json"
                  ),
                );

              if (
                request.method ===
                "GET"
              ) {
                try {
                  const contents =
                    await readFile(
                      filePath,
                      "utf8",
                    );

                  response.statusCode =
                    200;

                  response.setHeader(
                    "Content-Type",
                    "application/json; charset=utf-8",
                  );

                  response.end(
                    contents,
                  );
                } catch (
                  error
                ) {
                  if (
                    (
                      error as
                        NodeJS.ErrnoException
                    ).code ===
                    "ENOENT"
                  ) {
                    jsonResponse(
                      response,
                      404,
                      {
                        error:
                          "configuração ainda não salva",
                      },
                    );

                    return;
                  }

                  throw error;
                }

                return;
              }

              if (
                request.method ===
                "PUT"
              ) {
                const body =
                  await readBody(
                    request,
                    MAX_PROJECT_BYTES,
                  );

                const text =
                  body.toString(
                    "utf8",
                  );

                const parsed:
                  unknown =
                    JSON.parse(
                      text,
                    );

                if (
                  typeof parsed !==
                    "object" ||
                  parsed === null
                ) {
                  throw new Error(
                    "JSON precisa ser um objeto",
                  );
                }

                await mkdir(
                  animationDir,
                  {
                    recursive:
                      true,
                  },
                );

                const temporary =
                  `${filePath}.tmp`;

                await writeFile(
                  temporary,
                  text.endsWith(
                    "\n",
                  )
                    ? text
                    : `${text}\n`,
                  "utf8",
                );

                await rename(
                  temporary,
                  filePath,
                );

                jsonResponse(
                  response,
                  200,
                  {
                    ok: true,
                    relativePath:
                      (
                        "content/animations/"
                        + `${sourceId}`
                        + ".animation.json"
                      ),
                  },
                );

                return;
              }

              response.setHeader(
                "Allow",
                "GET, PUT",
              );

              jsonResponse(
                response,
                405,
                {
                  error:
                    "método não permitido",
                },
              );

              return;
            }

            if (
              url.pathname.startsWith(
                processPrefix,
              )
            ) {
              if (
                request.method !==
                "POST"
              ) {
                response.setHeader(
                  "Allow",
                  "POST",
                );

                jsonResponse(
                  response,
                  405,
                  {
                    error:
                      "método não permitido",
                  },
                );

                return;
              }

              const sourceId =
                decodeURIComponent(
                  url.pathname.slice(
                    processPrefix.length,
                  ),
                );

              if (
                !safeSourceId(
                  sourceId,
                )
              ) {
                jsonResponse(
                  response,
                  400,
                  {
                    error:
                      "sourceId inválido",
                  },
                );

                return;
              }

              const configPath =
                resolve(
                  animationDir,
                  (
                    `${sourceId}`
                    + ".animation.json"
                  ),
                );

              try {
                await readFile(
                  configPath,
                  "utf8",
                );
              } catch (
                error
              ) {
                if (
                  (
                    error as
                      NodeJS.ErrnoException
                  ).code ===
                  "ENOENT"
                ) {
                  jsonResponse(
                    response,
                    409,
                    {
                      error:
                        "salve a configuração antes de processar",
                    },
                  );

                  return;
                }

                throw error;
              }

              const {
                stdout,
                stderr,
              } = await execFileAsync(
                "python3",
                [
                  generatorPath,
                  "--source-id",
                  sourceId,
                ],
                {
                  cwd:
                    projectRoot,

                  maxBuffer:
                    8 * 1024 * 1024,
                },
              );

              jsonResponse(
                response,
                200,
                {
                  ok: true,
                  sourceId,
                  stdout,
                  stderr,
                },
              );

              return;
            }

            if (
              url.pathname.startsWith(
                videoPrefix,
              )
            ) {
              if (
                request.method !==
                "PUT"
              ) {
                response.setHeader(
                  "Allow",
                  "PUT",
                );

                jsonResponse(
                  response,
                  405,
                  {
                    error:
                      "método não permitido",
                  },
                );

                return;
              }

              const sourceId =
                decodeURIComponent(
                  url.pathname.slice(
                    videoPrefix.length,
                  ),
                );

              if (
                !safeSourceId(
                  sourceId,
                )
              ) {
                jsonResponse(
                  response,
                  400,
                  {
                    error:
                      "sourceId inválido",
                  },
                );

                return;
              }

              const definition =
                VIDEO_DEFINITIONS[
                  sourceId
                ]!;

              const contentType =
                request.headers[
                  "content-type"
                ] ?? "";

              if (
                !String(
                  contentType,
                ).includes(
                  "video/mp4",
                )
              ) {
                jsonResponse(
                  response,
                  415,
                  {
                    error:
                      "envie um arquivo MP4",
                  },
                );

                return;
              }

              const body =
                await readBody(
                  request,
                  MAX_VIDEO_BYTES,
                );

              if (
                body.length === 0
              ) {
                jsonResponse(
                  response,
                  400,
                  {
                    error:
                      "vídeo vazio",
                  },
                );

                return;
              }

              await mkdir(
                sourceVideoDir,
                {
                  recursive:
                    true,
                },
              );

              await mkdir(
                editorVideoDir,
                {
                  recursive:
                    true,
                },
              );

              const sourcePath =
                resolve(
                  sourceVideoDir,
                  definition.fileName,
                );

              const editorPath =
                resolve(
                  editorVideoDir,
                  definition.fileName,
                );

              const temporary =
                `${sourcePath}.upload.tmp`;

              await writeFile(
                temporary,
                body,
              );

              const metadata =
                await inspectVideo(
                  temporary,
                );

              const compatible =
                (
                  metadata.width ===
                    definition.width &&
                  metadata.height ===
                    definition.height &&
                  Math.abs(
                    metadata.fps -
                    definition.fps,
                  ) < 0.01 &&
                  metadata.frameCount ===
                    definition.frameCount
                );

              if (!compatible) {
                jsonResponse(
                  response,
                  409,
                  {
                    error:
                      "vídeo incompatível com esta sprite",
                    expected:
                      definition,
                    received:
                      metadata,
                  },
                );

                return;
              }

              const timestamp =
                new Date()
                  .toISOString()
                  .replace(
                    /[:.]/g,
                    "-",
                  );

              const historyDir =
                resolve(
                  historyVideoDir,
                  sourceId,
                );

              await mkdir(
                historyDir,
                {
                  recursive:
                    true,
                },
              );

              try {
                await copyFile(
                  sourcePath,
                  resolve(
                    historyDir,
                    (
                      `${timestamp}_`
                      + definition.fileName
                    ),
                  ),
                );
              } catch (
                error
              ) {
                if (
                  (
                    error as
                      NodeJS.ErrnoException
                  ).code !==
                  "ENOENT"
                ) {
                  throw error;
                }
              }

              await rename(
                temporary,
                sourcePath,
              );

              await copyFile(
                sourcePath,
                editorPath,
              );

              jsonResponse(
                response,
                200,
                {
                  ok: true,
                  sourceId,
                  fileName:
                    definition.fileName,
                  metadata,
                  history:
                    (
                      "content/video-history/"
                      + `${sourceId}/`
                    ),
                },
              );

              return;
            }

            next();
          } catch (
            error
          ) {
            if (
              error instanceof
                Error &&
              error.message ===
                "PAYLOAD_TOO_LARGE"
            ) {
              jsonResponse(
                response,
                413,
                {
                  error:
                    "arquivo excede o limite permitido",
                },
              );

              return;
            }

            console.error(
              "[animation-editor-api]",
              error,
            );

            jsonResponse(
              response,
              500,
              {
                error:
                  error instanceof
                    Error
                    ? error.message
                    : "erro interno",
              },
            );
          }
        },
      );
    },
  };
}

export default defineConfig({
  plugins: [
    animationProjectApi(),
  ],
});
