export async function getLangStrings(lang: string, page: string) {
    const langFile: Record<string, any> = await Bun.file("src/strings.json").json();
    return langFile[lang][page];
}