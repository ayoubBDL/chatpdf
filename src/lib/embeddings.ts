import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " "),
    });

    if (response.status !== 200) {
      // Handle non-successful response (e.g., status code other than 200)
      console.error(
        "Non-successful response from OpenAI API:",
        response.status
      );
      // throw new Error(
      //   `OpenAI API returned a non-successful status: ${response.status}`
      // );
    }

    const result = await response.json();

    if (result && result.data && result.data[0] && result.data[0].embedding) {
      // Ensure that the expected structure is present in the response
      return result.data[0].embedding;
    } else {
      // Handle unexpected response format
      console.error("Unexpected response format from OpenAI API:", result);
      throw new Error("Unexpected response format from OpenAI API");
    }
  } catch (error) {
    // Handle errors that occur during the API call
    console.error("Error calling OpenAI embeddings API:", error);
    throw error;
  }
}
