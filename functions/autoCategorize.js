// functions/autoCategorize.js
const functions = require("firebase-functions");
const OpenAI = require("openai");
const cors = require("cors")({ origin: true });

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

// -------------------- Auto Categorize --------------------
exports.autoCategorize = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    try {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Categorize this expense into one or more categories from: Food, Travel, Bills, Entertainment, Health, Other. 
Expense: ${title}
Return only comma separated categories.`,
          },
        ],
      });

      const raw = response.choices[0].message.content;
      const categories = raw.split(",").map(c => c.trim());

      res.json({ categories });
    } catch (error) {
      console.error("AutoCategorize Error:", error);
      res.status(500).json({ error: "Failed to categorize expense" });
    }
  });
});

// -------------------- AI Financial Query --------------------
exports.aiQuery = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    try {
      const { query, expenses } = req.body;

      if (!query || !Array.isArray(expenses)) {
        return res.status(400).json({ error: "Query and expenses array required" });
      }

      const expensesSummary = expenses
        .map(e => `${e.title}: ₹${e.amount} on ${e.date}`)
        .join("\n");

      const prompt = `
User expenses:
${expensesSummary}

Question: ${query}
Give concise and practical financial advice.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const answer = response.choices[0].message.content;

      res.json({ answer });
    } catch (error) {
      console.error("AI Query Error:", error);
      res.status(500).json({ error: "Failed to process query" });
    }
  });
});
