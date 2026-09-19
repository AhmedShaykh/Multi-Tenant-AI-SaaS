import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AnalysisType } from "./types";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {

    throw new Error("GEMINI API KEY Not Found!");

};

const model = new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-3.6-flash",
    temperature: 0.3,
    maxRetries: 2
});

const instructions: Record<AnalysisType, string> = {
    summary: "Provide a comprehensive summary of the document. Include main points, key findings, and conclusions.",
    qa: "Based on the document, generate 5 important questions and their answers.",
    sentiment: "Analyze the sentiment and tone of the document. Provide overall sentiment (positive/negative/neutral) and key emotional tones detected.",
    entities: "Extract all named entities (people, organizations, locations, dates, etc.) from the document.",
    extract: "Extract key information from the document in a structured format."
};

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system", "You are a document analysis assistant. {instruction}"
    ],
    [
        "human", "<document>\n{text}\n</document>"
    ]
]);

const chain = prompt.pipe(model).pipe(new StringOutputParser());

export async function analyzeWithGemini(text: string, analysisType: AnalysisType) {

    const instruction = instructions[analysisType] ?? instructions.summary;

    try {

        return await chain.invoke({ instruction, text });

    } catch (error: any) {

        console.error("Gemini Error:", error?.message ?? error);

        throw new Error(error?.message || "Gemini Analysis Failed");

    };

};