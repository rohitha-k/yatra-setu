export const MOCK_DESTINATIONS = [
  { id: 'hampi', name: "Hampi", state: "Karnataka", category: "Heritage", isGovernmentPromoted: true, imageUrl: "/hampi_ruins.jpg" },
  { id: 'araku', name: "Araku Valley", state: "Andhra Pradesh", category: "Nature", isGovernmentPromoted: true, imageUrl: "/araku_valley.jpg" },
  { id: 'coorg', name: "Coorg", state: "Karnataka", category: "Nature", isGovernmentPromoted: true, imageUrl: "/coorg_hills.jpg" },
  { id: 'tirupati', name: "Tirupati", state: "Andhra Pradesh", category: "Spiritual", isGovernmentPromoted: false, imageUrl: "/tirupati_temple.jpg" },
  { id: 'varanasi', name: "Varanasi", state: "Uttar Pradesh", category: "Spiritual", isGovernmentPromoted: true, imageUrl: "/varanasi_ghats.jpg" },
  { id: 'jaipur', name: "Jaipur", state: "Rajasthan", category: "Heritage", isGovernmentPromoted: true, imageUrl: "/jaipur_palace.jpg" },
  { id: 'munnar', name: "Munnar", state: "Kerala", category: "Nature", isGovernmentPromoted: true, imageUrl: "/munnar_hills.jpg" },
  { id: 'varkala', name: "Varkala", state: "Kerala", category: "Nature", isGovernmentPromoted: true, imageUrl: "/varkala_beach.jpg" },
  { id: 'goa', name: "Goa", state: "Goa", category: "Beach", isGovernmentPromoted: true, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800" },
  { id: 'ooty', name: "Ooty", state: "Tamil Nadu", category: "Nature", isGovernmentPromoted: true, imageUrl: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800" },
  { id: 'rishikesh', name: "Rishikesh", state: "Uttarakhand", category: "Spiritual", isGovernmentPromoted: true, imageUrl: "https://images.unsplash.com/photo-1600100397990-a4b3d70f2d51?w=800" },
  { id: 'udaipur', name: "Udaipur", state: "Rajasthan", category: "Heritage", isGovernmentPromoted: true, imageUrl: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800" },
  { id: 'alleppey', name: "Alleppey", state: "Kerala", category: "Nature", isGovernmentPromoted: true, imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800" },
  { id: 'pondicherry', name: "Pondicherry", state: "Puducherry", category: "Heritage", isGovernmentPromoted: true, imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800" },
  { id: 'agra', name: "Agra", state: "Uttar Pradesh", category: "Heritage", isGovernmentPromoted: true, imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800" }
];

export const MOCK_HOTELS = [
  // Hampi
  { id: 'h1', destination: 'Hampi', name: "Hampi Heritage Homestay", pricePerNight: 1200, trustScore: 94, isGovernmentApproved: true, facilities: ['Clean Restrooms', 'Wi-Fi', 'Parking'] },
  { id: 'h2', destination: 'Hampi', name: "Vijayanagara Royal Resort", pricePerNight: 2500, trustScore: 96, isGovernmentApproved: true, facilities: ['AC Rooms', 'Pool', 'Free Shuttle'] },
  { id: 'h15', destination: 'Hampi', name: "Tungabhadra Riverfront Cottages", pricePerNight: 950, trustScore: 90, isGovernmentApproved: true, facilities: ['River View', 'Hot Water', 'Garden'] },
  
  // Araku Valley
  { id: 'h3', destination: 'Araku Valley', name: "Araku Coffee Retreat", pricePerNight: 1600, trustScore: 91, isGovernmentApproved: true, facilities: ['Hot Water', 'Garden View'] },
  { id: 'h16', destination: 'Araku Valley', name: "Tribal Heritage Wooden Cabins", pricePerNight: 1100, trustScore: 89, isGovernmentApproved: true, facilities: ['Bonfire', 'Home Cooked Meal'] },
  { id: 'h17', destination: 'Araku Valley', name: "Hilltop Valley View Homestay", pricePerNight: 2100, trustScore: 94, isGovernmentApproved: true, facilities: ['AC Rooms', 'Balcony View'] },

  // Tirupati
  { id: 'h4', destination: 'Tirupati', name: "Balaji Hills Guesthouse", pricePerNight: 1100, trustScore: 89, isGovernmentApproved: false, facilities: ['Parking', 'Restrooms'] },
  { id: 'h18', destination: 'Tirupati', name: "Sree Venkateswara Pilgrim Inn", pricePerNight: 750, trustScore: 93, isGovernmentApproved: true, facilities: ['Hot Water', 'Free Temple Transit'] },
  { id: 'h19', destination: 'Tirupati', name: "Grand Tirumala Heritage Hotel", pricePerNight: 2200, trustScore: 95, isGovernmentApproved: true, facilities: ['Pure Veg Restaurant', 'AC Rooms'] },

  // Varanasi
  { id: 'h5', destination: 'Varanasi', name: "Ganges Riverfront Palace", pricePerNight: 1800, trustScore: 95, isGovernmentApproved: true, facilities: ['River View', 'AC Rooms', 'Wi-Fi'] },
  { id: 'h6', destination: 'Varanasi', name: "Kashi Heritage Homestay", pricePerNight: 1000, trustScore: 92, isGovernmentApproved: true, facilities: ['Hot Water', 'Free Tea'] },
  { id: 'h20', destination: 'Varanasi', name: "Assi Ghat Spiritual Residence", pricePerNight: 1450, trustScore: 94, isGovernmentApproved: true, facilities: ['Rooftop Terrace', 'Yoga Space'] },

  // Coorg
  { id: 'h7', destination: 'Coorg', name: "Misty Hills Plantation Resort", pricePerNight: 2800, trustScore: 93, isGovernmentApproved: true, facilities: ['Breakfast Included', 'Bonfire', 'AC'] },
  { id: 'h8', destination: 'Coorg', name: "Coorg Valley Homestay", pricePerNight: 1200, trustScore: 90, isGovernmentApproved: true, facilities: ['Hot Water', 'Parking', 'Home Cooked Food'] },
  { id: 'h21', destination: 'Coorg', name: "Coorg Coffee Estate Cottage", pricePerNight: 1750, trustScore: 94, isGovernmentApproved: true, facilities: ['Plantation Tour', 'Barbecue'] },

  // Jaipur
  { id: 'h9', destination: 'Jaipur', name: "Rajputana Royal Palace Hotel", pricePerNight: 3500, trustScore: 97, isGovernmentApproved: true, facilities: ['Heritage Decor', 'Pool', 'AC Rooms'] },
  { id: 'h10', destination: 'Jaipur', name: "Pink City Heritage Inn", pricePerNight: 1500, trustScore: 91, isGovernmentApproved: true, facilities: ['Free Transit', 'Clean Restrooms'] },
  { id: 'h22', destination: 'Jaipur', name: "Amber Fort Haveli Stays", pricePerNight: 1900, trustScore: 93, isGovernmentApproved: true, facilities: ['Folk Dance Night', 'Rooftop Cafe'] },

  // Munnar
  { id: 'h11', destination: 'Munnar', name: "Misty Tea Garden Resort", pricePerNight: 2200, trustScore: 94, isGovernmentApproved: true, facilities: ['Tea Garden Walk', 'AC Rooms', 'Wi-Fi'] },
  { id: 'h12', destination: 'Munnar', name: "Munnar Valley Homestay", pricePerNight: 1100, trustScore: 92, isGovernmentApproved: true, facilities: ['Mountain View', 'Hot Water'] },

  // Varkala
  { id: 'h13', destination: 'Varkala', name: "Varkala Cliff Beach Resort", pricePerNight: 2400, trustScore: 95, isGovernmentApproved: true, facilities: ['Ocean View', 'Pool', 'AC Rooms'] },
  { id: 'h14', destination: 'Varkala', name: "Arabian Sea Homestay", pricePerNight: 1200, trustScore: 91, isGovernmentApproved: true, facilities: ['Beach Access', 'Hot Water'] },

  // Goa
  { id: 'h23', destination: 'Goa', name: "Calangute Beachfront Palms", pricePerNight: 2100, trustScore: 93, isGovernmentApproved: true, facilities: ['Pool', 'Beach View', 'AC'] },
  { id: 'h24', destination: 'Goa', name: "Old Goa Portuguese Villa", pricePerNight: 1400, trustScore: 92, isGovernmentApproved: true, facilities: ['Garden', 'Wi-Fi', 'Free Scooters'] },

  // Ooty
  { id: 'h25', destination: 'Ooty', name: "Nilgiri Mountain View Lodge", pricePerNight: 1500, trustScore: 91, isGovernmentApproved: true, facilities: ['Fireplace', 'Hot Water', 'Tea Service'] },

  // Rishikesh
  { id: 'h26', destination: 'Rishikesh', name: "Laxman Jhula Ashram & Resort", pricePerNight: 950, trustScore: 95, isGovernmentApproved: true, facilities: ['Ganga View', 'Yoga Classes', 'Pure Veg'] },

  // Udaipur
  { id: 'h27', destination: 'Udaipur', name: "Lake Pichola Haveli Inn", pricePerNight: 2300, trustScore: 96, isGovernmentApproved: true, facilities: ['Lake View', 'Rooftop Dining', 'AC'] },

  // Alleppey
  { id: 'h28', destination: 'Alleppey', name: "Backwater Houseboat Stay", pricePerNight: 3200, trustScore: 97, isGovernmentApproved: true, facilities: ['Private Boat', 'Meals Included', 'AC'] },

  // Pondicherry
  { id: 'h29', destination: 'Pondicherry', name: "French Quarter Colonial Heritage Inn", pricePerNight: 1800, trustScore: 94, isGovernmentApproved: true, facilities: ['Colonial Architecture', 'Cafe'] },

  // Agra
  { id: 'h30', destination: 'Agra', name: "Taj View Heritage Homestay", pricePerNight: 1300, trustScore: 92, isGovernmentApproved: true, facilities: ['Taj Mahal View Rooftop', 'AC'] }
];

export const MOCK_RESTAURANTS = [
  { id: 'r1', destination: 'Hampi', name: "Mango Tree Cuisine Hampi", averageMealCost: 200, trustScore: 92 },
  { id: 'r2', destination: 'Hampi', name: "Vithala Udupi Diner", averageMealCost: 120, trustScore: 88 },
  { id: 'r10', destination: 'Hampi', name: "Virupaksha Thali House", averageMealCost: 90, trustScore: 94 },
  
  { id: 'r3', destination: 'Araku Valley', name: "Bamboo Chicken Kitchen", averageMealCost: 150, trustScore: 90 },
  { id: 'r11', destination: 'Araku Valley', name: "Araku Valley Organic Coffee & Eats", averageMealCost: 110, trustScore: 93 },

  { id: 'r4', destination: 'Tirupati', name: "Govinda Pure Veg Thali", averageMealCost: 100, trustScore: 95 },
  { id: 'r12', destination: 'Tirupati', name: "Bhimas Traditional Tiffins", averageMealCost: 70, trustScore: 96 },

  { id: 'r5', destination: 'Varanasi', name: "Kashi Cafe & Diner", averageMealCost: 150, trustScore: 93 },
  { id: 'r13', destination: 'Varanasi', name: "Banaras Chat & Lassi Corner", averageMealCost: 80, trustScore: 97 },

  { id: 'r6', destination: 'Coorg', name: "Coorgi Plantation Kitchen", averageMealCost: 180, trustScore: 91 },
  { id: 'r14', destination: 'Coorg', name: "Madikeri Spice & Curry House", averageMealCost: 140, trustScore: 90 },

  { id: 'r7', destination: 'Jaipur', name: "Laxmi Heritage Bhojanalaya", averageMealCost: 220, trustScore: 94 },
  { id: 'r15', destination: 'Jaipur', name: "Rawat Kachori & Sweets", averageMealCost: 90, trustScore: 98 },

  { id: 'r8', destination: 'Munnar', name: "Tea Valley Restaurant", averageMealCost: 160, trustScore: 93 },
  { id: 'r9', destination: 'Varkala', name: "Varkala Sunset Cafe", averageMealCost: 190, trustScore: 92 },

  { id: 'r16', destination: 'Goa', name: "Brittos Beach Shack & Grill", averageMealCost: 250, trustScore: 93 },
  { id: 'r17', destination: 'Ooty', name: "Nilgiri Bakery & Tea Room", averageMealCost: 110, trustScore: 92 },
  { id: 'r18', destination: 'Rishikesh', name: "Chotiwala Pure Veg Restaurant", averageMealCost: 130, trustScore: 95 },
  { id: 'r19', destination: 'Udaipur', name: "Ambrai Lakeview Thali", averageMealCost: 280, trustScore: 96 },
  { id: 'r20', destination: 'Alleppey', name: "Kerala Fish & Toddy Shop Eats", averageMealCost: 170, trustScore: 94 },
  { id: 'r21', destination: 'Pondicherry', name: "Cafe Des Arts French Bakery", averageMealCost: 190, trustScore: 95 },
  { id: 'r22', destination: 'Agra', name: "Parcha Mughlai & Bedai Corner", averageMealCost: 120, trustScore: 93 }
];

export const MOCK_GUIDES = [
  { id: 'g1', destination: 'Hampi', name: "Ramesh Hampi Heritage Guide", pricePerDay: 800, trustScore: 95, languages: ['English', 'Hindi', 'Kannada'] },
  { id: 'g9', destination: 'Hampi', name: "Vidyaranya Vijayanagara Expert", pricePerDay: 1100, trustScore: 97, languages: ['English', 'Telugu', 'French'] },
  
  { id: 'g2', destination: 'Araku Valley', name: "Kiran Tribal Caves Guide", pricePerDay: 600, trustScore: 89, languages: ['Telugu', 'Hindi'] },
  { id: 'g3', destination: 'Tirupati', name: "Prasad Devasthanam Guide", pricePerDay: 500, trustScore: 91, languages: ['Telugu', 'Tamil', 'English'] },
  { id: 'g4', destination: 'Varanasi', name: "Ganga Ghats Ritual Guide", pricePerDay: 700, trustScore: 96, languages: ['Hindi', 'English', 'Sanskrit'] },
  { id: 'g5', destination: 'Jaipur', name: "Amer Fort Heritage Guide", pricePerDay: 900, trustScore: 94, languages: ['Hindi', 'English', 'German'] },
  { id: 'g6', destination: 'Coorg', name: "Somanna Coorg Plantation Guide", pricePerDay: 700, trustScore: 92, languages: ['Kannada', 'English'] },
  { id: 'g7', destination: 'Munnar', name: "Raju Munnar Trekking Guide", pricePerDay: 600, trustScore: 93, languages: ['Malayalam', 'English'] },
  { id: 'g8', destination: 'Varkala', name: "Sajid Varkala Surf & Cliff Guide", pricePerDay: 800, trustScore: 94, languages: ['Malayalam', 'English'] },
  { id: 'g10', destination: 'Goa', name: "Mario Heritage & Spice Plantation Guide", pricePerDay: 850, trustScore: 93, languages: ['English', 'Konkani', 'Hindi'] },
  { id: 'g11', destination: 'Rishikesh', name: "Yogi Anand Rafting & Yoga Guide", pricePerDay: 650, trustScore: 96, languages: ['Hindi', 'English'] },
  { id: 'g12', destination: 'Udaipur', name: "Vikram City Palace Guide", pricePerDay: 950, trustScore: 95, languages: ['Hindi', 'English', 'Spanish'] },
  { id: 'g13', destination: 'Alleppey', name: "Unni Backwater Canal Guide", pricePerDay: 600, trustScore: 94, languages: ['Malayalam', 'English'] },
  { id: 'g14', destination: 'Agra', name: "Sharma Taj Mahal Historian", pricePerDay: 900, trustScore: 97, languages: ['Hindi', 'English', 'Japanese'] }
];

export const MOCK_TRANSPORTS = [
  // Hampi
  { id: 't1', source: 'Hyderabad', destination: 'Hampi', type: 'Express Train (SL/3A)', pricePerSeat: 350 },
  { id: 't2', source: 'Hyderabad', destination: 'Hampi', type: 'AC Sleeper Bus', pricePerSeat: 800 },
  { id: 't3', source: 'Hyderabad', destination: 'Hampi', type: 'Flight (Jindal Vijaynagar)', pricePerSeat: 4200 },
  { id: 't20', source: 'Hyderabad', destination: 'Hampi', type: 'Own Hatchback (Fuel + FASTag)', pricePerSeat: 500 },
  { id: 't21', source: 'Hyderabad', destination: 'Hampi', type: 'Electric Vehicle (EV Charging Corridor)', pricePerSeat: 300 },

  // Araku Valley
  { id: 't4', source: 'Hyderabad', destination: 'Araku Valley', type: 'Vistadome Scenic Train', pricePerSeat: 400 },
  { id: 't5', source: 'Hyderabad', destination: 'Araku Valley', type: 'Volvo AC Bus', pricePerSeat: 900 },
  { id: 't22', source: 'Hyderabad', destination: 'Araku Valley', type: 'Own SUV / 7-Seater', pricePerSeat: 600 },

  // Tirupati
  { id: 't6', source: 'Hyderabad', destination: 'Tirupati', type: 'Vande Bharat Express', pricePerSeat: 950 },
  { id: 't7', source: 'Hyderabad', destination: 'Tirupati', type: 'Superfast Express Train', pricePerSeat: 380 },
  { id: 't23', source: 'Hyderabad', destination: 'Tirupati', type: 'Direct RTC Deluxe Bus', pricePerSeat: 650 },

  // Varanasi
  { id: 't8', source: 'Hyderabad', destination: 'Varanasi', type: 'SF Express Train (3A)', pricePerSeat: 1250 },
  { id: 't9', source: 'Hyderabad', destination: 'Varanasi', type: 'Non-stop Flight', pricePerSeat: 4800 },

  // Coorg
  { id: 't11', source: 'Hyderabad', destination: 'Coorg', type: 'Train + Cab via Mysuru', pricePerSeat: 850 },
  { id: 't12', source: 'Hyderabad', destination: 'Coorg', type: 'Direct Sleeper Bus', pricePerSeat: 1100 },

  // Jaipur
  { id: 't13', source: 'Hyderabad', destination: 'Jaipur', type: 'Express Train (2A/3A)', pricePerSeat: 1450 },
  { id: 't15', source: 'Hyderabad', destination: 'Jaipur', type: 'Direct Flight', pricePerSeat: 5400 }
];
