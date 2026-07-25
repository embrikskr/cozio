import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@cozio.eu";
  const password = await bcrypt.hash("password123", 10);

  // Reset demo user
  await prisma.user.deleteMany({ where: { email } });
  const user = await prisma.user.create({
    data: {
      email,
      name: "Demo Host",
      password,
      billingStatus: "active", // demo account stays live so /g/brygga always works
    },
  });

  // ---- Demo property: a harbour apartment ----
  const property = await prisma.property.create({
    data: {
      userId: user.id,
      name: "Brygga — Harbour Apartment",
      slug: "brygga",
      type: "apartment",
      published: true,
      language: "en",
      address: "Apotekergata 9, 4th floor",
      city: "Ålesund",
      country: "Norway",
      lat: 62.4722,
      lng: 6.1495,
      coverImage:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
      primaryColor: "#14402F",
      accentColor: "#C0603B",
      welcomeTitle: "Welcome to Brygga 🌊",
      welcomeMessage:
        "We're so happy to have you. Our bright apartment sits right on the harbour in the heart of Ålesund's art-nouveau quarter — everything you need for a smooth stay is in this guide.",
      hostName: "Ingrid & Lars",
      hostPhoto:
        "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=400&q=80",
      hostBio: "Born-and-raised locals who love sharing our corner of the city.",
      checkInTime: "From 3:00 PM",
      checkOutTime: "By 11:00 AM",
      checkInInfo:
        "Enter the building with code **2480#** at the street door. Take the lift to the 4th floor — apartment 4B is on your right. The key is in the lockbox by the door, code **4827**.",
      wifiName: "Brygga_Guest",
      wifiPassword: "fjord2024",
      parkingInfo: "Street parking is free after 5 PM and on Sundays. The Skansen P-hus garage is a 3-minute walk and open 24/7.",
      emergencyInfo: "Emergency: 112 · Nearest hospital: Ålesund Sjukehus (10 min drive).",
      contactPhone: "+47 900 00 000",
      contactEmail: "ingrid@brygga.no",
      conciergeEnabled: true,
      collectContact: false,
      contactRequired: false,
      reviewEnabled: true,
      reviewUrl: "https://g.page/r/example/review",
      checkInEnabled: false,
      plannerEnabled: true,
      languages: JSON.stringify(["no"]),
    },
  });

  // Extra language: Norwegian translations for key fields
  await prisma.translation.create({
    data: {
      propertyId: property.id,
      language: "no",
      data: JSON.stringify({
        welcomeTitle: "Velkommen til Brygga 🌊",
        welcomeMessage:
          "Vi er så glade for å ha deg her. Den lyse leiligheten vår ligger rett ved sjøkanten midt i Ålesunds jugendkvarter — alt du trenger for et godt opphold finner du i denne guiden.",
        checkInInfo: "Kom inn i bygget med kode **2480#** på gatedøren. Ta heisen til 4. etasje — leilighet 4B er til høyre. Nøkkelen ligger i nøkkelboksen ved døren, kode **4827**.",
        parkingInfo: "Gateparkering er gratis etter kl. 17 og på søndager. Skansen P-hus er 3 minutters gange unna og åpent døgnet rundt.",
        emergencyInfo: "Nød: 112 · Nærmeste sykehus: Ålesund Sjukehus (10 min med bil).",
      }),
    },
  });

  // Upsells
  await prisma.upsell.createMany({
    data: [
      { propertyId: property.id, title: "Airport transfer", description: "Door-to-door pickup from Ålesund Airport in a comfy car.", price: 65, currency: "EUR", unit: "per trip", order: 0 },
      { propertyId: property.id, title: "Welcome basket", description: "Local cheese, bread, jam and a bottle of wine waiting on arrival.", price: 40, currency: "EUR", unit: "per basket", order: 1 },
      { propertyId: property.id, title: "Guided fjord kayak tour", description: "Half-day paddle through the islands with a local guide.", price: 90, currency: "EUR", unit: "per person", order: 2 },
    ],
  });

  // A couple of reviews + contacts + an order for the demo inbox
  await prisma.review.createMany({
    data: [
      { propertyId: property.id, rating: 5, feedback: "Stylish apartment in the perfect location. The harbour view was a highlight!", guestName: "James P.", routedOut: true },
      { propertyId: property.id, rating: 3, feedback: "Lovely apartment but the wifi was patchy in the bedroom.", guestName: "Anna L." },
    ],
  });
  await prisma.order.create({
    data: { propertyId: property.id, upsellTitle: "Welcome basket", price: 40, currency: "EUR", quantity: 1, guestName: "Maria S.", guestEmail: "maria@example.com", status: "new" },
  });

  // A starter message template
  await prisma.messageTemplate.create({
    data: { userId: user.id, name: "Check-in details", channel: "email", subject: "Your check-in details 🔑", trigger: "before_checkin", body: "Hi {{name}}, we can't wait to host you! Your guidebook with the lockbox code and everything else is here: [link]. See you soon!" },
  });

  // ---- Sections + topics ----
  const sections: {
    title: string;
    icon: string;
    topics: { title: string; icon: string; body: string; image?: string }[];
  }[] = [
    {
      title: "Before you arrive",
      icon: "calendar",
      topics: [
        {
          title: "How to check in",
          icon: "key",
          body: "Check-in is from **3:00 PM**.\n\nUse code **2480#** on the street door, take the lift to the 4th floor, and the apartment (4B) is on your right. The key is in the lockbox by the door — code **4827**.",
        },
        {
          title: "Getting here",
          icon: "map-pin",
          body: "We're at **Apotekergata 9**, right on the Brosundet canal in the centre of Ålesund.\n\nFrom the airport, the **Flybussen** stops at Sentrum, a 4-minute walk away. Taxis drop off right at the door.",
        },
      ],
    },
    {
      title: "House manual",
      icon: "home",
      topics: [
        {
          title: "Heating & comfort",
          icon: "thermometer",
          body: "The apartment warms up fast. The thermostat by the front door controls the underfloor heating and the panel heaters.\n\nThere's a fan in the hall cupboard for warm summer days, and extra blankets on the top shelf of the bedroom wardrobe.",
          image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
        },
        {
          title: "Kitchen & coffee",
          icon: "utensils",
          body: "Help yourself to coffee, tea and the basics in the pantry. The dishwasher tablets are under the sink. There's a French press if you prefer it to the machine.",
          image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=800&q=80",
        },
        {
          title: "The balcony & the view",
          icon: "waves",
          body: "Step out onto the balcony for the best view over the harbour — perfect with a morning coffee. Please slide the door fully shut when you leave so the wind doesn't catch it.",
          image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        },
      ],
    },
    {
      title: "House rules",
      icon: "shield",
      topics: [
        {
          title: "The essentials",
          icon: "info",
          body: "- No smoking indoors (the balcony is perfect for it)\n- Quiet after 11 PM — it's a shared building\n- Pets welcome, just keep them off the beds\n- Please don't move the furniture\n\nTreat Brygga like your own home and we'll be happy. 💛",
        },
      ],
    },
    {
      title: "Before you leave",
      icon: "calendar",
      topics: [
        {
          title: "Check-out checklist",
          icon: "key",
          body: "Check-out is by **11:00 AM**. Before you go:\n\n- Start the dishwasher\n- Take rubbish to the chute in the hallway\n- Turn the heating down to 16°C\n- Lock the door and return the key to the lockbox\n\nTusen takk — we hope you'll come back! 🙏",
        },
      ],
    },
  ];

  for (const [si, s] of sections.entries()) {
    await prisma.section.create({
      data: {
        propertyId: property.id,
        title: s.title,
        icon: s.icon,
        order: si,
        topics: {
          create: s.topics.map((t, ti) => ({
            title: t.title,
            icon: t.icon,
            body: t.body,
            image: t.image ?? null,
            order: ti,
          })),
        },
      },
    });
  }

  // ---- Recommendations ----
  const recs = [
    {
      name: "Brosundet Restaurant",
      category: "restaurant",
      description: "Fine seafood in a converted lighthouse warehouse. Book ahead.",
      walkingTime: "12 min drive",
      hostFavorite: true,
      lat: 62.4716,
      lng: 6.1551,
      url: "https://brosundet.no",
    },
    {
      name: "Apotekergata No.5",
      category: "restaurant",
      description: "Modern Nordic tasting menus using local catch and produce.",
      walkingTime: "12 min drive",
      lat: 62.472,
      lng: 6.155,
    },
    {
      name: "Lyspunktet Café",
      category: "cafe",
      description: "Cosy spot for cinnamon buns and great coffee.",
      walkingTime: "10 min drive",
      hostFavorite: true,
      lat: 62.4725,
      lng: 6.157,
    },
    {
      name: "Mount Aksla viewpoint",
      category: "attraction",
      description: "418 steps (or drive up) for the classic Ålesund panorama.",
      walkingTime: "15 min drive",
      hostFavorite: true,
      lat: 62.4735,
      lng: 6.1656,
    },
    {
      name: "Atlanterhavsparken",
      category: "attraction",
      description: "North Europe's largest saltwater aquarium, out on the point.",
      walkingTime: "20 min drive",
      lat: 62.4577,
      lng: 6.0846,
    },
    {
      name: "Sunnmøre fjord kayak tour",
      category: "activity",
      description: "Guided paddle through the islands — a wonderful half-day out on the fjord.",
      walkingTime: "On site",
      lat: 62.472,
      lng: 6.149,
    },
  ];

  for (const [i, r] of recs.entries()) {
    await prisma.recommendation.create({
      data: { ...r, propertyId: property.id, order: i },
    });
  }

  // ---- Some analytics + a lead for the demo dashboard ----
  const now = Date.now();
  const views = [];
  for (let d = 0; d < 14; d++) {
    const count = 2 + ((d * 7) % 9);
    for (let i = 0; i < count; i++) {
      views.push({
        propertyId: property.id,
        path: i % 3 === 0 ? "/recommendations" : "/",
        sessionId: `seed-${d}-${i}`,
        createdAt: new Date(now - d * 86400000 - i * 3600000),
      });
    }
  }
  await prisma.guestView.createMany({ data: views });

  await prisma.lead.create({
    data: {
      propertyId: property.id,
      name: "Maria S.",
      email: "maria@example.com",
      message: "Could we check in a little earlier on Friday? Arriving at 1 PM.",
    },
  });

  console.log("✅ Seed complete.");
  console.log("   Login:  demo@cozio.eu  /  password123");
  console.log("   Guide:  http://localhost:3000/g/brygga");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
