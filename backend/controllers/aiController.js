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
    // Frontend sends "prompt"
    const { prompt } = req.body;

    // ------------------------------------
    // Validate user request
    // ------------------------------------

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        message: "Please describe what kind of hotel you are looking for.",
      });
    }

    // ------------------------------------
    // Get REAL hotels from MongoDB
    // ------------------------------------

    const hotels = await Hotel.find().lean();

    if (!hotels || hotels.length === 0) {
      return res.status(404).json({
        message: "There are no hotels available right now.",
      });
    }

    // ------------------------------------
    // Prepare hotel information for AI
    // ------------------------------------

    const hotelData = hotels.map((hotel) => ({
      id: String(hotel._id),
      name: hotel.name || hotel.hotelName || "Hotel",
      location: hotel.location || hotel.city || "",
      description: hotel.description || "",
      price: hotel.price || hotel.pricePerNight || 0,
      rating: hotel.rating || 0,
      rooms: hotel.rooms || [],
    }));

    // ------------------------------------
    // AI PROMPT
    // ------------------------------------

    const aiPrompt = `
You are an AI hotel recommendation assistant
for a hotel booking website.

The user said:

"${prompt}"

Here are the REAL hotels currently available
in our MongoDB database:

${JSON.stringify(hotelData, null, 2)}

Your job is to recommend the best matching hotels
from this list.

IMPORTANT RULES:

1. Only recommend hotels from the provided list.
2. Never invent a hotel.
3. Never invent a hotel ID.
4. Never invent a price.
5. Consider the user's preferred location.
6. Consider their budget if they mention one.
7. Consider number of guests or rooms if mentioned.
8. Consider preferences such as:
   - cheap
   - budget
   - luxury
   - comfortable
   - family
   - romantic
   - quiet
   - business
   - lake
   - beach
   - premium
9. Recommend up to 3 hotels.
10. Give a short reason for every recommendation.
11. If there is not an exact match, choose the closest available hotels.
12. Return ONLY valid JSON.

Return exactly this structure:

{
  "message": "A short friendly explanation.",
  "recommendations": [
    {
      "hotelId": "MongoDB hotel ID",
      "reason": "Why this hotel matches the user's request."
    }
  ]
}
`;

    // ------------------------------------
    // SEND REQUEST TO OPENAI
    // ------------------------------------

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: aiPrompt,
    });

    const output = response.output_text;

    console.log("✅ AI response received.");

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
    // VERIFY RECOMMENDATIONS
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

    return res.json({
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

    return res.status(500).json({
      message:
        error?.message || "Unable to generate hotel recommendations right now.",
    });
  }
};
