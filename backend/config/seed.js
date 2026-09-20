import { dbAdapter, connectDB, isUsingMongo } from './db.js';
import { registerMongoModels } from '../models/Schemas.js';
import bcrypt from 'bcryptjs';

const seedData = async () => {
  console.log("Seeding YatraSetu database...");
  
  if (isUsingMongo) {
    registerMongoModels();
    const mongoose = (await import('mongoose')).default;
    await mongoose.connection.dropDatabase().catch(() => {});
  } else {
    await dbAdapter.resetJSON();
  }

  const hashedPassword = await bcrypt.hash('password123', 8);

  // 1. Seed Users
  const userTourist = await dbAdapter.create('users', { username: 'tourist', email: 'tourist@yatrasetu.gov.in', password: hashedPassword, role: 'TOURIST' });
  const userVendor = await dbAdapter.create('users', { username: 'vendor', email: 'vendor@yatrasetu.gov.in', password: hashedPassword, role: 'HOTEL' });
  const userAdmin = await dbAdapter.create('users', { username: 'admin', email: 'admin@yatrasetu.gov.in', password: hashedPassword, role: 'ADMIN' });
  const userRest = await dbAdapter.create('users', { username: 'restaurant_owner', email: 'rest@yatrasetu.gov.in', password: hashedPassword, role: 'RESTAURANT' });
  const userGuide = await dbAdapter.create('users', { username: 'tour_guide', email: 'guide@yatrasetu.gov.in', password: hashedPassword, role: 'GUIDE' });
  const userDriver = await dbAdapter.create('users', { username: 'driver', email: 'driver@yatrasetu.gov.in', password: hashedPassword, role: 'TRANSPORT' });

  // 2. Destinations
  const destinations = [
    { name: 'Hampi', state: 'Karnataka', category: 'Heritage', attractions: ["Virupaksha Temple", "Stone Chariot", "Hampi Ruins"] },
    { name: 'Araku Valley', state: 'Andhra Pradesh', category: 'Nature', attractions: ["Borra Caves", "Katiki Waterfalls", "Coffee Gardens"] },
    { name: 'Tirupati', state: 'Andhra Pradesh', category: 'Spiritual', attractions: ["Venkateswara Temple", "Silathoranam", "Kapila Theertham"] },
    { name: 'Varanasi', state: 'Uttar Pradesh', category: 'Spiritual', attractions: ["Kashi Vishwanath Temple", "Dashashwamedh Ghat", "Sarnath"] },
    { name: 'Coorg', state: 'Karnataka', category: 'Nature', attractions: ["Abbey Falls", "Raja's Seat", "Golden Temple"] },
    { name: 'Jaipur', state: 'Rajasthan', category: 'Heritage', attractions: ["Hawa Mahal", "Amer Fort", "City Palace"] },
    { name: 'Munnar', state: 'Kerala', category: 'Nature', attractions: ["Eravikulam National Park", "Mattupetty Dam", "Anamudi Peak"] },
    { name: 'Varkala', state: 'Kerala', category: 'Nature', attractions: ["Varkala Beach", "Janardhana Swamy Temple", "Kapil Lake"] }
  ];

  for (const d of destinations) {
    await dbAdapter.create('destinations', {
      name: d.name,
      description: `A marvelous travel destination in ${d.state} categorized as ${d.category}.`,
      state: d.state,
      district: d.name,
      category: d.category,
      latitude: 15.0,
      longitude: 75.0,
      isGovernmentPromoted: true,
      heritageStatus: d.category === 'Heritage' ? 'UNESCO World Heritage' : 'State Heritage',
      rating: 4.6,
      imageUrl: `https://images.unsplash.com/photo-1600100397990-a4b3d70f2d51?w=800`,
      entryFees: 50,
      bestVisitingTime: 'October to March',
      attractions: d.attractions
    });
  }

  // 3. Seed Hotels
  const hotels = [
    { destination: 'Hampi', name: 'Hampi Heritage Homestay', price: 1200 },
    { destination: 'Hampi', name: 'Vijayanagara Royal Resort', price: 4500 },
    { destination: 'Araku Valley', name: 'Araku Coffee Retreat', price: 1600 },
    { destination: 'Tirupati', name: 'Balaji Hills Guesthouse', price: 1100 },
    { destination: 'Varanasi', name: 'Ganges Riverfront Palace', price: 1800 },
    { destination: 'Varanasi', name: 'Kashi Heritage Homestay', price: 1000 },
    { destination: 'Coorg', name: 'Misty Hills Plantation Resort', price: 2800 },
    { destination: 'Coorg', name: 'Coorg Valley Homestay', price: 1200 },
    { destination: 'Jaipur', name: 'Rajputana Royal Palace Hotel', price: 3500 },
    { destination: 'Jaipur', name: 'Pink City Heritage Inn', price: 1500 },
    { destination: 'Munnar', name: 'Misty Tea Garden Resort', price: 2200 },
    { destination: 'Munnar', name: 'Munnar Valley Homestay', price: 1100 },
    { destination: 'Varkala', name: 'Varkala Cliff Beach Resort', price: 2400 },
    { destination: 'Varkala', name: 'Arabian Sea Homestay', price: 1200 }
  ];

  for (const h of hotels) {
    const v = await dbAdapter.create('vendors', {
      name: h.name,
      type: 'HOTEL',
      verificationStatus: 'VERIFIED',
      trustScore: 95,
      gstin: '29AAAAA1111A1Z1',
      licenseNumber: 'LC-ACC-2026',
      lastVerified: new Date().toISOString()
    });

    await dbAdapter.create('hotels', {
      vendorId: v._id || v.id,
      destination: h.destination,
      name: h.name,
      pricePerNight: h.price,
      availableRooms: 10,
      facilities: ['AC Rooms', 'Wi-Fi', 'Clean Restrooms', 'Parking'],
      isHomestay: h.name.toLowerCase().includes('homestay'),
      rating: 4.5,
      reviewsCount: 120
    });
  }

  // 4. Seed Restaurants
  const restaurants = [
    { destination: 'Hampi', name: 'Mango Tree Cuisine Hampi', price: 200 },
    { destination: 'Araku Valley', name: 'Bamboo Chicken Kitchen', price: 150 },
    { destination: 'Tirupati', name: 'Govinda Pure Veg Thali', price: 100 },
    { destination: 'Varanasi', name: 'Kashi Cafe & Diner', price: 150 },
    { destination: 'Coorg', name: 'Coorgi Plantation Kitchen', price: 180 },
    { destination: 'Jaipur', name: 'Laxmi Heritage Bhojanalaya', price: 220 },
    { destination: 'Munnar', name: 'Tea Valley Restaurant', price: 160 },
    { destination: 'Varkala', name: 'Varkala Sunset Cafe', price: 190 }
  ];

  for (const r of restaurants) {
    const v = await dbAdapter.create('vendors', {
      name: r.name,
      type: 'RESTAURANT',
      verificationStatus: 'VERIFIED',
      trustScore: 92,
      licenseNumber: 'FSSAI-12345'
    });

    await dbAdapter.create('restaurants', {
      vendorId: v._id || v.id,
      destination: r.destination,
      name: r.name,
      averageMealCost: r.price,
      cuisineType: 'Local Traditional',
      menuItems: [{ name: 'Standard Meal', price: r.price, isAvailable: true }],
      rating: 4.4
    });
  }

  // 5. Seed Guides
  const guides = [
    { destination: 'Hampi', name: 'Ramesh Hampi Heritage Guide', price: 800 },
    { destination: 'Araku Valley', name: 'Kiran Tribal Caves Guide', price: 600 },
    { destination: 'Tirupati', name: 'Prasad Devasthanam Guide', price: 500 },
    { destination: 'Varanasi', name: 'Ganga Ghats Ritual Guide', price: 700 },
    { destination: 'Jaipur', name: 'Amer Fort Heritage Guide', price: 900 },
    { destination: 'Coorg', name: 'Somanna Coorg Plantation Guide', price: 700 },
    { destination: 'Munnar', name: 'Raju Munnar Trekking Guide', price: 600 },
    { destination: 'Varkala', name: 'Sajid Varkala Surf & Cliff Guide', price: 800 }
  ];

  for (const g of guides) {
    const v = await dbAdapter.create('vendors', {
      name: g.name,
      type: 'GUIDE',
      verificationStatus: 'VERIFIED',
      trustScore: 94,
      licenseNumber: 'GUIDE-LC-123'
    });

    await dbAdapter.create('guides', {
      vendorId: v._id || v.id,
      destination: g.destination,
      name: g.name,
      pricePerDay: g.price,
      languages: ['English', 'Hindi'],
      experienceYears: 6,
      availabilityCalendar: []
    });
  }

  // 6. Seed Transports
  const destinationsList = ['Hampi', 'Araku Valley', 'Tirupati', 'Varanasi', 'Coorg', 'Jaipur', 'Munnar', 'Varkala'];
  const transportTypes = [
    { type: 'Train', price: 400 },
    { type: 'Bus', price: 900 },
    { type: 'Flight', price: 4500 }
  ];

  for (const dest of destinationsList) {
    const v = await dbAdapter.create('vendors', {
      name: `${dest} Transit Hub`,
      type: 'TRANSPORT',
      verificationStatus: 'VERIFIED',
      trustScore: 90
    });

    for (const t of transportTypes) {
      await dbAdapter.create('transports', {
        vendorId: v._id || v.id,
        type: t.type,
        source: 'Hyderabad',
        destination: dest,
        pricePerSeat: t.price,
        departureTime: '21:00',
        durationMinutes: 480
      });
    }
  }

  console.log("✓ YatraSetu Database Seeding complete!");
};

if (import.meta.url === `file://${process.argv[1]}`) {
  connectDB().then(seedData).then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export default seedData;
