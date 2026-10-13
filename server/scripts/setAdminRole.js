import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import dns from 'dns';

// Ensure reliable SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['customer', 'manager', 'admin'], default: 'customer' },
  passwordHash: { type: String },
  phone: { type: String },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: String },
}, { timestamps: true });

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

const ADMIN_EMAILS = [
  { email: 'himanshu0481@gmail.com', name: 'Himanshu Saini', phone: '+91 93066 80944' },
  { email: 'sales.velneer@gmail.com', name: 'Velneer Sales Admin', phone: '+91 74949 80621' },
];

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log('Connected to MongoDB Atlas!');

  for (const adminInfo of ADMIN_EMAILS) {
    const targetEmail = adminInfo.email.toLowerCase();
    let user = await UserModel.findOne({ email: targetEmail });

    if (user) {
      console.log(`Found existing user with email ${targetEmail}: updating role to 'admin'...`);
      user.role = 'admin';
      user.isActive = true;
      await user.save();
      console.log(`Successfully updated ${targetEmail} to role: 'admin'!`);
    } else {
      console.log(`User ${targetEmail} does not exist in MongoDB. Creating new Admin user...`);
      const passwordHash = bcrypt.hashSync('Velneer@2026', 10);
      const newAdmin = new UserModel({
        id: `usr-admin-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
        name: adminInfo.name,
        email: targetEmail,
        role: 'admin',
        passwordHash,
        phone: adminInfo.phone,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      });
      await newAdmin.save();
      console.log(`Successfully created new Admin user ${targetEmail} with default password 'Velneer@2026'!`);
    }
  }

  // Verify all admin users currently in the database
  const allAdmins = await UserModel.find({ role: 'admin' }, 'name email role phone').lean();
  console.log('\nCurrent Admins in MongoDB Atlas:');
  console.table(allAdmins);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

run().catch((err) => {
  console.error('Error running setAdminRole:', err);
  process.exit(1);
});
