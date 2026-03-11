const { MongoClient } = require('mongodb');

const DB_URI = 'mongodb+srv://abishek:abishek@cluster0.q0wshjh.mongodb.net/light-of-india?retryWrites=true&w=majority&appName=Cluster0';

async function addSecondAdmin() {
  const client = new MongoClient(DB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('light-of-india');
    const adminsCollection = db.collection('admins');
    
    // Find the existing admin to copy the password hash
    const existingAdmin = await adminsCollection.findOne({ email: 'test@webciters.com' });
    
    if (!existingAdmin) {
      console.log('Existing admin test@webciters.com not found');
      return;
    }
    
    console.log('Found existing admin:', existingAdmin.email);
    
    // Check if zafar@lightofindia.nl already exists
    const zafarAdmin = await adminsCollection.findOne({ email: 'zafar@lightofindia.nl' });
    if (zafarAdmin) {
      console.log('Admin zafar@lightofindia.nl already exists!');
      return;
    }
    
    // Create new admin with same password hash
    const newAdmin = {
      email: 'zafar@lightofindia.nl',
      password: existingAdmin.password, // Same hashed password
      name: 'Zafar',
      role: existingAdmin.role || 'super_admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await adminsCollection.insertOne(newAdmin);
    
    if (result.insertedId) {
      console.log('Successfully created admin zafar@lightofindia.nl');
      console.log('Both accounts can now login with the same password');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

addSecondAdmin();
