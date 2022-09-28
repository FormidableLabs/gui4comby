const sanitize = (text:string) => text.replace(/[\u2014]/g, "--")        // emdash
            .replace(/[\u2022]/g, "*")         // bullet
            .replace(/[\u2018\u2019]/g, "'")   // smart single quotes
            .replace(/[\u201C\u201D]/g, '"');  // smart double quotes

export default sanitize;
