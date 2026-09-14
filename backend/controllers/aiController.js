const OpenAI = require("openai");
const Hotel = require("../models/Hotel");

// ========================================
// CHECK OPENAI API KEY
// ========================================

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing from .env");
}

// ========================================
// OPENAI CLIENT
// ========================================

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ========================================
// AI HOTEL RECOMMENDATIONS
// ========================================

exports.recommendHotels = async (req, res) => {
  try {
    const { preferences } = req.body;

    // ------------------------------------
    // Validate user request
    // ------------------------------------

    if (!preferences || !preferences.trim()) {
      return res.status(400).json({
        message: "Please describe what kind of hotel you are looking for.",
      });
    }

    // ------------------------------------
    // Get REAL hotels from MongoDB
    // ------------------------------------

    const hotels = await Hotel.find().lean();

    if (!hotels.length) {
      return res.status(404).json({
        message: "There are no hotels available right now.",
      });
    }

    // ------------------------------------
    // Prepare hotel information for AI
    // ------------------------------------

    const hotelData = hotels.map((hotel) => ({
      id: String(hotel._id),
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      price: hotel.price,
      rooms: hotel.rooms,
    }));

    // ------------------------------------
    // AI PROMPT
    // ------------------------------------

    const prompt = `
You are an AI hotel recommendation assistant
for a hotel booking website.

The user said:

"${preferences}"

Here are the REAL hotels currently available
in our database:

${JSON.stringify(hotelData, null, 2)}

Your job is to recommend the best matching hotels
from this list.

IMPORTANT RULES:

1. Only recommend hotels that appear in the provided list.
2. Never invent a hotel.
3. Never invent a price.
4. Consider the user's location preference.
5. Consider their budget if they mention one.
6. Consider number of guests or rooms if mentioned.
7. Consider words such as cheap, luxury, comfortable,
   family, romantic, quiet, business, etc.
8. If several hotels match, recommend up to 3.
9. Give a short reason for each recommendation.
10. If the user's request does not provide enough
    information, still make the best recommendation possible.

Return ONLY valid JSON in this exact format:

{
  "message": "A short friendly explanation of the recommendations.",
  "recommendations": [
    {
      "hotelId": "hotel MongoDB id",
      "reason": "Why this hotel matches the user's request"
    }
  ]
}
`;

    // ------------------------------------
    // SEND REQUEST TO OPENAI
    // ------------------------------------

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: prompt,
    });

    const output = response.output_text;

    console.log("AI response received.");

    // ------------------------------------
    // PARSE AI RESPONSE
    // ------------------------------------

    let result;

    try {
      result = JSON.parse(output);
    } catch (parseError) {
      console.error("❌ AI JSON parsing error:", parseError);
      console.error("AI response:", output);

      return res.status(500).json({
        message: "The AI returned an invalid recommendation response.",
      });
    }

    // ------------------------------------
    // VERIFY AI RECOMMENDATIONS
    // ------------------------------------

    const recommendations = Array.isArray(result.recommendations)
      ? result.recommendations
      : [];

    const recommendedHotels = recommendations
      .map((recommendation) => {
        const hotel = hotels.find(
          (item) => String(item._id) === String(recommendation.hotelId),
        );

        // Never return a hotel that doesn't
        // actually exist in MongoDB.
        if (!hotel) {
          return null;
        }

        return {
          ...hotel,

          aiReason:
            recommendation.reason || "This hotel matches your preferences.",
        };
      })
      .filter(Boolean)
      .slice(0, 3);

    // ------------------------------------
    // SEND RESULT TO FRONTEND
    // ------------------------------------

    res.json({
      message:
        result.message ||
        "Here are the hotels that best match your preferences.",

      recommendations: recommendedHotels,
    });
  } catch (error) {
    console.error("❌ AI hotel recommendation error:", error);

    // ------------------------------------
    // OPENAI ERROR
    // ------------------------------------

    if (error?.status) {
      return res.status(error.status).json({
        message: error?.message || "OpenAI request failed.",
      });
    }

    // ------------------------------------
    // GENERAL ERROR
    // ------------------------------------

    res.status(500).json({
      message:
        error?.message || "Unable to generate hotel recommendations right now.",
    });
  }
};
