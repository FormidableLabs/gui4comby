export const sanitize = (text:string) => text
            .replace(/[\u2014]/g, "--")        // emdash
            .replace(/[\u2022]/g, "*")         // bullet
            .replace(/[\u2018\u2019]/g, "'")   // smart single quotes
            .replace(/[\u201C\u201D]/g, '"');  // smart double quotes

export const isSanitized = (text:string): Boolean => {
  return !/[\u2014]|[\u2022]|[\u2018\u2019]|[\u201C\u201D]/g.test(text)
}

export default sanitize;
