import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_DB_PATH = path.join(__dirname, '../data/db.json');

// Memory DB collections for YatraSetu
let memoryDb = {
  users: [],
  vendors: [],
  destinations: [],
  hotels: [],
  restaurants: [],
  guides: [],
  transports: [],
  verifications: [],
  reviews: [],
  trustScores: [],
  trips: [],
  itineraries: [],
  bookings: [],
  payments: [],
  complaints: [],
  notifications: []
};

export let isUsingMongo = false;

const ensureDataFolder = () => {
  const dir = path.dirname(JSON_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(JSON_DB_PATH)) {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(memoryDb, null, 2));
  } else {
    try {
      const content = fs.readFileSync(JSON_DB_PATH, 'utf-8');
      memoryDb = JSON.parse(content);
    } catch (e) {
      console.warn("Could not parse db.json, using fresh in-memory storage.");
    }
  }
};

export const connectDB = async () => {
  ensureDataFolder();
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yatrasetu';
  
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 50,
      minPoolSize: 10,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    isUsingMongo = true;
    console.log("✓ MongoDB Connected successfully.");
  } catch (err) {
    isUsingMongo = false;
    console.log("⚠ MongoDB connection failed. Falling back to local JSON adapter.");
    console.log(`  Data folder bound to: ${JSON_DB_PATH}`);
  }
};

process.on('SIGTERM', async () => {
  if (mongoose.connection) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

const collectionToModel = {
  users: 'User',
  vendors: 'Vendor',
  destinations: 'Destination',
  hotels: 'Hotel',
  restaurants: 'Restaurant',
  guides: 'Guide',
  transports: 'Transport',
  verifications: 'Verification',
  reviews: 'Review',
  trustScores: 'TrustScore',
  trips: 'Trip',
  itineraries: 'Itinerary',
  bookings: 'Booking',
  payments: 'Payment',
  complaints: 'Complaint',
  notifications: 'Notification'
};

export const dbAdapter = {
  async find(collection, query = {}) {
    if (isUsingMongo) {
      const modelName = collectionToModel[collection] || collection;
      const Model = mongoose.model(modelName);
      return await Model.find(query).lean();
    }
    
    ensureDataFolder();
    let records = memoryDb[collection] || [];
    return records.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  async findOne(collection, query = {}) {
    const results = await this.find(collection, query);
    return results[0] || null;
  },

  async create(collection, document) {
    if (isUsingMongo) {
      const modelName = collectionToModel[collection] || collection;
      const Model = mongoose.model(modelName);
      const doc = new Model(document);
      const saved = await doc.save();
      return saved.toObject();
    }

    ensureDataFolder();
    if (!memoryDb[collection]) memoryDb[collection] = [];
    
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      ...document
    };
    
    memoryDb[collection].push(newDoc);
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(memoryDb, null, 2));
    return newDoc;
  },

  async findByIdAndUpdate(collection, id, update) {
    if (isUsingMongo) {
      const modelName = collectionToModel[collection] || collection;
      const Model = mongoose.model(modelName);
      return await Model.findByIdAndUpdate(id, update, { new: true }).lean();
    }

    ensureDataFolder();
    const list = memoryDb[collection] || [];
    const idx = list.findIndex(item => item._id === id || item.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...update, updatedAt: new Date().toISOString() };
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(memoryDb, null, 2));
      return list[idx];
    }
    return null;
  },

  async resetJSON() {
    ensureDataFolder();
    memoryDb = {
      users: [],
      vendors: [],
      destinations: [],
      hotels: [],
      restaurants: [],
      guides: [],
      transports: [],
      verifications: [],
      reviews: [],
      trustScores: [],
      trips: [],
      itineraries: [],
      bookings: [],
      payments: [],
      complaints: [],
      notifications: []
    };
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(memoryDb, null, 2));
  },

  async findWithOptions(collection, query = {}, options = {}) {
    if (isUsingMongo) {
      const modelName = collectionToModel[collection] || collection;
      const Model = mongoose.model(modelName);
      let q = Model.find(query);
      if (options.sort) q = q.sort(options.sort);
      if (options.limit) q = q.limit(options.limit);
      if (options.skip) q = q.skip(options.skip);
      if (options.select) q = q.select(options.select);
      return await q.lean();
    }
    
    let records = memoryDb[collection] || [];
    let filtered = records.filter(item => {
      for (let key in query) {
        if (query[key]?.$ne !== undefined) {
          if (item[key] === query[key].$ne) return false;
        } else if (query[key]?.$in) {
          if (!query[key].$in.includes(item[key])) return false;
        } else if (query[key]?.$gte !== undefined || query[key]?.$lte !== undefined) {
          if (query[key].$gte !== undefined && item[key] < query[key].$gte) return false;
          if (query[key].$lte !== undefined && item[key] > query[key].$lte) return false;
        } else {
          if (item[key] !== query[key]) return false;
        }
      }
      return true;
    });
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortDir = options.sort[sortKey];
      filtered.sort((a, b) => (a[sortKey] > b[sortKey] ? sortDir : -sortDir));
    }
    if (options.skip) filtered = filtered.slice(options.skip);
    if (options.limit) filtered = filtered.slice(0, options.limit);
    return filtered;
  }
};
