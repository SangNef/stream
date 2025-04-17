import path from "path";
import fs from "fs";
import"dotenv/config";

const mediaPath = path.normalize(path.join(__dirname, '../media')).replace(/\\/g, '/');
const webRootPath = path.join(__dirname, '../../web');

if (fs.existsSync(mediaPath)) {
    fs.rmSync(mediaPath, { recursive: true, force: true });
}
fs.mkdirSync(mediaPath, { recursive: true });

if(!fs.existsSync(webRootPath)){
    fs.mkdirSync(webRootPath, { recursive: true });
}

export const nmsConfig = {
    rtmp: {
        port: 1935,
        // chunk_size: 60000,
        chunk_size: 4096,
        // gop_cache: true,
        gop_cache: false,
        ping: 30,
        ping_timeout: 10,
        // ping_interval: 10
    },
    http: {
        port: 8000,
        mediaroot: mediaPath,
        allow_origin: '*' // Trong môi trường production cần chỉ định domain cụ thể.
    },
    trans: {
        ffmpeg: "C:\\ffmpeg\\bin\\ffmpeg.exe",
        tasks: [
            // {
            //     app: 'live',
            //     hls: true,
            //     hlsFlags: '[hls_time=2]',
            //     // dash: true,
            //     // dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
            // },
            {
                app: 'live',
                hls: true,
                hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments+append_list]',
                // hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments+omit_endlist]',
                // hlsFlags: '[hls_time=2:hls_list_size=3:hls_start_number_source=epoch:hls_flags=delete_segments+omit_endlist]',
                args: '-fflags nobuffer -reset_timestamps 1'
            },
            {
                app: 'live',
                // vc: 'copy',
                vc: 'libx264',
                ac: 'aac',
                // mp4: true,
                // mp4Flags: '[movflags=frag_keyframe+empty_moov+faststart]', // Cho phép phát trực tiếp.
            }
        ]
    },
    logType: 4
}