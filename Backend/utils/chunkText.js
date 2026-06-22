export function chunkText(
    text,
    chunkSize = 1000,
    overlap = 200
) {
    const chunks = [];

    let start = 0;

    while (start < text.length) {
        chunks.push(
            text.slice(
                start,
                start + chunkSize
            )
        );

        start += chunkSize - overlap;
    }

    return chunks;
}