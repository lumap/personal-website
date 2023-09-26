async function streamToArrayBuffer(stream: ReadableStream<any>) {
    const reader = stream.getReader();
    const chunks = [];

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        chunks.push(value);
    }

    return new Uint8Array([...chunks].flat()).buffer;
}

export async function convertStreamToBinaryLike(readableStream: ReadableStream<any>) {
    const arrayBuffer = await streamToArrayBuffer(readableStream);
    return arrayBuffer;
}