import NodeMediaServer from "node-media-server";
import { nmsConfig } from "../../config/nms";

const nms = new NodeMediaServer(nmsConfig);

nms.on('prePublish', (id, streamPath, args) => {
    console.log(`prePublish: ${id}, ${streamPath}, ${JSON.stringify(args)}`);
});
nms.on('postPublish', (id, streamPath, args) => {
    console.log(`postPublish: ${id}, ${streamPath}, ${JSON.stringify(args)}`);
});
nms.on('prePlay', (id, streamPath, args) => {
    console.log(`prePlay: ${id}, ${streamPath}, ${JSON.stringify(args)}`);
});
nms.on('postPlay', (id, streamPath, args) => {
    console.log(`postPlay: ${id}, ${streamPath}, ${JSON.stringify(args)}`);
});

export default nms;