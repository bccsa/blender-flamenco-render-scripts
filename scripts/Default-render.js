// SPDX-License-Identifier: GPL-3.0-or-later

const JOB_TYPE = {
    label: "Blender Render",
    description: "Render a sequence of frames, and create a preview video file",
    settings: [
        // Automatically evaluated settings:
        { key: "blendfile", type: "string", required: true, description: "Path of the Blend file to render", visible: "web" },
        { key: "fps", type: "float", eval: "C.scene.render.fps / C.scene.render.fps_base", visible: "hidden" },
        { key: "format", type: "string", required: true, eval: "C.scene.render.image_settings.file_format", visible: "web" },
        { key: "image_file_extension", type: "string", required: true, eval: "C.scene.render.file_extension", visible: "hidden",
          description: "File extension used when rendering images" },
        { key: "has_previews", type: "bool", required: false, eval: "C.scene.render.image_settings.use_preview", visible: "hidden",
          description: "Whether Blender will render preview images."},
    ]
};


// Set of scene.render.image_settings.file_format values that produce
// files which FFmpeg is known not to handle as input.
const ffmpegIncompatibleImageFormats = new Set([
    "EXR",
    "MULTILAYER", // Old CLI-style format indicators
    "OPEN_EXR",
    "OPEN_EXR_MULTILAYER", // DNA values for these formats.
]);

function compileJob(job) {
    print("Blender Render job submitted");
    print("job: ", job);

    const settings = job.settings;
  
    // Make sure that when the job is investigated later, it shows the
    const renderTasks = authorRenderTasks(settings);

    for (const rt of renderTasks) {
        job.addTask(rt);
    }
}

function authorRenderTasks(settings) {
    print(settings);
    let renderTasks = [];
    const task = author.Task(`render`, "blender");
    const command = author.Command("blender-render", {
        exe: "{blender}",
        exeArgs: "{blenderArgs}",
        argsBefore: [],
        blendfile: settings.blendfile,
        args: [
            "--render-format", settings.format,
            "-a"
        ]
    });
    task.addCommand(command);
    renderTasks.push(task);
    
    return renderTasks;
}
