import mime from "mime";
import { generateErrorPage } from "../server";

export async function handleCDN(_: Request, route: string) {
    try {
        const fileContent = Bun.file(`${import.meta.dir}/../public/${route}`);
        return new Response(fileContent, {
            headers: {
                "content-type": mime.getType(`${import.meta.dir}/../public/${route}`)!,
                'Access-Control-Allow-Origin': "*"
            }
        });
    } catch (e) {
        return new Response(await generateErrorPage(404), {
            status: 404,
            statusText: "Page Not Found",
            headers: {
                "content-type": "text/html; charset=utf-8"
            }
        });
    }
}