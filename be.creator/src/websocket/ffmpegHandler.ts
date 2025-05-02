import { spawn } from "child_process";
import { nmsConfig } from "~/config/nms";
import { WebSocket } from "ws";

export default function WS_FfmpegHandler (streamKey: string, ws: WebSocket) {
    console.log('[WebSocket --- Connected]:: New Connected With Stream Key: ', streamKey);

    const ffmpeg = spawn(nmsConfig.trans.ffmpeg, [
        '-re', // Chế độ real-time.
        '-i', '-', // Dữ liệu đầu vào từ stdin.
        '-c:v', 'libx264', // Mã hóa video (H.264).
        '-preset', 'veryfast', // Tốc độ mã hóa.
        '-c:a', 'aac',
        '-f', 'flv',
        `rtmp://localhost:1935/live/${streamKey}`,
    ]);
    // const ffmpeg = spawn(nmsConfig.trans.ffmpeg, [
    //     // '-f', 'mjpeg',  // Nhận luồng MJPEG
    //     '-f', 'image2pipe', // Đọc từ stdin dưới dạng chuỗi hình ảnh
    //     '-vcodec', 'mjpeg', // Chỉ định codec của đầu vào là MJPEG
    //     '-r', '30', // Tốc độ khung hình đầu ra (30 fps)
    //     '-i', 'pipe:0', // Đọc từ stdin
    //     '-pix_fmt', 'yuv420p', // Định dạng pixel để đảm bảo tương thích
    //     '-c:v', 'libx264', // Bộ mã hóa video
    //     '-preset', 'veryfast', // Tốc độ mã hóa
    //     // '-tune', 'zerolatency', // Giảm độ trễ
    //     '-f', 'flv', // Định dạng đầu ra
    //     `rtmp://localhost:1935/live/${streamKey}` // URL RTMP
    // ]);

    ws.on('message', async (data) => {
        try {
            // Ghi dữ liệu JPEG vào stdin của FFmpeg
            if (ffmpeg.stdin.writable) {
                ffmpeg.stdin.write(data);
            }
        } catch (error) {
            console.error('Error processing image:', error);
        }
    });

    ws.on('close', () => {
        console.log(`[WebSocket --- Disconnected]:: Stream Key ${streamKey} Closed!`);
        ffmpeg.stdin.end();
        ffmpeg.kill('SIGINT');
    });

    ws.on('error', error => {
        console.log('[WebSocket --- Error]:: ', error);
        ffmpeg.kill('SIGINT');
    })

    // Ghi log từ ffmpeg.
    ffmpeg.stderr.on('data', data => {
        console.log('[WebSocket --- FFMPEG]:: LOG: ', data.toString());
    });
    ffmpeg.stdout.on('data', data => {
        console.log('[FFMPEG STDOUT]::', data.toString()); // Ghi lại thông tin đầu ra của ffmpeg
    });
    
    // Dừng ffmpeg khi hoàn tất.
    ffmpeg.on('close', code => {
        console.log('[WebSocket --- FFMPEG]:: Closed: ', code);
    });

    ffmpeg.on('error', error => {
        console.log('[WebSocket --- FFMPEG]:: ERROR: ', error);
    });
}