import { NextResponse } from "next/server";

const chefLevels = [
    {
      title: "Executive Chef",
      description: "Senior kitchen leader with deep culinary and team management experience.",
    },
    {
      title: "Sous Chef",
      description: "Mid-level team leader, assisting the executive chef and managing stations.",
    },
    {
      title: "Chef de Partie",
      description: "Station-specific expert responsible for pastry, grill, saucier, etc.",
    },
    {
      title: "Personal / Private Chef",
      description: "In-home menu planning, daily meal service, and personalized attention.",
    },
    {
      title: "Junior Chef / Commis Chef",
      description: "Entry-level but culinary-trained, supporting senior chefs in various tasks.",
    },
    {
      title: "Kitchen Assistant / Steward",
      description: "Essential support for kitchen prep, hygiene, and organization.",
    },
];

export async function GET() {
    try {
        return NextResponse.json(chefLevels);
    } catch (error) {
        console.error("Error fetching chef levels:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}
