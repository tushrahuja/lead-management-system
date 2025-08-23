const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
const Lead = require('../models/Lead');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
    try {
        // Delete existing data
        await Lead.deleteMany({});
        await User.deleteMany({});
        console.log('Existing data cleared');

        // Create test user
        const testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('Test user created');

        // Create fake leads
        const leads = [];
        const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
        const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];

        for (let i = 0; i < 150; i++) {
            leads.push({
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                company: faker.company.name(),
                city: faker.location.city(),
                state: faker.location.state(),
                email: faker.internet.email(),
                phone: faker.phone.number(),
                source: faker.helpers.arrayElement(sources),
                status: faker.helpers.arrayElement(statuses),
                score: faker.number.int({ min: 0, max: 100 }),
                lead_value: faker.number.int({ min: 1000, max: 50000 }),
                last_activity_at: faker.date.recent({ days: 30 }),
                is_qualified: faker.datatype.boolean()
            });
        }

        await Lead.insertMany(leads);
        console.log(`${leads.length} leads created successfully`);

    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

// Run the seed function
seedData().then(() => {
    mongoose.disconnect();
    console.log('Database seeding completed');
});
